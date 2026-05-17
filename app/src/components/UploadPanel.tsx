"use client";
import { useState, useRef } from "react";
import type { MealPlan } from "@/lib/types";

interface Props {
  onVeggiesDetected: (veggies: string[]) => void;
  onMealPlanGenerated: (plan: MealPlan) => void;
}

export default function UploadPanel({ onVeggiesDetected, onMealPlanGenerated }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [vegetables, setVegetables] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "detecting" | "planning" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);
      const { filename } = await uploadRes.json();

      setStatus("detecting");
      const detectRes = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (!detectRes.ok) {
        const text = await detectRes.text();
        throw new Error(`Detection failed: ${text.slice(0, 200)}`);
      }
      const { vegetables: veggies } = await detectRes.json();
      setVegetables(veggies);
      onVeggiesDetected(veggies);

      setStatus("planning");
      const planRes = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vegetables: veggies }),
      });
      if (!planRes.ok) throw new Error(`Meal plan failed: ${planRes.statusText}`);
      const plan = await planRes.json();
      onMealPlanGenerated(plan);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {preview ? (
          <img src={preview} alt="Uploaded" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-gray-400">
            <div className="text-4xl mb-2">🥦</div>
            <p className="text-sm font-medium">Drop a photo of your vegetables</p>
            <p className="text-xs mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {status !== "idle" && (
        <div className="text-sm text-center text-green-700 font-medium animate-pulse">
          {status === "uploading" && "Uploading image..."}
          {status === "detecting" && "Detecting vegetables..."}
          {status === "planning" && "Generating meal plan..."}
          {status === "done" && "Done!"}
        </div>
      )}

      {vegetables.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Detected Vegetables</h3>
          <div className="flex flex-wrap gap-1">
            {vegetables.map((v) => (
              <span key={v} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full capitalize">{v}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
