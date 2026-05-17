import { NextRequest } from "next/server";
import { getProfile } from "@/lib/db";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const { messages, vegetables, mealPlan } = await req.json();
  const profile = getProfile();

  const systemPrompt = `You are a helpful meal planning assistant.
Current detected vegetables: ${vegetables?.join(", ") || "none yet"}.
User profile — dietary restrictions: ${profile.dietaryRestrictions.join(", ") || "none"}, cuisine preferences: ${profile.cuisinePreferences.join(", ") || "any"}, servings: ${profile.servings}, pantry: ${profile.pantryItems.join(", ") || "basic pantry"}.
Current meal plan: ${mealPlan ? JSON.stringify(mealPlan) : "not generated yet"}.
Help the user modify recipes, suggest alternatives, create shopping lists, or answer cooking questions.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const response = await getAnthropic().messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        stream: true,
      });

      for await (const event of response) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
