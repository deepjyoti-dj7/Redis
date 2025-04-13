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

// Redis Config
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
redis.on("connect", () => {
  console.log("Redis connected");
});

// Home
app.get(
  "/",
  rateLimiter({ limit: 10, timer: 120, key: "home" }),
  async (req, res) => {
    res.send(`Hello THERE!!!`);
  }
);

// All products
app.get(
  "/products",
  rateLimiter({ limit: 10, timer: 120, key: "products" }),
  getAllProductsCachedData("products"),
  async (req, res) => {
    console.log("Getting all products from DB");

    const products = await getAllProducts();
    await redis.set("products", JSON.stringify(products));

    res.json({
      products,
    });
  }
);

// Product ID
app.get(
  "/product/:id",
  rateLimiter({ limit: 10, timer: 120, key: "home" }),
  getOneProductDetailsCachedData(),
  async (req, res) => {
    console.log("Getting one product details from DB");

    const id = req.params.id;
    const key = `product:${id}`;

    const product = await getOneProductDetails(id);

    await redis.set(key, JSON.stringify(product));

    res.json({
      product,
    });
  }
);

// Order Id
app.get(
  "/order/:id",
  rateLimiter({ limit: 10, timer: 120, key: "home" }),
  invalidateProductCache(),
  async (req, res) => {
    const { id } = req.params;

    return res.json({
      message: `Order placed successfully, product id:${id} is ordered`,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
