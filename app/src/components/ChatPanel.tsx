"use client";
import { useState, useRef, useEffect } from "react";
import VoiceButton from "./VoiceButton";
import type { MealPlan } from "@/lib/types";

interface Message { role: "user" | "assistant"; content: string }

interface Props {
  vegetables: string[];
  mealPlan: MealPlan | null;
}

const DAY_COLORS: Record<string, string> = {
  Monday: "bg-blue-50 border-blue-200",
  Wednesday: "bg-purple-50 border-purple-200",
  Friday: "bg-orange-50 border-orange-200",
};

export default function ChatPanel({ vegetables, mealPlan }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updated, vegetables, mealPlan }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          const { text } = JSON.parse(line.slice(6));
          assistantText += text;
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: assistantText }]);
        }
      }
    }
    setLoading(false);
    speak(assistantText);
  };

  return (
    <div className="flex flex-col h-full">
      {mealPlan && mealPlan.recipes.length > 0 && (
        <div className="p-4 border-b overflow-y-auto max-h-72 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Your Meal Plan</h2>
          {mealPlan.recipes.map((r) => (
            <div key={r.day} className={`border rounded-lg p-3 ${DAY_COLORS[r.day] || "bg-gray-50 border-gray-200"}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{r.day}</span>
                <span className="text-xs text-gray-400">{r.cuisineType} · {r.servings} servings</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
              <details className="mt-1">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View recipe</summary>
                <div className="mt-2 text-xs space-y-2">
                  <div>
                    <p className="font-medium text-gray-600">Ingredients:</p>
                    <ul className="list-disc list-inside text-gray-600">{r.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Steps:</p>
                    <ol className="list-decimal list-inside text-gray-600 space-y-0.5">{r.steps.map((s, idx) => <li key={idx}>{s}</li>)}</ol>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="text-2xl mb-2">💬</p>
            <p>Upload a photo to get started, then ask me anything.</p>
            <p className="text-xs mt-1">Try: &quot;Swap Friday&apos;s recipe&quot; or &quot;Give me a shopping list&quot;</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2 items-center">
        <VoiceButton onTranscript={(t) => send(t)} />
        <input
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Ask about your meal plan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          disabled={loading}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="bg-green-600 text-white rounded-full px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-40"
        >
          Send
        </button>
        {speaking && <span className="text-xs text-green-600 animate-pulse">🔊</span>}
      </div>
    </div>
  );
}
