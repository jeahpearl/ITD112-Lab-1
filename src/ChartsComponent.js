import React, { useState, useEffect } from 'react';
import { Bar, Scatter, Pie, Line } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function ChartsComponent() {
  const [chartData, setChartData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [filters, setFilters] = useState({
    barMonth: '',
    barYear: '',
    scatterMonth: '',
    scatterYear: '',
    pieMonth: '',
    pieYear: '',
    lineMonth: '',
    lineYear: ''
  });
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [activeChart, setActiveChart] = useState('bar');
  const [orientation, setOrientation] = useState('vertical'); // State for chart orientation

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const dengueSnapshot = await getDocs(dengueCollection);
      const dataList = dengueSnapshot.docs.map(doc => doc.data());

      // Extract unique months, years, and regions from the data
      const uniqueMonths = new Set();
      const uniqueYears = new Set();

      dataList.forEach(item => {
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {  // Ensure valid dates
          uniqueMonths.add(date.getMonth() + 1);
          uniqueYears.add(date.getFullYear());
        }
      });

      setAvailableMonths([...uniqueMonths].sort());
      setAvailableYears([...uniqueYears].sort());

      // Filter data for Bar, Scatter, Pie, and Line Charts
      const filterData = (data, month, year) => {
        return data.filter(item => {
          const date = new Date(item.date);
          const filterMonth = month ? date.getMonth() + 1 === Number(month) : true;
          const filterYear = year ? date.getFullYear() === Number(year) : true;
          return !isNaN(date.getTime()) && filterMonth && filterYear;
        });
      };

      const barData = filterData(dataList, filters.barMonth, filters.barYear);
      const scatterData = filterData(dataList, filters.scatterMonth, filters.scatterYear);
      const pieData = filterData(dataList, filters.pieMonth, filters.pieYear);
      const lineData = filterData(dataList, filters.lineMonth, filters.lineYear);

      // Grouped Bar Chart data
      setChartData(barData.map(item => ({
        location: item.location,
        cases: item.cases,
        deaths: item.deaths,
      })));

      // Scatter Plot data
      setScatterData(scatterData.map(item => ({
        x: item.cases,
        y: item.deaths,
      })));

      // Pie Chart data (Cases by Region)
      const regionData = pieData.reduce((acc, curr) => {
        acc[curr.regions] = (acc[curr.regions] || 0) + curr.cases;
        return acc;
      }, {});

      // Generate a unique color for each region
      const colorPalette = generateUniqueColors(Object.keys(regionData).length);

      setPieData({
        labels: Object.keys(regionData),
        datasets: [{
          data: Object.values(regionData),
          backgroundColor: colorPalette, // Use the generated color palette
        }]
      });

      // Line Chart data (Cases over time)
      const dateCases = lineData.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + curr.cases;
        return acc;
      }, {});
      setLineData({
        labels: Object.keys(dateCases),
        datasets: [{
          label: 'Dengue Cases Over Time',
          data: Object.values(dateCases),
          fill: false,
          borderColor: '#36A2EB'
        }]
      });
    };

    fetchData();
  }, [filters]);

  // Function to generate a list of unique colors
  const generateUniqueColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = i * 360 / numColors; // Evenly distribute hues
      const saturation = 70 + Math.random() * 10; // Slight variation in saturation
      const lightness = 50 + Math.random() * 10; // Slight variation in lightness
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`); // HSL color format
    }
    return colors;
  };

  // Trendline calculation for Scatter Plot
  const calculateTrendLine = (data) => {
    const n = data.length;
    if (n === 0) return [];

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map(point => ({ x: point.x, y: slope * point.x + intercept }));
  };

  const trendLineData = calculateTrendLine(scatterData);

  // Handlers for filter changes
  const handleFilterChange = (chart, type) => (e) => {
    setFilters({
      ...filters,
      [`${chart}${type}`]: e.target.value
    });
  };

  // Handler for chart orientation change
  const handleOrientationChange = (e) => {
    setOrientation(e.target.value);
  };

  // Chart Data Definitions with fallback for undefined chartData
  const barChartData = {
    labels: chartData.length ? chartData.map(item => item.location) : [],
    datasets: [
      {
        label: 'Dengue Cases',
        data: chartData.length ? chartData.map(item => item.cases) : [],
        backgroundColor: 'rgba(9, 187, 187, 0.9)',
        borderColor: 'rgba(9, 187, 187, 1)',
        borderWidth: 1
      },
      {
        label: 'Dengue Deaths',
        data: chartData.length ? chartData.map(item => item.deaths) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const scatterChartData = {
    datasets: [
      {
        label: 'Cases vs Deaths',
        data: scatterData.length ? scatterData : [],
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Trend Line',
        data: trendLineData.length ? trendLineData : [],
        borderColor: 'rgba(54, 162, 235, 1)',
        type: 'line',
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
      }
    ]
  };

  return (
    <div>
      {/* Chart Tabs */}
      <div className="chart-tabs">
        <span
          className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
          onClick={() => setActiveChart('bar')}
        >
          Bar Chart
        </span>
        <span
          className={`chart-tab ${activeChart === 'scatter' ? 'active' : ''}`}
          onClick={() => setActiveChart('scatter')}
        >
          Scatter Plot
        </span>
        <span
          className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
          onClick={() => setActiveChart('pie')}
        >
          Pie Chart
        </span>
        <span
          className={`chart-tab ${activeChart === 'line' ? 'active' : ''}`}
          onClick={() => setActiveChart('line')}
        >
          Line Chart
        </span>
      </div>

      {/* Render the selected chart */}
      {activeChart === 'bar' && (
        <div>
          <h2>Bar Chart (Cases vs Deaths)</h2>
          <label>Month:</label>
          <select value={filters.barMonth} onChange={handleFilterChange('bar', 'Month')}>
            <option value="">All</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <label>Year:</label>
          <select value={filters.barYear} onChange={handleFilterChange('bar', 'Year')}>
            <option value="">All</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Orientation toggle */}
          <label>Orientation:</label>
          <select value={orientation} onChange={handleOrientationChange}>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>

          <Bar
            data={barChartData}
            options={{
              indexAxis: orientation === 'vertical' ? 'x' : 'y', // Change the axis orientation
              scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
      )}

      {activeChart === 'scatter' && (
        <div>
          <h2>Scatter Plot (Cases vs Deaths with Trend Line)</h2>
          <label>Month:</label>
          <select value={filters.scatterMonth} onChange={handleFilterChange('scatter', 'Month')}>
            <option value="">All</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <label>Year:</label>
          <select value={filters.scatterYear} onChange={handleFilterChange('scatter', 'Year')}>
            <option value="">All</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Scatter data={scatterChartData} />
        </div>
      )}

      {activeChart === 'pie' && (
        <div>
          <h2>Pie Chart (Distribution of Cases by Region)</h2>
          <label>Month:</label>
          <select value={filters.pieMonth} onChange={handleFilterChange('pie', 'Month')}>
            <option value="">All</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <label>Year:</label>
          <select value={filters.pieYear} onChange={handleFilterChange('pie', 'Year')}>
            <option value="">All</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Pie data={pieData} />
        </div>
      )}

      {activeChart === 'line' && (
        <div>
          <h2>Line Chart (Cases Over Time)</h2>
          <label>Month:</label>
          <select value={filters.lineMonth} onChange={handleFilterChange('line', 'Month')}>
            <option value="">All</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <label>Year:</label>
          <select value={filters.lineYear} onChange={handleFilterChange('line', 'Year')}>
            <option value="">All</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Line data={lineData} />
        </div>
      )}
    </div>
  );
}

export default ChartsComponent;
