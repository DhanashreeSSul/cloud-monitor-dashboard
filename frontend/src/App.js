import React, {useEffect, useState} from "react";
import {Line} from "react-chartjs-2";
import 'chart.js/auto';

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

const cpuData={
 labels:metrics.map(m=>m.timestamp),
 datasets:[{
  label:"CPU Usage %",
  data:metrics.map(m=>m.cpu)
 }]
}

const memoryData={
 labels:metrics.map(m=>m.timestamp),
 datasets:[{
  label:"Memory Usage %",
  data:metrics.map(m=>m.memory)
 }]
}

return(

<div style={{padding:"20px"}}>

<h1>Cloud Monitoring Dashboard</h1>

{/* SERVER STATUS */}

<div style={{display:"flex",gap:"40px"}}>

<div>
<h3>Server Status</h3>
<p>{metrics.length>0 ? metrics[metrics.length-1].status : "Loading..."}</p>
</div>

<div>
<h3>Alert</h3>
<p>{metrics.length>0 ? metrics[metrics.length-1].alert : "None"}</p>
</div>

</div>

{/* CPU GRAPH */}

<h3>CPU Usage</h3>
<Line data={cpuData}/>

{/* MEMORY GRAPH */}

<h3>Memory Usage</h3>
<Line data={memoryData}/>

{/* EXTRA PANELS */}

{metrics.length>0 && (

<div style={{display:"flex",gap:"40px",marginTop:"30px"}}>

<div>
<h4>Disk Usage</h4>
<p>{metrics[metrics.length-1].disk}%</p>
</div>

<div>
<h4>Network In</h4>
<p>{metrics[metrics.length-1].netIn}</p>
</div>

<div>
<h4>Network Out</h4>
<p>{metrics[metrics.length-1].netOut}</p>
</div>

<div>
<h4>Uptime</h4>
<p>{metrics[metrics.length-1].uptime} sec</p>
</div>

</div>

)}

{/* LOG VIEWER */}

<h3 style={{marginTop:"40px"}}>System Logs</h3>

<div style={{
 border:"1px solid gray",
 height:"200px",
 overflow:"auto",
 padding:"10px"
}}>

{logs.map((log,index)=>(
<div key={index}>{log}</div>
))}

</div>

</div>

)

}

export default App;