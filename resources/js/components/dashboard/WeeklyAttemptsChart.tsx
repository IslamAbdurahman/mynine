import React from 'react';
import Chart from 'react-apexcharts';
import { WeeklyStatItem } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    title: string;
    data: WeeklyStatItem[];
}

export default function WeeklyAttemptsChart({ title, data: chartData }: Props) {
    const { appearance } = useAppearance();
    
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataPoints = [1, 2, 3, 4, 5, 6, 7].map(dayRaw => {
        const item = chartData.find(d => Number(d.weekday) === dayRaw);
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
                borderRadius: 6,
                columnWidth: '50%',
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: weekdays,
            labels: {
                style: { colors: '#94a3b8', fontSize: '12px' }
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
        colors: ['#8b5cf6'],
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
