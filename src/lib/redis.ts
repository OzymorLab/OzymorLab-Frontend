import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

if (!redisUrl || !redisToken) {
  console.warn(
    "Upstash Redis REST credentials missing. Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in server environment."
  );
}

// Create a single production instance of the Upstash HTTP client
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});
