import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
} from 'chart.js';
import { Attempt } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function AttemptsChart({ attempts }: { attempts: Attempt[] }) {
    if (!attempts || attempts.length === 0) return null;

    const labels = attempts.map(a => 
        new Date(a.finished_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    );

    const dataPoints = attempts.map(a => 
        a.attempt_types?.reduce((sum, t) => sum + (Number(t.is_correct_count) || 0), 0) || 0
    );

    const data = {
        labels,
        datasets: [
            {
                data: dataPoints,
                borderColor: 'rgb(99, 102, 241)', // indigo
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // indigo with opacity for fill
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(99, 102, 241)',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1e293b', // dark background
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                displayColors: false,
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
                suggestedMax: Math.max(...dataPoints, 10) * 1.1,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: { size: 11 }
                }
            }
        }
    };

    return (
        <div className="w-full" style={{ height: '280px' }}>
            <Line data={data} options={options} />
        </div>
    );
}
