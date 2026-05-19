import { Elysia } from "elysia";

const randomRoutes = new Elysia().get("/random", () => {
  const randomNumber = Math.random();
  return { message: `Random number: ${randomNumber}` };
});

export { randomRoutes };
