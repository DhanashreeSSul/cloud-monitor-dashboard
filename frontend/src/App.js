import React, {useEffect, useState} from "react";
import {Line} from "react-chartjs-2";
import 'chart.js/auto';
import "./App.css";

function App(){

const [metrics,setMetrics]=useState([]);
const [logs,setLogs]=useState([]);

useEffect(()=>{

 fetchMetrics();
 const interval=setInterval(fetchMetrics,5000);
 return()=>clearInterval(interval);

},[]);

const fetchMetrics=async()=>{

 const res=await fetch("http://localhost:5000/metrics");
 const data=await res.json();
 setMetrics(data);

 const logRes=await fetch("http://localhost:5000/logs");
 const logData=await logRes.json();
 setLogs(logData);
}

const latest = metrics.length>0 ? metrics[metrics.length-1] : null;

const cpuData={
 labels:metrics.map(m=>m.timestamp),
 datasets:[{
  label:"CPU %",
  data:metrics.map(m=>m.cpu),
  borderColor:"#3B82F6",
  backgroundColor:"rgba(59,130,246,0.2)",
  tension:0.4
 }]
}

const memoryData={
 labels:metrics.map(m=>m.timestamp),
 datasets:[{
  label:"Memory %",
  data:metrics.map(m=>m.memory),
  borderColor:"#60A5FA",
  backgroundColor:"rgba(96,165,250,0.2)",
  tension:0.4
 }]
}

return(

<div className="dashboard">

<h1 className="title">☁ Cloud Monitoring Dashboard</h1>

{/* STATUS CARDS */}

<div className="card-grid">

<div className="card">
<h3>Server Status</h3>
<p className="status">{latest ? latest.status : "Loading..."}</p>
</div>

<div className="card">
<h3>Alert</h3>
<p className="alert">{latest ? latest.alert || "None" : "Loading..."}</p>
</div>

<div className="card">
<h3>Disk Usage</h3>
<p>{latest ? latest.disk+"%" : "-"}</p>
</div>

<div className="card">
<h3>Uptime</h3>
<p>{latest ? latest.uptime+" sec" : "-"}</p>
</div>

</div>


{/* GRAPH SECTION */}

<div className="chart-grid">

<div className="chart-card">
<h3>CPU Usage</h3>
<Line data={cpuData}/>
</div>

<div className="chart-card">
<h3>Memory Usage</h3>
<Line data={memoryData}/>
</div>

</div>


{/* NETWORK STATS */}

<div className="card-grid">

<div className="card">
<h3>Network In</h3>
<p>{latest ? latest.netIn : "-"}</p>
</div>

<div className="card">
<h3>Network Out</h3>
<p>{latest ? latest.netOut : "-"}</p>
</div>

</div>


{/* LOG VIEWER */}

<div className="logs">

<h3>System Logs</h3>

<div className="log-box">
{logs.map((log,index)=>(
<div key={index} className="log-line">{log}</div>
))}
</div>

</div>

</div>

)

}

export default App;