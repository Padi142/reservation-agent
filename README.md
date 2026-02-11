# Reservation Agent

## Description

An agent that can research information about a business and make a reservation via a phone call.

## Getting Started

Firstly, install the dependencies:

```bash
bun install
```

Create a `.env` file in the root of the project and add your API keys:

```env
OPENROUTER_API_KEY='your-openrouter-api-key'
EXA_API_KEY='your-exa-api-key'
ELEVENLABS_API_KEY='your-elevenlabs-api-key'
ELEVENLABS_AGENT_ID='your-elevenlabs-agent-id'
ELEVENLABS_NUMBER_ID='your-elevenlabs-number-id'
```

Exa search is used to find information about the business.
ElevenLabs is used to make the phone call and speak with the business.

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/openapi to see the OpenAPI documentation for the agent.
