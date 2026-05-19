import { cors } from "@elysiajs/cors";
import { auth } from "@project-elysia/auth";
import { env } from "@project-elysia/env/server";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import {
  createAuthMiddleware,
  type BetterAuthInstance,
} from "evlog/better-auth";
import { evlog } from "evlog/elysia";
import { openapi } from "@elysia/openapi";
import { randomRoutes } from "./routes/random";

initLogger({
  env: { service: "project-elysia-server" },
});

const identifyUser = createAuthMiddleware(auth as BetterAuthInstance, {
  exclude: ["/api/auth/**"],
  maskEmail: true,
});

new Elysia()
  .use(evlog())
  .use(openapi())
  .derive(async ({ request, log }) => {
    await identifyUser(log, request.headers, new URL(request.url).pathname);
    return {};
  })
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
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
