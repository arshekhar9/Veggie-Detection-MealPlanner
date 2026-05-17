import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { getProfile } from "@/lib/db";
import type { MealPlan } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { vegetables } = await req.json();
  const profile = getProfile();

  const prompt = `You are a meal planning assistant. Generate 3 recipes for Monday, Wednesday, and Friday.

Detected vegetables: ${vegetables.join(", ")}
Pantry staples available: ${profile.pantryItems.join(", ") || "basic pantry (salt, pepper, oil, garlic, onion)"}
Dietary restrictions: ${profile.dietaryRestrictions.join(", ") || "none"}
Cuisine preferences: ${profile.cuisinePreferences.join(", ") || "any"}
Servings per meal: ${profile.servings}

Rules:
- Only use the detected vegetables and pantry staples as ingredients
- Respect all dietary restrictions strictly
- Match cuisine preferences where possible
- Scale all recipes to ${profile.servings} servings

Return ONLY valid JSON matching this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "day": "Monday",
      "ingredients": ["1 cup carrot, diced", "..."],
      "steps": ["Step 1...", "Step 2..."],
      "servings": ${profile.servings},
      "cuisineType": "Mediterranean"
    }
  ]
}`;

  const response = await getAnthropic().messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";
  const match = text.match(/\{[\s\S]*\}/);
  const mealPlan: MealPlan = match ? JSON.parse(match[0]) : { recipes: [] };

  return NextResponse.json(mealPlan);
}
