import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // These only exist on the server (Vercel/Node.js)
    OPENWEATHER_API_KEY: z.string().min(1),
    OPENCAGE_API_KEY: z.string().min(1),
  },
  client: {
    // Keep this empty to ensure NO keys leak to the browser
  },
  runtimeEnv: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
  },
});