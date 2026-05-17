"use client";
import { useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import ChatPanel from "@/components/ChatPanel";
import ProfileModal from "@/components/ProfileModal";
import type { MealPlan } from "@/lib/types";

export default function Home() {
  const [vegetables, setVegetables] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <h1 className="text-lg font-semibold text-gray-800">Veggie Meal Planner</h1>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className="text-sm text-gray-600 hover:text-green-700 border rounded-lg px-3 py-1.5 hover:border-green-400 transition-colors"
        >
          ⚙️ My Profile
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r bg-white overflow-y-auto flex-shrink-0">
          <UploadPanel
            onVeggiesDetected={setVegetables}
            onMealPlanGenerated={(plan) => setMealPlan(plan)}
          />
        </aside>

        <main className="flex-1 overflow-hidden">
          <ChatPanel vegetables={vegetables} mealPlan={mealPlan} />
        </main>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
