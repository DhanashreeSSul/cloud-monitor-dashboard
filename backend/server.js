const express = require("express");
const si = require("systeminformation");
const cors = require("cors");

const app = express();
app.use(cors());

let metricsHistory = [];
let logs = [];

async function collectMetrics() {

  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();
  const network = await si.networkStats();
  const time = await si.time();

  const cpuUsage = cpu.currentLoad.toFixed(2);
  const memoryUsage = ((mem.used / mem.total) * 100).toFixed(2);
  const diskUsage = disk[0].use.toFixed(2);
  const netIn = network[0].rx_sec;
  const netOut = network[0].tx_sec;

  let status = "ACTIVE";
  let alert = "";

  if(cpuUsage > 80){
    status = "OVERLOADED";
    alert = "High CPU Usage";
  }

  if(memoryUsage > 85){
    status = "WARNING";
    alert = "High Memory Usage";
  }

  const metric = {
    cpu: cpuUsage,
    memory: memoryUsage,
    disk: diskUsage,
    netIn,
    netOut,
    uptime: time.uptime,
    status,
    alert,
    timestamp: new Date().toLocaleTimeString()
  };

  metricsHistory.push(metric);

  if(metricsHistory.length > 30){
    metricsHistory.shift();
  }

  logs.push(`[${metric.timestamp}] CPU:${cpuUsage}% MEM:${memoryUsage}%`);

  if(logs.length > 50){
    logs.shift();
  }

}

setInterval(collectMetrics,5000);

app.get("/metrics",(req,res)=>{
  res.json(metricsHistory);
});

app.get("/logs",(req,res)=>{
  res.json(logs);
});

app.listen(5000,()=>{
  console.log("Server running on port 5000");
});