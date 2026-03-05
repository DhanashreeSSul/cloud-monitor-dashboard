import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';

function App() {

  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [labels, setLabels] = useState([]);

  const fetchMetrics = async () => {
    const res = await fetch("http://localhost:3000/metrics");
    const data = await res.json();

    if(data.length > 0){
      const latest = data[data.length-1];

      setCpuData(prev => [...prev, latest.cpu]);
      setMemoryData(prev => [...prev, latest.memory]);
      setLabels(prev => [...prev, latest.time]);
    }
  };

  useEffect(() => {

    const interval = setInterval(fetchMetrics,5000);

    return () => clearInterval(interval);

  }, []);

  const cpuChart = {
    labels: labels,
    datasets: [
      {
        label: "CPU Usage %",
        data: cpuData
      }
    ]
  };

  const memoryChart = {
    labels: labels,
    datasets: [
      {
        label: "Memory Usage %",
        data: memoryData
      }
    ]
  };

  return (
    <div style={{padding:"30px"}}>

      <h1>Cloud Monitoring Dashboard</h1>

      <h3>CPU Usage</h3>
      <Line data={cpuChart} />

      <h3>Memory Usage</h3>
      <Line data={memoryChart} />

    </div>
  );
}

export default App;