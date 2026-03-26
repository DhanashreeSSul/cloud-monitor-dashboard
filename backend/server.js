require('./tracing');   
const express = require("express");
const si = require("systeminformation");
const cors = require("cors");
const logger = require('./logger');     
const morgan = require('morgan');        

const app = express();
app.use(cors());
// ADD this block
app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) }
}));

let metricsHistory = [];
let logs = [];
const morgan = require('morgan');
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

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

// ADD — save to DynamoDB + push to CloudWatch
await saveMetrics({ cpu: cpuData.currentLoad, memory: memData.usedMemPercentage });
await pushMetric('CPUUsage', cpuData.currentLoad);
await pushMetric('MemoryUsage', memData.usedMemPercentage);

setInterval(collectMetrics,5000);

app.get("/metrics",(req,res)=>{
  res.json(metricsHistory);
});

app.get("/logs",(req,res)=>{
  res.json(logs);
});

// CloudWatch custom metrics
const { CloudWatch } = require('@aws-sdk/client-cloudwatch');
const cw = new CloudWatch({ region: process.env.AWS_REGION });

async function pushMetric(name, value) {
  await cw.putMetricData({
    Namespace: 'CloudMonitor/App',
    MetricData: [{ MetricName: name, Value: value, Unit: 'Percent' }]
  });
}

// DynamoDB metrics storage
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

async function saveMetrics(data) {
  await dbClient.send(new PutCommand({
    TableName: process.env.DYNAMO_TABLE,
    Item: { timestamp: new Date().toISOString(), ...data }
  }));
}

// New API route — history for your React dashboard
app.get('/metrics/history', async (req, res) => {
  const result = await dbClient.send(new ScanCommand({ TableName: process.env.DYNAMO_TABLE, Limit: 100 }));
  res.json(result.Items);
});

app.listen(5000,()=>{
  console.log("Server running on port 5000");
});