import LoginCard from '@/components/auth/login-card';
import RegisterCard from '@/components/auth/register-card';
import LanguageBar from '@/components/language';
import FindMockModal from '@/components/mock/find-mock-modal';
import type { SharedData } from '@/types';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import HeaderLink from '../Header/Navigation/HeaderLink';
import { headerData } from '../Header/Navigation/menuData';
import MobileHeaderLink from '../Header/Navigation/MobileHeaderLink';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const [navbarOpen, setNavbarOpen] = useState(false);
    const [sticky, setSticky] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const signInRef = useRef<HTMLDivElement>(null);
    const signUpRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const { auth } = usePage<SharedData>().props;

    const handleScroll = () => {
        setSticky(window.scrollY >= 80);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
            setIsSignInOpen(false);
        }
        if (signUpRef.current && !signUpRef.current.contains(event.target as Node)) {
            setIsSignUpOpen(false);
        }
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
            setNavbarOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarOpen, isSignInOpen, isSignUpOpen]);

    useEffect(() => {
        document.body.style.overflow = isSignInOpen || isSignUpOpen || navbarOpen ? 'hidden' : '';
    }, [isSignInOpen, isSignUpOpen, navbarOpen]);

    return (
        <header
            className={`fixed top-0 z-40 w-full bg-white transition-all duration-300 dark:bg-gray-900 ${sticky ? 'py-4 shadow-lg' : 'py-5 shadow-none'}`}
        >
            <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
                <div className="flex items-center justify-between">
                    <Logo />

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center lg:gap-6 xl:gap-8 lg:flex">
                        <div className="flex items-center lg:gap-6 xl:gap-8">
                            {headerData.map((item) => (
                                <HeaderLink key={item.label} item={item} />
                            ))}
                            <FindMockModal />
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                        <LanguageBar />

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-indigo-600"
                                >
                                    <Icon icon="tabler:layout-dashboard" className="text-lg" />
                                    {t('header.dashboard')}
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <button
                                        className="px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400"
                                        onClick={() => setIsSignInOpen(true)}
                                    >
                                        {t('header.sign_in')}
                                    </button>

                                    <button
                                        className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95"
                                        onClick={() => setIsSignUpOpen(true)}
                                    >
                                        {t('header.sign_up')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Mobile Controls (Always visible on mobile) */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <LanguageBar />
                        <button
                            onClick={() => setNavbarOpen(!navbarOpen)}
                            className="block rounded-lg p-2 focus:outline-none"
                            aria-label="Toggle Menu"
                        >
                            <div className="space-y-1.5">
                                <span
                                    className={`block h-0.5 w-6 bg-black transition-all dark:bg-white ${navbarOpen ? 'translate-y-2 rotate-45' : ''}`}
                                />
                                <span className={`block h-0.5 w-6 bg-black transition-all dark:bg-white ${navbarOpen ? 'opacity-0' : ''}`} />
                                <span
                                    className={`block h-0.5 w-6 bg-black transition-all dark:bg-white ${navbarOpen ? '-translate-y-2 -rotate-45' : ''}`}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals for Auth */}
            {isSignInOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div
                        ref={signInRef}
                        className="relative mx-auto w-full max-w-md"
                    >
                        <button onClick={() => setIsSignInOpen(false)} className="absolute z-10 top-4 right-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-full p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <Icon icon="tabler:x" className="text-xl text-gray-600 dark:text-gray-300" />
                        </button>
                        <LoginCard />
                    </div>
                </div>
            )}

            {isSignUpOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div
                        ref={signUpRef}
                        className="relative mx-auto w-full max-w-md"
                    >
                        <button onClick={() => setIsSignUpOpen(false)} className="absolute z-10 top-4 right-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-full p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <Icon icon="tabler:x" className="text-xl text-gray-600 dark:text-gray-300" />
                        </button>
                        <RegisterCard />
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            {navbarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setNavbarOpen(false)} />}

            <div
                ref={mobileMenuRef}
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-xs transform bg-white shadow-xl transition-transform duration-300 lg:hidden dark:bg-gray-900 ${navbarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-6">
                    <Logo />
                    <button onClick={() => setNavbarOpen(false)} className="p-2">
                        <Icon icon="tabler:x" className="text-2xl text-gray-900 dark:text-white" />
                    </button>
                </div>

                <nav className="flex flex-col space-y-2 p-6">
                    {headerData.map((item) => (
                        <MobileHeaderLink key={item.label} item={item} />
                    ))}

                    <div className="pt-6">
                        <FindMockModal />
                    </div>

                    <hr className="my-4 border-slate-100 dark:border-slate-800" />

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-bold text-white dark:bg-indigo-600"
                        >
                            {t('header.dashboard')}
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                className="w-full rounded-xl border border-slate-200 py-3 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                                onClick={() => {
                                    setIsSignInOpen(true);
                                    setNavbarOpen(false);
                                }}
                            >
                                {t('header.sign_in')}
                            </button>
                            <button
                                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
                                onClick={() => {
                                    setIsSignUpOpen(true);
                                    setNavbarOpen(false);
                                }}
                            >
                                {t('header.sign_up')}
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
