import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENWEATHER_API_KEY: z.string().min(1),
    OPENCAGE_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_OWM_API_KEY: z.string().min(1),
    NEXT_PUBLIC_OPENCAGE_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
    NEXT_PUBLIC_OWM_API_KEY: process.env.NEXT_PUBLIC_OWM_API_KEY,
    NEXT_PUBLIC_OPENCAGE_API_KEY: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY,
  },
});