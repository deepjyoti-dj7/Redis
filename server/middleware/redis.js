import { redis } from "../app.js";

export const getAllProductsCachedData = (key) => async (req, res, next) => {
  let data = await redis.get(key);

  if (data) {
    console.log("Getting all products from cache");

    return res.json({
      products: JSON.parse(data),
    });
  }

  next();
};

export const getOneProductDetailsCachedData = () => async (req, res, next) => {
  const id = req.params.id;
  const key = `product:${id}`;

  const data = await redis.get(key);

  if (data) {
    console.log("Getting product from cache");

    return res.json({
      product: JSON.parse(data),
    });
  }

  next();
};

export const invalidateProductCache = () => async (req, res, next) => {
  const { id } = req.params;
  const key = `product:${id}`;

  try {
    await redis.del(key);
    console.log(`Cache invalidated for product:${id}`);
  } catch (error) {
    console.error("Error deleting cache:", error);
  }

  next();
};

export const rateLimiter =
  ({ limit = 10, timer = 120, key }) =>
  async (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const fullKey = `${clientIp}:${key}:request_count`;
    const requestCount = await redis.incr(fullKey);

    if (requestCount === 1) {
      await redis.expire(fullKey, timer);
    }

    const remainingTime = await redis.ttl(fullKey);

    if (requestCount > limit) {
      return res
        .status(429)
        .send(
          `Too many requests, please try again after ${remainingTime} seconds`
        );
    }

    next();
  };
