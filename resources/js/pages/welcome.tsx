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
            <Head title="Welcome">
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

                            <div className={'container mx-auto mb-5'} id="tests">
                                {/* Heading */}
                                <div className="mt-10 items-center justify-between sm:flex">
                                    <h2 className="mb-5 text-4xl font-semibold text-gray-900 sm:mb-0 lg:text-5xl dark:text-white">Popular tests.</h2>
                                    <Link
                                        href={route('all-test.index')}
                                        className="text-primary text-lg font-medium duration-500 hover:tracking-widest"
                                    >
                                        Explore tests &nbsp;&gt;&nbsp;
                                    </Link>
                                </div>

                                <Courses />
                            </div>
                        </div>
                    )}

                    {mock && (
                        <div className={'mt-50 flex items-center justify-center'}>
                            <div className="shadow-course-shadow m-3 mb-12 h-full w-100 rounded-2xl bg-white px-3 pt-3 pb-12 dark:bg-gray-900 dark:shadow-gray-800/50">
                                {/* Image */}
                                <div className="relative rounded-3xl">
                                    <img src={`/images/courses/coursethree.png`} alt="course" className="clipPath m-auto" width={389} height={262} />
                                    <div className="absolute right-5 -bottom-15 rounded-full">
                                        <CreateAttemptModal mock={mock} test={mock.test} />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="px-3 pt-6">
                                    <Link href="#" className="inline-block max-w-[75%] text-2xl font-bold text-gray-900 dark:text-white">
                                        {mock.test.folder.name} : {mock.test.name}
                                    </Link>
                                    <h3 className="pt-6 text-base font-normal text-gray-600 dark:text-gray-300"></h3>

                                    <div>
                                        <div>
                                            <span>{t('started_at')}</span> : {format(mock.started_at, 'yyyy-MMM-dd HH:mm')}
                                        </div>
                                        <div>
                                            <span>{t('finished_at')}</span> : {format(mock.finished_at, 'yyyy-MMM-dd HH:mm')}
                                        </div>
                                    </div>
                                </div>
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
