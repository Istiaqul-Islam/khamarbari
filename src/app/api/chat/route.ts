export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/cf-context";
import { getEnv } from "@/lib/env";

function getLatestUserMessage(messages: Array<{ role?: string; content?: string }> = []) {
  return messages.filter((message) => message.role === "user").slice(-1)[0]?.content || "";
}

function buildKnowledgeResponse(message: string) {
  const lower = message.toLowerCase();

  // 1. Analyze temperature
  let tempMatch = lower.match(/(\d+(\.\d+)?)\s*(°c|c|degree|temp)/);
  let temperature = tempMatch ? parseFloat(tempMatch[1]) : null;

  // 2. Analyze milk production
  let milkMatch = lower.match(/(\d+(\.\d+)?)\s*(l|liter|milk)/);
  let milk = milkMatch ? parseFloat(milkMatch[1]) : null;

  // 3. Analyze walking/steps
  let stepsMatch = lower.match(/(\d+)\s*(step)/);
  let steps = stepsMatch ? parseInt(stepsMatch[1]) : null;

  // 4. Analyze faecal consistency
  let hasFaecesIssue = false;
  let faecesType = "";
  if (lower.includes("liquid") || lower.includes("diarrhea") || lower.includes("loose")) {
    hasFaecesIssue = true;
    faecesType = "very liquid faeces (diarrhea)";
  } else if (lower.includes("firm") || lower.includes("hard") || lower.includes("constip")) {
    hasFaecesIssue = true;
    faecesType = "extremely firm (constipation)";
  } else if (lower.includes("black")) {
    hasFaecesIssue = true;
    faecesType = "Black faeces (indicates potential internal bleeding)";
  } else if (lower.includes("blood") || lower.includes("red")) {
    hasFaecesIssue = true;
    faecesType = "Fresh blood in faeces (indicates severe infection or parasites)";
  }

  // Check if we can do diagnostic matching
  if (temperature !== null || milk !== null || steps !== null || hasFaecesIssue) {
    let diagnosis = [];
    let isUnhealthy = false;

    if (temperature !== null) {
      if (temperature < 38.0 || temperature > 38.9) {
        isUnhealthy = true;
        diagnosis.push(`- **Temperature (${temperature}°C)**: Outside the healthy range (38.0°C - 38.9°C). Elevated or low temperatures are strong indicators of fever, infection (like FMD or Mastitis), or hypothermia.`);
      } else {
        diagnosis.push(`- **Temperature (${temperature}°C)**: Within the normal healthy range (38.0°C - 38.9°C).`);
      }
    }

    if (milk !== null) {
      if (milk < 10.0) {
        isUnhealthy = true;
        diagnosis.push(`- **Milk Production (${milk} L)**: Critically low. Healthy dairy cows typically produce 10–26 liters daily depending on breed. A drop below 10 L indicates health stress or mastitis.`);
      } else {
        diagnosis.push(`- **Milk Production (${milk} L)**: Normal/healthy yield.`);
      }
    }

    if (steps !== null) {
      if (steps < 9000) {
        isUnhealthy = true;
        diagnosis.push(`- **Walking Activity (${steps} steps)**: Low walking capacity. Healthy cattle walk between 9,000 and 13,000+ steps per day. A drop below 9,000 steps indicates lethargy, foot disease, or weakness.`);
      } else {
        diagnosis.push(`- **Walking Activity (${steps} steps)**: Normal/healthy activity level.`);
      }
    }

    if (hasFaecesIssue) {
      isUnhealthy = true;
      diagnosis.push(`- **Faecal Consistency**: Detected **${faecesType}**. Healthy cattle should have ideal faecal consistency. Abnormal faeces suggest dietary issues, bacterial infections, or parasites.`);
    }

    let response = `### Cattle Health Analysis (Cattle Dataset Benchmarks):\n\nBased on your query, here is an analysis of your cattle's vitals:\n\n${diagnosis.join("\n")}\n\n`;
    if (isUnhealthy) {
      response += `**Status: Unhealthy**\n\n**Recommendation**: Your animal shows one or more abnormal vitals based on cattle reference datasets. Please separate the animal from the herd, ensure clean water access, and **contact a qualified veterinarian immediately** for clinical diagnosis and treatment.`;
    } else {
      response += `**Status: Healthy**\n\n**Recommendation**: Vitals appear to be within normal parameters. Continue regular monitoring, clean feed, and maintain up-to-date vaccination records.`;
    }
    return response;
  }

  // Default structured knowledge base answers
  if (lower.includes("who are you") || lower.includes("introduce yourself")) {
    return "I’m KhamarBari AI, your professional livestock care assistant. I can help with animal health, vaccination schedules, disease basics (like Mastitis or FMD), diet/nutrition, and platform navigation based on livestock health datasets.";
  }

  if (lower.includes("vaccin") || lower.includes("vaccine")) {
    return "For calves and young stock, common vaccines in South Asia include FMD (Foot and Mouth Disease), HS (Haemorrhagic Septicaemia), Anthrax, Black Quarter, and PPR for goats. Schedule vaccinations with your vet and log them in KhamarBari.";
  }

  if (lower.includes("mastitis")) {
    return "Mastitis causes swollen, hot udders, milk changes (clots/watery milk), and a drop in milk production. Isolate the cow, continue milking carefully to relieve pressure, and consult a vet immediately for antibiotics.";
  }

  if (lower.includes("foot") || lower.includes("mouth") || lower.includes("fmd")) {
    return "Foot and Mouth Disease (FMD) causes blisters in the mouth and hooves, heavy drooling, lameness, and fever. Isolate infected cattle immediately to prevent rapid herd transmission and seek vet assistance.";
  }

  if (lower.includes("diet") || lower.includes("feed") || lower.includes("nutrition") || lower.includes("eat")) {
    return "Cattle need a balanced diet of green fodder (Napier grass, silage), dry fodder (straw), and concentrate mix (bran, oil cakes) based on their milk yield and pregnancy status. Clean drinking water must be available 24/7.";
  }

  if (lower.includes("goat")) {
    return "Goats should be checked daily for alert behavior, bright eyes, clean nose, and normal eating. Look out for coughing, diarrhea, or reluctance to stand. Keep goat sheds dry and ventilated to prevent pneumonia and PPR.";
  }

  return "I can help you analyze cattle health vitals (temperature, milk production, walking steps, faecal consistency) using cattle health datasets. Try asking: *'My cow has a temp of 39.5°C and black faeces, is it healthy?'* or *'What is the normal milk production for healthy cross breed cows?'*";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages?: unknown };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const env = getEnv();
    
    // Robustly attempt to retrieve the Cloudflare Workers AI binding
    let ai = getAI();
    
    if (!ai) {
      try {
        const { getRequestContext } = require("@cloudflare/next-on-pages");
        const cfCtx = getRequestContext();
        if (cfCtx?.env?.AI) {
          ai = cfCtx.env.AI;
        }
      } catch (e) {}
    }
    
    if (!ai) {
      ai = env.AI || (globalThis as any).AI || (globalThis as any).__env__?.AI || (globalThis as any).env?.AI;
    }

    const latestUserMessage = getLatestUserMessage(messages as Array<{ role?: string; content?: string }>);

    const systemPrompt = `You are KhamarBari AI, a professional livestock care assistant specializing in cattle and ruminant health for South Asian farmers.
You have access to a clinical cattle health dataset with the following normal (healthy) and abnormal (unhealthy) reference ranges:

1. Body Temperature: Normal/healthy range is 38.0°C to 38.9°C. Temperatures outside this range (e.g., elevated to 39.5°C - 40.6°C, or dropped to 35.5°C) indicate an unhealthy status, likely fever or hypothermia.
2. Milk Production: Healthy normal breed cows produce 20-26.5 L/day; healthy cross breeds produce 9.7-15.1 L/day. Drops below 10 L/day for normal breeds or below 6 L/day for cross breeds are strong indicators of illness.
3. Walking Capacity: Healthy cows walk 9,000 to 13,200+ steps/day. Lethargic or sick cows walk fewer than 7,000 steps/day (often 5,000 - 6,900 steps).
4. Sleeping Duration: Healthy cows sleep 2.8 to 4.4 hours/day. Sick/unhealthy cows show excessive sleeping/lethargy of 6.0 to 7.2 hours/day.
5. Lying Down Duration: Healthy cows lie down for 12.0 to 14.1 hours/day. Unhealthy cows often spend 14.2 to 16.4 hours lying down.
6. Eating & Ruminating Duration: Healthy cows eat for 3.0 - 4.9 hours and ruminate for 5.0 - 7.0 hours/day. Unhealthy cows have reduced eating (1.3 - 2.9 hours) and ruminating (3.0 - 4.8 hours).
7. Faecal Consistency: Healthy status has "ideal" faecal consistency. Unhealthy indicators include "extremely firm" (constipation), "very liquid faeces" (diarrhea), "Black faeces" (internal bleeding or digestion issues), and "Fresh blood in faeces" (severe infection/disease).
8. Heart Rate: Healthy is 49 to 83 bpm. Sick/unhealthy cows often show reduced heart rate (37 to 48 bpm) or elevated rate.
9. Body Condition Score (BCS): 1 to 5. Ideal is 3.

Instructions:
- When a user asks about health symptoms, temperature, milk yield, walking steps, sleep, ruminating, or faeces, use the above dataset benchmarks to analyze if their cattle is healthy or unhealthy.
- Explain clearly why the cattle is likely healthy or unhealthy (e.g. "A temperature of 39.5°C with black faeces indicates an unhealthy cow because normal temp is 38.0-38.9°C and normal faeces should be ideal, not black").
- Give practical livestock care advice. If the cattle is unhealthy, strongly advise them to consult a qualified veterinarian.
- Keep answers professional, clear, concise, and structured.`;

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
