'use client';

import { useState } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartType,
} from 'chart.js';

import { Chart } from 'react-chartjs-2';

// Register all required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ProcessedData {
  dailyData: Array<{ date: string; value: number }>;
  monthlyTotals: Record<string, number>;
  totalAmount: number;
}

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const processData = (rawData: string): ProcessedData => {
    const normalizedData = rawData.replace(/：/g, ':');
    const lines = normalizedData.split('\n');
    const processedData: Array<{ date: string; value: number }> = [];
    const monthlyTotals: Record<string, number> = {};
    let totalAmount = 0;

    lines.forEach(line => {
      const match = line.match(/(\d+月\d+号)[^\d]*([^\n]*)/);
      if (match) {
        const date = match[1];
        let value = match[2].trim();
        const numericValue = /^\d+$/.test(value) ? parseInt(value) : 0;

        const month = date.match(/(\d+)月/)?.[0] || '';
        monthlyTotals[month] = (monthlyTotals[month] || 0) + numericValue;

        processedData.push({
          date,
          value: numericValue,
        });

        totalAmount += numericValue;
      }
    });

    return {
      dailyData: processedData,
      monthlyTotals,
      totalAmount,
    };
  };

  const isWeekendOrHoliday = (dateStr: string): boolean => {
    const match = dateStr.match(/(\d+)月(\d+)号/);
    if (match) {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      const date = new Date(2024, month - 1, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 5 || dayOfWeek === 6 || isHoliday(month, day);
    }
    return false;
  };

  const isHoliday = (month: number, day: number): boolean => {
    const holidays: Record<string, number[]> = {
      '1': [1], // 元旦
      '5': [1, 2, 3], // 劳动节
      '10': [1, 2, 3, 4, 5, 6, 7], // 国庆节
    };

    const lunarHolidays: Record<string, number[]> = {
      '2': [10], // 春节
      '4': [5], // 清明节
      '6': [10], // 端午节
      '9': [15], // 中秋节
    };

    return (
      (holidays[month.toString()]?.includes(day) || false) ||
      (lunarHolidays[month.toString()]?.includes(day) || false)
    );
  };

  const handleProcessAndDisplay = () => {
    const rawData = (document.getElementById('dataInput') as HTMLTextAreaElement).value;
    if (!rawData.trim()) {
      alert('请输入数据！');
      return;
    }
    const data = processData(rawData);
    setProcessedData(data);
  };

  const chartData = processedData ? {
    labels: processedData.dailyData.map(item => item.date),
    datasets: [
      {
        label: '每日金额',
        data: processedData.dailyData.map(item => item.value),
        backgroundColor: processedData.dailyData.map(item =>
          isWeekendOrHoliday(item.date)
            ? 'rgba(255, 99, 132, 0.5)'
            : 'rgba(54, 162, 235, 0.5)'
        ),
        borderColor: processedData.dailyData.map(item =>
          isWeekendOrHoliday(item.date)
            ? 'rgba(255, 99, 132, 1)'
            : 'rgba(54, 162, 235, 1)'
        ),
        borderWidth: 1,
        order: 2,
        type: 'bar' as const,
      },
      {
        label: '平均值',
        data: processedData.dailyData.map(() =>
          processedData.dailyData.reduce((sum, item) => sum + item.value, 0) /
          processedData.dailyData.length
        ),
        type: 'line' as const,
        borderColor: 'rgba(255, 11, 11, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        order: 1,
      },
    ],
  } satisfies ChartData<'bar' | 'line', number[], string> : null;

  return (
    <main className="max-w-7xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-5">数据统计可视化</h1>

      <div className="mb-5">
        <textarea
          id="dataInput"
          className="w-full h-48 p-3 mb-3 border rounded"
          placeholder="请输入数据，格式如：
4月7号:8550💰
4月8号:2130💰
..."
        />
        <button
          onClick={handleProcessAndDisplay}
          className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          生成统计图
        </button>
      </div>

      {processedData && (
        <>
          <div className="mb-5 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-bold mb-3">月度总计</h2>
            {Object.entries(processedData.monthlyTotals).map(([month, total]) => (
              <p key={month} className="mb-2">
                {month}: {total.toLocaleString()} 元
              </p>
            ))}
            <h3 className="text-lg font-bold mt-3">
              总计: {processedData.totalAmount.toLocaleString()} 元
            </h3>
          </div>

          <div className="mt-5">
            {chartData && (
              <Chart
                type="bar"
                data={chartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: '金额 (元)',
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: '日期',
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
} 