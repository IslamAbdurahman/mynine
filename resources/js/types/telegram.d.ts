export {};

declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    query_id?: string;
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        language_code?: string;
                        is_premium?: boolean;
                        photo_url?: string;
                    };
                    auth_date: string;
                    hash: string;
                };
                version: string;
                platform: string;
                colorScheme: 'light' | 'dark';
                themeParams: {
                    bg_color?: string;
                    text_color?: string;
                    hint_color?: string;
                    link_color?: string;
                    button_color?: string;
                    button_text_color?: string;
                    secondary_bg_color?: string;
                    accent_text_color?: string;
                    header_bg_color?: string;
                    section_bg_color?: string;
                    section_header_text_color?: string;
                    subtitle_text_color?: string;
                    destructive_text_color?: string;
                };
                isExpanded: boolean;
                viewportHeight: number;
                viewportStableHeight: number;
                headerColor: string;
                backgroundColor: string;
                isClosingConfirmationEnabled: boolean;
                BackButton: {
                    isVisible: boolean;
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                    offClick: (callback: () => void) => void;
                };
                MainButton: {
                    text: string;
                    color: string;
                    textColor: string;
                    isVisible: boolean;
                    isActive: boolean;
                    isProgressVisible: boolean;
                    setText: (text: string) => void;
                    onClick: (callback: () => void) => void;
                    offClick: (callback: () => void) => void;
                    show: () => void;
                    hide: () => void;
                    enable: () => void;
                    disable: () => void;
                    showProgress: (leaveActive: boolean) => void;
                    hideProgress: () => void;
                    setParams: (params: any) => void;
                };
                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
                    selectionChanged: () => void;
                };
                ready: () => void;
                expand: () => void;
                close: () => void;
                onEvent: (eventType: string, eventHandler: (eventData: any) => void) => void;
                offEvent: (eventType: string, eventHandler: (eventData: any) => void) => void;
                sendData: (data: string) => void;
                switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
                openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
                openTelegramLink: (url: string) => void;
                openInvoice: (url: string, callback?: (status: string) => void) => void;
                readTextFromClipboard: (callback?: (text: string) => void) => void;
                requestWriteAccess: (callback?: (result: boolean) => void) => void;
                requestContact: (callback?: (result: boolean) => void) => void;
                showAlert: (message: string, callback?: () => void) => void;
                showConfirm: (message: string, callback?: (result: boolean) => void) => void;
                showScanQrPopup: (params: { text?: string }, callback?: (text: string) => void) => void;
                closeScanQrPopup: () => void;
                readClipboardText: (callback?: (text: string) => void) => void;
            };
        };
    }
}
