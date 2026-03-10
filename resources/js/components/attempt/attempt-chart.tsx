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
import { Attempt } from '@/types';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AttemptsChart({ attempts }: { attempts: Attempt[] }) {


    const { t } = useTranslation();

    // Extract labels (attempt dates)
    const labels = attempts.map(a =>
        new Date(a.finished_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    );

    // Build dataset by type
    const types = [
        'Reading',
        'Writing',
        'Listening',
        // 'Speaking'
    ];

    const datasets = types.map(type => ({
        label: t(type.toLowerCase()) || type,
        data: attempts.map(
            a =>
                a.attempt_types.find(t => t.type.name === type)?.is_correct_count ?? 0
        ),
        backgroundColor:
            type === 'Reading'
                ? 'rgba(59, 130, 246, 0.8)'   // blue-500
                : type === 'Writing'
                    ? 'rgba(139, 92, 246, 0.8)'  // violet-500
                    : type === 'Listening'
                        ? 'rgba(16, 185, 129, 0.8)' // emerald-500
                        : 'rgba(245, 158, 11, 0.8)', // amber-500
        borderRadius: 8,
        barThickness: 12,
        maxBarThickness: 20,
    }));


    const data = {
        labels,
        datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: true,
                usePointStyle: true,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 11 }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    stepSize: 10,
                    font: { size: 11 }
                }
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <Bar data={data} options={options as any} />
        </div>
    );

}
