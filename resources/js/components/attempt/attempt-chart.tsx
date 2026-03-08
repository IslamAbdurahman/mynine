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
        label: type,
        data: attempts.map(
            a =>
                a.attempt_types.find(t => t.type.name === type)?.is_correct_count ?? 0
        ),
        backgroundColor:
            type === 'Reading'
                ? 'rgba(59, 130, 246, 0.7)'   // blue-500
                : type === 'Writing'
                    ? 'rgba(239, 68, 68, 0.7)'  // red-500
                    : type === 'Listening'
                        ? 'rgba(34, 197, 94, 0.7)' // green-500
                        : 'rgba(147, 197, 253, 0.7)' // lighter blue (fallback)
    }));


    const data = {
        labels,
        datasets
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: t('chartTitle'), // faqat bu tarjimada bo‘ladi
            }
        }
    };

    return <Bar data={data} options={options} height={100} />;

}
