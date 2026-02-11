import { Elysia } from "elysia";
import {
  openapi
} from '@elysiajs/openapi'
import {
  z
} from 'zod'
import { researchBusiness } from "./agents";

const app = new Elysia().get("/", () => "Yello")
  .post("/research_business", async ({ body }) => {
    console.log("Received request to research business with prompt: " + body.prompt);

    const result = await researchBusiness(body.prompt);

    console.log("Research result: ", result);

    return result;
  }, {
    body: z.object({
      prompt: z.string(),
    })
  })
  .use(openapi()).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
