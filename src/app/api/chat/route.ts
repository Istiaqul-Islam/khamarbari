export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

function buildFallbackResponse(messages: Array<{ role?: string; content?: string }> = []) {
  const latest = messages.filter((m) => m.role === "user").slice(-1)[0]?.content?.toLowerCase() || "";
  const lower = latest.trim();

  if (lower.includes("marketplace") || lower.includes("buy") || lower.includes("sell")) {
    return "For marketplace help, you can browse listings from the dashboard, list your own product, and use the cart for checkout. Payment is currently a UI placeholder while we prepare the full payment flow.";
  }

  if (lower.includes("symptom") || lower.includes("fever") || lower.includes("cough") || lower.includes("mastitis") || lower.includes("foot") || lower.includes("disease")) {
    return "If the animal seems sick, separate it from the herd, keep it hydrated, and contact a certified vet quickly. For urgent signs like high fever, swollen udder, or difficulty breathing, seek veterinary care immediately.";
  }

  if (lower.includes("vaccin") || lower.includes("appointment") || lower.includes("vet")) {
    return "You can use KhamarBari to manage appointments, vaccination schedules, and veterinary follow-ups from the dashboard.";
  }

  return "I can help with livestock health, disease basics, marketplace questions, and platform navigation. Please tell me what you need help with and I will guide you step by step.";
}

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
- Marketplaces: Browse products, list produce, and manage cart checkout.
- Appointments: Schedule vet consultations and clinic visits.
- Vaccinations: Track FMD, Anthrax, PPR, and HS vaccination schedules.
- Disease Predictor: Analyze cattle vital signs and rumination data.

### Interaction Rules:
1. Always give practical, clear advice tailored to livestock farmers.
2. Guide users to relevant dashboard sections when they ask about platform features.
3. Stay within livestock, agriculture, and KhamarBari domain.
4. Keep responses concise and easy to follow.`;

    const input = {
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message: any) => ({ role: message.role, content: message.content })),
      ],
    };

    if (!ai) {
      return NextResponse.json({ response: buildFallbackResponse(messages as Array<{ role?: string; content?: string }>) });
    }

    try {
      const response: any = await ai.run("@cf/meta/llama-3.1-8b-instruct", input);
      const responseText = typeof response === "string" ? response : response?.response;
      if (!responseText) {
        return NextResponse.json({ response: buildFallbackResponse(messages as Array<{ role?: string; content?: string }>) });
      }
      return NextResponse.json({ response: responseText });
    } catch (error: any) {
      console.error("AI chat fallback triggered:", error);
      return NextResponse.json({ response: buildFallbackResponse(messages as Array<{ role?: string; content?: string }>) });
    }
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Chat API Error", message: error.message || "Unknown error" }, { status: 500 });
  }
}
