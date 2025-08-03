import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis();

const productQueue = new Queue("productQueue", {
  connection: redis,
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(productQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3001, () => {
  console.log(
    "📊 Bull Board dashboard running at http://localhost:3001/admin/queues"
  );
});
