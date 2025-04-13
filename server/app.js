import express from "express";
import { getProducts } from "./api/products.js";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  console.log("Hello THERE!!!");
});

app.get("/products", async (req, res) => {
  const products = await getProducts;

  res.json({
    products,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
