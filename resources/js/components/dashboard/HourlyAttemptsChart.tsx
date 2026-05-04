import React from 'react';
import Chart from 'react-apexcharts';
import { HourlyStatItem } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    title: string;
    data: HourlyStatItem[];
}

export default function HourlyAttemptsChart({ title, data: chartData }: Props) {
    const { appearance } = useAppearance();
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const labels = hours.map(h => `${h.toString().padStart(2, '0')}:00`);
    
    const dataPoints = hours.map(h => {
        const item = chartData.find(d => Number(d.hour) === h);
        return item ? Number(item.items_count) : 0;
    });

    const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'inherit',
            background: 'transparent',
        },
        theme: {
            mode: isDark ? 'dark' : 'light'
        },
        title: {
            text: title,
            align: 'left',
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDark ? '#94a3b8' : '#64748b'
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '70%',
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            labels: {
                style: { colors: '#94a3b8', fontSize: '10px' },
                rotate: -45,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8', fontSize: '11px' }
            }
        },
        grid: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            strokeDashArray: 4,
        },
        colors: ['#3b82f6'],
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        }
    };

    const series = [{
        name: 'Attempts',
        data: dataPoints
    }];

    return (
        <div className="w-full h-[340px]">
            <Chart options={options} series={series} type="bar" height="100%" />
        </div>
    );
}
