import React from 'react';
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
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  title?: string;
  data: any;
  options?: any;
  height?: number;
}

export const BarChart: React.FC<ChartProps> = ({ title, data, options, height }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };
  
  return (
    <div style={{ height: height || 300 }}>
      <Bar data={data} options={options || defaultOptions} />
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({ title, data, options, height }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };
  
  return (
    <div style={{ height: height || 300 }}>
      <Line data={data} options={options || defaultOptions} />
    </div>
  );
};

export const PieChart: React.FC<ChartProps> = ({ title, data, options, height }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };
  
  return (
    <div style={{ height: height || 300 }}>
      <Pie data={data} options={options || defaultOptions} />
    </div>
  );
};

export const DoughnutChart: React.FC<ChartProps> = ({ title, data, options, height }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };
  
  return (
    <div style={{ height: height || 300 }}>
      <Doughnut data={data} options={options || defaultOptions} />
    </div>
  );
};
