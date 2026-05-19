import { cors } from "@elysiajs/cors";
import { auth } from "@project-elysia/auth";
import { env } from "@project-elysia/env/server";
import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

import { randomRoutes } from "./routes/random";

export default new Elysia({
  adapter: CloudflareAdapter,
})
  .use(openapi())
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .use(randomRoutes)
  .get("/api/random", () => {
    return { message: "jigsaw" };
  })
  .get("/", () => "OK")
  .compile();
