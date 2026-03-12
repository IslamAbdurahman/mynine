import { AppBottomNav } from '@/components/app-bottom-nav';
import CreateAttemptModal from '@/components/attempt/create-attempt-modal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Courses from '@/components/Home/Courses';
import Hero from '@/components/Home/Hero';
import { Mock, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function Welcome() {
    const { mock, auth } = usePage<{
        auth: User;
        mock: Mock;
    }>().props;

    const { t } = useTranslation(); // Using the translation hook

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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(user),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.redirect) {
                        router.visit(data.redirect);
                    }
                })
                .catch((err) => console.error('Telegram WebApp login error:', err));
        }
    }, [auth?.user]);

    return (
        <>
            <Head title={t('seo.welcome_title')}>
                <meta name="description" content={t('seo.welcome_description')} />
                <meta name="keywords" content={t('seo.welcome_keywords')} />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div>
                {/*<header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">*/}
                {/*    <nav className="flex items-center justify-end gap-4">*/}
                {/*        {auth.user ? (*/}
                {/*            <Link*/}
                {/*                href={route('dashboard')}*/}
                {/*                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"*/}
                {/*            >*/}
                {/*                Dashboard*/}
                {/*            </Link>*/}
                {/*        ) : (*/}
                {/*            <>*/}
                {/*                <Link*/}
                {/*                    href={route('login')}*/}
                {/*                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"*/}
                {/*                >*/}
                {/*                    Log in*/}
                {/*                </Link>*/}
                {/*                <Link*/}
                {/*                    href={route('register')}*/}
                {/*                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"*/}
                {/*                >*/}
                {/*                    Register*/}
                {/*                </Link>*/}
                {/*            </>*/}
                {/*        )}*/}
                {/*    </nav>*/}
                {/*</header>*/}

                <div>
                    <Header />
                    {!mock && (
                        <div>
                            <Hero />

                            <div className={'container mx-auto mb-20 px-6'} id="tests">
                                {/* Heading */}
                                <div className="mt-20 mb-8 items-end justify-between flex flex-wrap gap-6">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            {t('landing.popular_tests')} <span className="text-primary">{t('landing.tests_accent')}</span>
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('landing.explore_desc')}</p>
                                    </div>
                                    <Link
                                        href={route('all-test.index')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        {t('landing.explore_all')}
                                        <Icon icon="solar:round-alt-arrow-right-bold" className="size-5" />
                                    </Link>
                                </div>

                                <Courses />
                            </div>
                        </div>
                    )}

                    {mock && (
                        <div className={'mt-32 flex items-center justify-center px-6'}>
                            <div className="group relative w-full max-w-md rounded-[2.5rem] bg-white dark:bg-gray-900 p-4 shadow-2xl transition-all duration-500 hover:-translate-y-2 dark:shadow-blue-900/10 border border-gray-100 dark:border-white/5">
                                {/* Image Section */}
                                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-gray-50 dark:bg-black/20">
                                    <img
                                        src="/images/courses/coursethree.png"
                                        alt={mock.test.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute right-4 bottom-4 transition-transform duration-500 group-hover:translate-x-1 shadow-2xl scale-110">
                                        <CreateAttemptModal mock={mock} test={mock.test} />
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-primary text-xs font-black rounded-xl uppercase tracking-widest shadow-lg">
                                            {t('mock')}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="px-6 py-8 space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                            {mock.test.folder.name} : {mock.test.name}
                                        </h3>
                                        <div className="h-1 w-12 bg-primary/30 rounded-full" />
                                    </div>

                                    <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                                <Icon icon="solar:calendar-date-bold-duotone" className="text-primary size-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('started_at')}</span>
                                                <span className="text-sm font-bold">{format(mock.started_at, 'yyyy-MMM-dd HH:mm')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                                <Icon icon="solar:clock-circle-bold-duotone" className="text-red-500 size-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('finished_at')}</span>
                                                <span className="text-sm font-bold">{format(mock.finished_at, 'yyyy-MMM-dd HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Background Elements */}
                                <div className="absolute -z-10 top-1/2 -right-10 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
                                <div className="absolute -z-10 bottom-0 -left-10 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                            </div>
                        </div>
                    )}
                </div>

                <Footer />

                <AppBottomNav />
            </div>
        </>
    );
}
