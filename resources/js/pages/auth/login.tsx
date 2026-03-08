import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import LanguageBar from '@/components/language';
import TextLink from '@/components/text-link';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import LoginCard from '@/components/auth/login-card';
import {  User } from '@/types';
import { useEffect } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const {  auth } = usePage<{
        auth: User
    }>().props;

    const { t } = useTranslation();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        tg?.ready();
        tg?.expand();

        const user = tg?.initDataUnsafe?.user;

        // ✅ Prevent multiple login attempts if user already logged in
        if (!auth?.user && user) {
            fetch('/webapp-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(user)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.redirect) {
                        router.visit(data.redirect);
                    }
                })
                .catch(err => console.error('Telegram WebApp login error:', err));
        }
    }, [auth?.user]);

    return (
        <AuthLayout title={t('login.title')} description={t('login.description')}>
            <Head title={t('login.submit')} />

            <LanguageBar />

            <LoginCard />


            <div className="flex items-center">
                <Label htmlFor="password">{t('login.password')}</Label>
                {canResetPassword && (
                    <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                        {t('login.forgot')}
                    </TextLink>
                )}
            </div>

            {status &&
                <div className="mb-4 text-center text-sm font-medium text-green-600">{t('login.status_success')}</div>}
        </AuthLayout>
    );
}
