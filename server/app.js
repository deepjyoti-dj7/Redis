import express from "express";
import { getProducts } from "./api/products.js";
import Redis from "ioredis";
import "dotenv/config";

const PORT = 3000;
const app = express();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
redis.on("connect", () => {
  console.log("Redis connected");
});

app.get("/", (req, res) => {
  res.send("Hello THERE!!!");
});

app.get("/products", async (req, res) => {
  const products = await getProducts();

  res.json({
    products,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
