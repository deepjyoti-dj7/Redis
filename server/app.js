import express from "express";
import { getOneProductDetails, getAllProducts } from "./api/products.js";
import Redis from "ioredis";
import "dotenv/config";
import {
  getAllProductsCachedData,
  getOneProductDetailsCachedData,
  invalidateProductCache,
  rateLimiter,
} from "./middleware/redis.js";

const PORT = 3000;
const app = express();

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
redis.on("connect", () => {
  console.log("Redis connected");
});

app.get("/", rateLimiter(10, 120), async (req, res) => {
  res.send(`Hello THERE!!!`);
});

app.get("/products", getAllProductsCachedData("products"), async (req, res) => {
  console.log("Getting all products from DB");

  const products = await getAllProducts();
  await redis.set("products", JSON.stringify(products.products));

  res.json({
    products,
  });
});

app.get("/product/:id", getOneProductDetailsCachedData(), async (req, res) => {
  console.log("Getting one product details from DB");

  const id = req.params.id;
  const key = `product:${id}`;

  const product = await getOneProductDetails(id);

  await redis.set(key, JSON.stringify(product));

  res.json({
    product,
  });
});

app.get("/order/:id", invalidateProductCache(), async (req, res) => {
  const { id } = req.params;

  return res.json({
    message: `Order placed successfully, product id:${id} is ordered`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
