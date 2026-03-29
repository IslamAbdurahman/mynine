import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { StatItem } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    dailyUsers: StatItem[];
    dailyAttempts: StatItem[];
}

export default function DailyStatsChart({ dailyUsers, dailyAttempts }: Props) {
    // Generate dates based on the available data
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

    const data = {
        labels,
        datasets: [
            {
                label: 'New Users',
                data: newUsersData,
                backgroundColor: 'rgb(99, 102, 241)', // indigo
                stack: 'Stack 0',
                borderRadius: 4
            },
            {
                label: 'Unique Attempt Users',
                data: uniqueAttemptUsersData,
                backgroundColor: 'rgb(16, 185, 129)', // emerald
                stack: 'Stack 1',
                borderRadius: 4
            },
            {
                label: 'Repeat Attempts',
                data: repeatAttemptsData,
                backgroundColor: 'rgba(20, 184, 166, 0.6)', // teal 60% opacity
                stack: 'Stack 1',
                borderRadius: 4
            }
        ]
    };

    const formatLabel = (value: number) => {
        if (value > 99) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value.toString();
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                callbacks: {
                    footer: (tooltipItems: any) => {
                        let total = 0;
                        tooltipItems.forEach((tooltipItem: any) => {
                            if (tooltipItem.dataset.label.includes('Attempt')) {
                                total += tooltipItem.raw;
                            }
                        });
                        return total > 0 ? `Total Attempts: ${total}` : '';
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { size: 11 } }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 } }
            }
        }
    };

    return (
        <div className="w-full" style={{ height: '340px' }}>
            <Bar data={data} options={options} />
        </div>
    );
}
