export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/cf-context";
import { getEnv } from "@/lib/env";

function getLatestUserMessage(messages: Array<{ role?: string; content?: string }> = []) {
  return messages.filter((message) => message.role === "user").slice(-1)[0]?.content || "";
}

function buildKnowledgeResponse(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("who are you") || lower.includes("introduce yourself")) {
    return "I’m KhamarBari AI, your livestock care assistant. I can help with animal health, vaccination schedules, disease basics, marketplace questions, and platform navigation for farmers.";
  }

  if (lower.includes("vaccin") || lower.includes("vaccine")) {
    return "For calves and young stock, common vaccines include FMD, HS, Anthrax, Black Quarter, and in some regions PPR for small ruminants. The exact schedule depends on the animal’s age, disease risk, and local veterinary advice. For a practical plan, consult a vet and keep vaccination records updated in KhamarBari.";
  }

  if (lower.includes("mastitis")) {
    return "Mastitis usually shows up as a swollen, hot, or painful udder, milk changes, and reduced milk yield. Keep the animal comfortable, isolate it if needed, continue milking carefully, and contact a veterinarian quickly if the swelling or fever worsens.";
  }

  if (lower.includes("foot") || lower.includes("mouth") || lower.includes("fmd")) {
    return "Foot and Mouth Disease can cause blisters, drooling, lameness, and fever. Isolate sick animals, avoid moving them unnecessarily, and contact a qualified vet immediately. Good hygiene and vaccination help reduce spread.";
  }

  if (lower.includes("marketplace") || lower.includes("buy") || lower.includes("sell")) {
    return "You can browse livestock products, list your own produce, and manage orders from the marketplace dashboard. The cart flow is ready for browsing and checkout planning, and payment is currently a UI placeholder while the full payment system is prepared.";
  }

  if (lower.includes("symptom") || lower.includes("fever") || lower.includes("cough") || lower.includes("disease")) {
    return "If an animal looks sick, separate it from the herd, keep it hydrated, and monitor temperature and appetite closely. Seek veterinary care promptly for high fever, breathing trouble, severe swelling, or sudden weakness.";
  }

  if (lower.includes("appointment") || lower.includes("vet") || lower.includes("doctor")) {
    return "KhamarBari helps you manage vet appointments, vaccination schedules, and follow-up care from the dashboard. You can also use the platform to keep health notes and reminders in one place.";
  }

  return "I can help with livestock health, vaccinations, disease prevention, marketplace questions, and platform navigation. Tell me what you want help with and I’ll answer with practical farm advice.";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages?: unknown };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const env = getEnv();
    const ai = getAI() || env.AI || (globalThis as any).AI;
    const latestUserMessage = getLatestUserMessage(messages as Array<{ role?: string; content?: string }>);

    const systemPrompt = `You are KhamarBari AI, a practical livestock assistant for Bangladeshi and South Asian farmers. Answer clearly, directly, and use plain language. Focus on animal health, vaccinations, disease prevention, welfare, feed, and platform guidance. If the question is medical, advise a vet for serious cases. Keep responses short, useful, and specific.`;

    const input = {
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message: any) => ({ role: message.role, content: message.content })),
      ],
    };

    if (!ai) {
      return NextResponse.json({ response: buildKnowledgeResponse(latestUserMessage) });
    }

    try {
      const response: any = await ai.run("@cf/meta/llama-3.1-8b-instruct", input);
      const responseText = typeof response === "string" ? response : response?.response;
      if (!responseText || typeof responseText !== "string") {
        return NextResponse.json({ response: buildKnowledgeResponse(latestUserMessage) });
      }
      return NextResponse.json({ response: responseText });
    } catch (error: any) {
      console.error("AI chat fallback triggered:", error);
      return NextResponse.json({ response: buildKnowledgeResponse(latestUserMessage) });
    }
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Chat API Error", message: error.message || "Unknown error" }, { status: 500 });
  }
}
