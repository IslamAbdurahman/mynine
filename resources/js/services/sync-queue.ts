/**
 * SyncQueue: Offline-First Answer Synchronization Service
 * Handles queuing, local persistence, retry mechanisms, and network status tracking
 */

export interface QueuedItem {
    id: string;
    attemptId: number;
    partId: number;
    questionId: number;
    answerText?: string | null;
    options?: number[] | null;
    timestamp: number;
    retries: number;
}

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

class SyncQueueService {
    private queue: QueuedItem[] = [];
    private isProcessing: boolean = false;
    private listeners: Set<(status: { status: SyncStatus; pendingCount: number; isOnline: boolean }) => void> = new Set();
    private storageKey = 'mynine_offline_sync_queue';

    constructor() {
        this.loadQueue();
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.notify();
                this.processQueue();
            });
            window.addEventListener('offline', () => {
                this.notify();
            });
        }
    }

    private loadQueue() {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                this.queue = JSON.parse(raw);
            }
        } catch (e) {
            console.error('[SyncQueue] Failed to load queue:', e);
            this.queue = [];
        }
    }

    private saveQueue() {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
        } catch (e) {
            console.error('[SyncQueue] Failed to save queue:', e);
        }
        this.notify();
    }

    public isOnline(): boolean {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    public getPendingCount(attemptId?: number): number {
        if (attemptId) {
            return this.queue.filter(item => item.attemptId === attemptId).length;
        }
        return this.queue.length;
    }

    public subscribe(listener: (status: { status: SyncStatus; pendingCount: number; isOnline: boolean }) => void): () => void {
        this.listeners.add(listener);
        listener(this.getStatus());
        return () => this.listeners.delete(listener);
    }

    public getStatus(): { status: SyncStatus; pendingCount: number; isOnline: boolean } {
        const isOnline = this.isOnline();
        let status: SyncStatus = 'online';
        if (!isOnline) {
            status = 'offline';
        } else if (this.isProcessing) {
            status = 'syncing';
        } else if (this.queue.length > 0) {
            status = 'syncing';
        }

        return {
            status,
            pendingCount: this.queue.length,
            isOnline,
        };
    }

    private notify() {
        const currentStatus = this.getStatus();
        this.listeners.forEach((listener) => listener(currentStatus));
    }

    /**
     * Enqueue a new save request and attempt immediate dispatch
     */
    public async saveAnswer(params: {
        attemptId: number;
        partId: number;
        questionId: number;
        answerText?: string | null;
        options?: number[] | null;
    }): Promise<{ success: boolean; offline?: boolean; error?: string }> {
        const { attemptId, partId, questionId, answerText, options } = params;
        const itemId = `${attemptId}_${partId}_${questionId}`;

        // Deduplicate or replace existing item in queue for same question
        this.queue = this.queue.filter(item => item.id !== itemId);
        const newItem: QueuedItem = {
            id: itemId,
            attemptId,
            partId,
            questionId,
            answerText,
            options,
            timestamp: Date.now(),
            retries: 0,
        };
        this.queue.push(newItem);
        this.saveQueue();

        if (!this.isOnline()) {
            return { success: true, offline: true };
        }

        return this.dispatchItem(newItem);
    }

    private async dispatchItem(item: QueuedItem): Promise<{ success: boolean; offline?: boolean; error?: string }> {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const url = `/attempt-answer?part_id=${item.partId}&attempt_id=${item.attemptId}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    question_id: item.questionId,
                    ...(item.options ? { options: item.options } : { answer_text: item.answerText }),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success !== false) {
                // Remove from queue
                this.queue = this.queue.filter(q => q.id !== item.id);
                this.saveQueue();
                return { success: true };
            } else {
                throw new Error(data?.error || data?.message || 'Server returned an error');
            }
        } catch (error: any) {
            item.retries += 1;
            this.saveQueue();
            return { success: false, error: error.message };
        }
    }

    /**
     * Process all queued items sequentially
     */
    public async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0 || !this.isOnline()) return;

        this.isProcessing = true;
        this.notify();

        const itemsToProcess = [...this.queue];
        for (const item of itemsToProcess) {
            if (!this.isOnline()) break;
            await this.dispatchItem(item);
        }

        this.isProcessing = false;
        this.notify();
    }

    /**
     * Flush all pending sync items for an attempt before submission
     */
    public async flushAttempt(attemptId: number): Promise<boolean> {
        if (!this.isOnline()) return false;
        const attemptItems = this.queue.filter(item => item.attemptId === attemptId);
        for (const item of attemptItems) {
            await this.dispatchItem(item);
        }
        return this.getPendingCount(attemptId) === 0;
    }
}

export const syncQueue = new SyncQueueService();
