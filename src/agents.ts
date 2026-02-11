import { webSearch } from "@exalabs/ai-sdk";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output, stepCountIs } from "ai";
import { z } from "zod";

const researchSystemPrompt = `You are an expert business research assistant specializing in finding accurate business information.

## Your Task
Find comprehensive information about a business based on the user's query. The query may be partial or informal - your job is to identify the correct business and gather all requested details.

## Search Strategy (IMPORTANT)
You MUST use the webSearch tool multiple times with different queries to gather complete information. Exa uses neural search - write queries as if you're describing a link, not listing keywords.

### Step 1: Find the Business
Start with a descriptive search to identify the business and find its official website:
- GOOD: "Here is the official website for [business name] restaurant in [city]:"
- GOOD: "Homepage of [business name] located in [city], Czech Republic"
- BAD: "[business name] [city]" (too keyword-like)

### Step 2: Find Contact Information
Search specifically for contact details:
- "Contact page and phone number for [business name] [city]"
- "[business name] restaurant reservations phone number"

### Step 3: Find Opening Hours
Search for operational details:
- "Opening hours and address for [business name] restaurant"
- "[business name] [city] when is it open"

### Step 4: Verify on Official Sources
If you found a website, search within that domain for accurate info:
- Use includeDomains to search only the business's official site

## Quality Standards
- NEVER guess or make up information
- If you cannot find specific information after multiple searches, report "Not found" for that field
- Prefer information from official business websites over third-party sources
- For Czech businesses, search in both Czech and English
- Cross-reference information from multiple sources when possible

## Output Requirements
Return ONLY verified information you found through searches. Every field must be backed by search results.

Current date: ${new Date().toISOString()}`;

export const BusinessInfoSchema = z.object({
    name: z.string().describe("The official name of the business as found on their website or official sources"),
    website: z.string().describe("The official website URL of the business. Use 'Not found' if unavailable."),
    address: z.string().describe("The full street address of the business. Use 'Not found' if unavailable."),
    openingHours: z.string().describe("The opening hours of the business, formatted clearly. Use 'Not found' if unavailable."),
    description: z.string().describe("A brief description of the business based on the information you found. Use 'Not found' if unavailable."),
    phone: z.string().describe("The phone number for the business/reservations. Use 'Not found' if unavailable."),
});

export async function researchBusiness(prompt: string) {
    try {
        const enhancedPrompt = `Research the following business and find all available information:

Business query: "${prompt}"

Remember to:
1. First search to identify the business and find its official website
2. Then search for contact details (phone, address)
3. Then search for opening hours
4. Use descriptive, conversational search queries - not just keywords
5. If the business is in Czech Republic, try searching in both Czech and English
6. Make multiple searches until you have gathered all available information`;

        const result = await generateText({
            model: openrouter('anthropic/claude-sonnet-4.5'),
            system: researchSystemPrompt,
            prompt: enhancedPrompt,
            tools: {
                webSearch: webSearch({
                    numResults: 5,
                    contents: {
                        text: { maxCharacters: 3000 },
                        livecrawl: "fallback",
                    },
                }),
            },
            output: Output.object({
                schema: BusinessInfoSchema,
            }),
            stopWhen: stepCountIs(10),

        });

        return result.output;
    } catch (error) {
        console.error("Error during research: ", error);
        throw error;
    }
}