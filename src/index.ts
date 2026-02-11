import { Elysia, t } from "elysia";
import {
  openapi
} from '@elysiajs/openapi'
import {
  z
} from 'zod'
import { researchBusiness } from "./agents";
import { ElevenLabsClient, ElevenLabsEnvironment } from "@elevenlabs/elevenlabs-js";

const isProduction = process.env.NODE_ENV === 'production';

const app = new Elysia()
  .guard(isProduction ? {
    headers: t.Object({
      'x-magic': t.String({ pattern: `^${process.env.AUTH_TOKEN}$` })
    })
  } : {})
  .get("/", () => "Yello")
  .post("/research_business", async ({ body }) => {
    console.log("Received request to research business with prompt: " + body.prompt);

    const result = await researchBusiness(body.prompt);

    console.log("Research result: ", result);

    return result;
  }, {
    body: z.object({
      prompt: z.string(),
    })
  }).post("/make_reservation", async ({ body }) => {
    const client = new ElevenLabsClient({
      environment: ElevenLabsEnvironment.Production,
    });
    const res = await client.conversationalAi.twilio.outboundCall({
      agentId: process.env.ELEVENLABS_AGENT_ID!,
      agentPhoneNumberId: process.env.ELEVENLABS_NUMBER_ID!,
      toNumber: body.phoneNumber,
      conversationInitiationClientData: {
        dynamicVariables: {
          person_name: body.personName,
          business_name: body.businessName,
          reservation_time: body.reservationTime,
          num_people: body.numPeople,
        }
      }
    });

    console.log("Reservation call response: ", res);

    return res;

  }, {
    body: z.object({
      businessName: z.string(),
      phoneNumber: z.string(),
      reservationTime: z.string(),
      numPeople: z.string(),
      personName: z.string(),
    })
  }).get('/conversation_details/:id', async ({ params: { id } }) => {
    const client = new ElevenLabsClient({
      environment: ElevenLabsEnvironment.Production,
    });

    const res = await client.conversationalAi.conversations.get(id);
    console.log("Conversation details response: ", res);

    return res;
  }
  )
  .use(openapi()).listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
