import React from 'react';
import Chart from 'react-apexcharts';
import { StatItem } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    dailyUsers: StatItem[];
    dailyAttempts: StatItem[];
}

export default function DailyStatsChart({ dailyUsers, dailyAttempts }: Props) {
    const { appearance } = useAppearance();

    const allDates = Array.from(new Set([
        ...dailyUsers.map(d => d.day_date),
        ...dailyAttempts.map(d => d.day_date)
    ])).sort();

    const labels = allDates.map(date => 
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const newUsersData = allDates.map(date => {
        const item = dailyUsers.find(d => d.day_date === date);
        return item ? Number(item.items_count) : 0;
    });

    const uniqueAttemptUsersData = allDates.map(date => {
        const item = dailyAttempts.find(d => d.day_date === date);
        return item && item.unique_users_count ? Number(item.unique_users_count) : 0;
    });

    const repeatAttemptsData = allDates.map(date => {
        const item = dailyAttempts.find(d => d.day_date === date);
        const total = item ? Number(item.items_count) : 0;
        const unique = item && item.unique_users_count ? Number(item.unique_users_count) : 0;
        return Math.max(0, total - unique);
    });

    const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'inherit',
            background: 'transparent',
        },
        theme: {
            mode: isDark ? 'dark' : 'light'
        },
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: '60%',
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            labels: {
                style: { colors: '#94a3b8', fontSize: '12px' }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8', fontSize: '12px' }
            }
        },
        grid: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            strokeDashArray: 4,
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontFamily: 'inherit',
            markers: { size: 4 },
        },
        colors: ['#6366f1', '#10b981', '#14b8a6'],
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        }
    };

    const series = [
        { name: 'New Users', data: newUsersData },
        { name: 'Unique Attempt Users', data: uniqueAttemptUsersData },
        { name: 'Repeat Attempts', data: repeatAttemptsData }
    ];

    return (
        <div className="w-full h-[340px]">
            <Chart options={options} series={series} type="bar" height="100%" />
        </div>
    );
}
