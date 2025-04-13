import express from "express";
import { getProductDetail, getProducts } from "./api/products.js";
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
  let products = await redis.get("products");

  if (products) {
    console.log("Getting all products from cache");
    return res.json({
      products: JSON.parse(products),
    });
  }
  console.log("Getting all products from DB");

  products = await getProducts();
  await redis.setex("products", 30, JSON.stringify(products.products));

  res.json({
    products,
  });
});

app.get("/product/:id", async (req, res) => {
  const id = req.params.id;

  const key = `product:${id}`;
  let product = await redis.get(key);

  if (product) {
    console.log("Getting product from cache");
    return res.json({
      product: JSON.parse(product),
    });
  }
  console.log("Getting product from DB");

  product = await getProductDetail(id);
  await redis.setex(key, 30, JSON.stringify(product));

  res.json({
    product,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
