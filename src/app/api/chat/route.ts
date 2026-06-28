export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
    try {
        const { messages } = (await req.json()) as { messages?: unknown };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const env = getEnv();
        const ai = env.AI;

        const systemPrompt = `You are the 'KhamarBari AI Expert Assistant', a specialized livestock veterinary and farm management AI advisor.
You specialize in Cows & Bulls (গরু / বলদ), Goats (ছাগল), Water Buffaloes (মহিষ), Sheep (ভেড়া), and Camels (উট).

### Your Clinical & Agricultural Knowledge:
- Foot and Mouth Disease (FMD): Recognize lameness, drooling, and blister lesions around mouth/hooves.
- Peste des Petits Ruminants (PPR in Goats/Sheep): Look for high fever, eye/nasal discharge, and severe diarrhea.
- Mastitis (Cows/Buffaloes): Recognize swollen udder, milk clots, fever, and appetite drop.
- Anthrax & Black Quarter: Recognize sudden fever, muscle swelling, and breathing difficulty.
- Nutrition & Feed: Guide on high-protein concentrate feed, green grass silage, and mineral blocks for milk yield.

### KhamarBari Website Navigation & Tools:
- **My Livestock**: Manage herd registration, tag numbers, and health logs.
- **Marketplace**: Buy and sell organic milk, fresh meat, live farm animals, feed, and tools.
- **Appointments**: Schedule vet consultations and clinic visits.
- **Vaccinations**: Track FMD, Anthrax, PPR, and HS vaccination schedules.
- **Disease Predictor**: AI diagnostic tool analyzing cattle vital signs and rumination data.

### Interaction Rules:
1. Always give practical, clear advice tailored to livestock farmers.
2. Guide users accurately to website sections when they ask about platform features.
3. Strictly stay within livestock, agriculture, and KhamarBari domain. Refuse non-agricultural topics politely.
4. Keep responses concise (under 150 words). Use bullet points for steps. Always advise consulting a certified vet for serious medical conditions.`;

        const input = {
            max_tokens: 500,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                }))
            ]
        };

        if (!ai) {
            if (env.NODE_ENV === "development") {
                return NextResponse.json({
                    response: "[KhamarBari AI Assistant] Hello! I'm your livestock expert assistant. Based on your cattle vital signs and symptoms, ensure proper hydration and check for signs of Foot and Mouth Disease (FMD) or Mastitis. Please consult a local vet if fever persists above 39.5°C."
                });
            }
            return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
        }

        const response: any = await ai.run("@cf/meta/llama-3.1-8b-instruct", input);

        if (!response || (!response.response && typeof response !== 'string')) {
            return NextResponse.json({ 
                response: "I'm sorry, but I received an empty response from the AI service. Please try asking again." 
            });
        }

        const responseText = typeof response === 'string' ? response : response.response;
        return NextResponse.json({ response: responseText });

    } catch (error: any) {
        console.error("Error in chat route:", error);
        return NextResponse.json({ 
            error: "Chat API Error", 
            message: error.message || "Unknown error" 
        }, { status: 500 });
    }
}
