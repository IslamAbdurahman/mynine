import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from 'flowbite-react';
import { RxAvatar } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';
import AttemptsChart from '@/components/attempt/attempt-chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard'
    }
];

export default function Dashboard() {
    const { user } = usePage<{ user: User }>().props;
    const { t } = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Top stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Attempts count */}
                    <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                {t('totalAttempts')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                {user.attempts_count_this_month}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('completedTests')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Last Attempt breakdown */}
                    <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                {t('lastAttempt')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user?.last_attempt?.attempt_types.map((type) => {
                                const score =
                                    type.type.name === 'Writing'
                                        ? Number(type.is_correct_count ?? 0) / 2
                                        : type.is_correct_count;

                                return (
                                    <div key={type.id} className="flex flex-col">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{type.type.name}</span>
                                            <span>{score}</span>
                                        </div>
                                        <Progress
                                            progress={score * 2.5}
                                            size="sm"
                                            color="blue"
                                            className="mt-2"
                                        />
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Profile card */}
                    <Card className="rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                {t('sidebar.profile')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-14 h-14 rounded-full object-cover border"
                                    />
                                ) : (
                                    <RxAvatar className="w-14 h-14 text-gray-400" />
                                )}
                                <div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder big section */}
                <div
                    className="relative min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-inner">

                    <AttemptsChart attempts={user.attempts ?? []} />

                </div>
            </div>
        </AppLayout>
    );
}
