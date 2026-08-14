import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ExamIntegrityOptions {
    attemptId: number;
    enabled?: boolean;
    initialViolations?: number;
    onViolation?: (count: number) => void;
}

export function useExamIntegrity({
    attemptId,
    enabled = true,
    initialViolations = 0,
    onViolation,
}: ExamIntegrityOptions) {
    const [violationsCount, setViolationsCount] = useState<number>(initialViolations);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
    const lastBlurTime = useRef<number>(0);

    const recordViolation = useCallback(async (newCount: number) => {
        setViolationsCount(newCount);
        if (onViolation) onViolation(newCount);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            await fetch(`/practice-attempt-violation/${attemptId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ count: 1 }),
            });
        } catch (e) {
            console.error('[ExamIntegrity] Failed to report violation:', e);
        }
    }, [attemptId, onViolation]);

    const handleTabLeave = useCallback(() => {
        if (!enabled) return;
        const now = Date.now();
        // Debounce triggers (avoid double count within 1 second)
        if (now - lastBlurTime.current < 1000) return;
        lastBlurTime.current = now;

        setViolationsCount((prev) => {
            const next = prev + 1;
            recordViolation(next);
            return next;
        });

        setShowWarningModal(true);
        toast.warning(`Diqqat! Imtihon oynasini tark etish taqiqlanadi. Qoidabuzarlik qayd etildi!`, {
            duration: 5000,
        });
    }, [enabled, recordViolation]);

    // Track tab visibility and blur
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleTabLeave();
            }
        };

        const handleWindowBlur = () => {
            handleTabLeave();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [enabled, handleTabLeave]);

    // Track Fullscreen state
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const checkFullscreen = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', checkFullscreen);
        return () => document.removeEventListener('fullscreenchange', checkFullscreen);
    }, []);

    const requestFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            }
        } catch (e) {
            console.warn('[ExamIntegrity] Fullscreen request failed:', e);
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (e) {
            console.warn('[ExamIntegrity] Exit fullscreen failed:', e);
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            requestFullscreen();
        }
    }, [isFullscreen, exitFullscreen, requestFullscreen]);

    return {
        violationsCount,
        isFullscreen,
        showWarningModal,
        closeWarningModal: () => setShowWarningModal(false),
        requestFullscreen,
        exitFullscreen,
        toggleFullscreen,
    };
}
