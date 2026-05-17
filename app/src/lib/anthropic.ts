import Anthropic from "@anthropic-ai/sdk";

export function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const MODEL = "claude-sonnet-4-6";
