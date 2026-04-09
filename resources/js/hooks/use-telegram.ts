import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Telegram Mini App ichida ekanligini aniqlash
 */
export function isTelegramWebApp(): boolean {
    return !!window.Telegram?.WebApp?.initData;
}

/**
 * Telegram BackButton — ichki sahifalarda orqaga tugmasini ko'rsatish
 */
export function useTelegramBackButton(backUrl?: string) {
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg || !backUrl) return;

        tg.BackButton.show();
        const handler = () => router.visit(backUrl);
        tg.BackButton.onClick(handler);

        return () => {
            tg.BackButton.hide();
        };
    }, [backUrl]);
}

/**
 * Telegram HapticFeedback
 */
export function useTelegramHaptic() {
    const tg = window.Telegram?.WebApp;

    return {
        /** Engil tebranish (tugma bosish) */
        light: () => tg?.HapticFeedback?.impactOccurred('light'),
        /** O'rtacha tebranish (javob tanlash) */
        medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
        /** Kuchli tebranish */
        heavy: () => tg?.HapticFeedback?.impactOccurred('heavy'),
        /** Muvaffaqiyat (to'g'ri javob) */
        success: () => tg?.HapticFeedback?.notificationOccurred('success'),
        /** Xatolik (noto'g'ri javob) */
        error: () => tg?.HapticFeedback?.notificationOccurred('error'),
        /** Ogohlantirish */
        warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
    };
}

/**
 * Initializes the Telegram Mini App by expanding it and configuring swipes.
 */
export function initTelegramWebApp() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.expand();
    
    // Available in SDK 7.7+
    if ((tg as any).disableVerticalSwipes) {
        (tg as any).disableVerticalSwipes();
    }
}
