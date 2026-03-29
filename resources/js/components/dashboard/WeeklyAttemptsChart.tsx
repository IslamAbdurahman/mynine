import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as TitlePlugin,
    Tooltip,
} from 'chart.js';
import { WeeklyStatItem } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, TitlePlugin, Tooltip);

interface Props {
    title: string;
    data: WeeklyStatItem[];
}

export default function WeeklyAttemptsChart({ title, data: chartData }: Props) {
    // 1=Mon, 7=Sun
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const dataPoints = [1, 2, 3, 4, 5, 6, 7].map(dayRaw => {
        const item = chartData.find(d => Number(d.weekday) === dayRaw);
        return item ? Number(item.items_count) : 0;
    });

    const data = {
        labels: weekdays,
        datasets: [
            {
                data: dataPoints,
                backgroundColor: 'rgb(139, 92, 246)', // violet
                borderRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                font: { size: 14, weight: 'bold' },
                color: 'rgba(100, 116, 139, 1)', // slate-500
                padding: { bottom: 16 }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 }, precision: 0 }
            }
        }
    };

    return (
        <div className="w-full" style={{ height: '340px' }}>
            <Bar data={data} options={options as any} />
        </div>
    );
}
