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
import { HourlyStatItem } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, TitlePlugin, Tooltip);

interface Props {
    title: string;
    data: HourlyStatItem[];
}

export default function HourlyAttemptsChart({ title, data: chartData }: Props) {
    // Ensure all 24 hours are represented
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const labels = hours.map(h => `${h.toString().padStart(2, '0')}:00`);
    
    const dataPoints = hours.map(h => {
        const item = chartData.find(d => Number(d.hour) === h);
        return item ? Number(item.items_count) : 0;
    });

    const data = {
        labels,
        datasets: [
            {
                data: dataPoints,
                backgroundColor: 'rgb(59, 130, 246)', // blue
                borderRadius: 4
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
                ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 }
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
