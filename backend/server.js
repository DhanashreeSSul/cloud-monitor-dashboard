const express = require("express");
const si = require("systeminformation");
const cors = require("cors");

const app = express();
app.use(cors());

let metrics = [];

async function collectMetrics() {
  const cpu = await si.currentLoad();
  const mem = await si.mem();

  const data = {
    cpu: cpu.currentLoad.toFixed(2),
    memory: ((mem.used / mem.total) * 100).toFixed(2),
    time: new Date().toLocaleTimeString()
  };

  metrics.push(data);

  if (metrics.length > 20) {
    metrics.shift();
  }

  console.log(data);
}

setInterval(collectMetrics, 5000);

app.get("/metrics", (req, res) => {
  res.json(metrics);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});