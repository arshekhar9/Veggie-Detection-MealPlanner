"use client";
import { useState, useEffect } from "react";

interface Profile {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  pantryItems: string[];
  servings: number;
}

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState<Profile>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    pantryItems: [],
    servings: 2,
  });
  const [inputs, setInputs] = useState({ dietary: "", cuisine: "", pantry: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
  }, []);

  const addTag = (field: keyof typeof inputs, profileKey: keyof Profile) => {
    const val = inputs[field].trim();
    if (!val) return;
    setProfile((p) => ({ ...p, [profileKey]: [...(p[profileKey] as string[]), val] }));
    setInputs((i) => ({ ...i, [field]: "" }));
  };

  const removeTag = (profileKey: keyof Profile, idx: number) => {
    setProfile((p) => ({ ...p, [profileKey]: (p[profileKey] as string[]).filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setSaving(false);
    onClose();
  };

  const TagInput = ({ label, field, profileKey }: { label: string; field: keyof typeof inputs; profileKey: keyof Profile }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={inputs[field]}
          onChange={(e) => setInputs((i) => ({ ...i, [field]: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && addTag(field, profileKey)}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button onClick={() => addTag(field, profileKey)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {(profile[profileKey] as string[]).map((tag, i) => (
          <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(profileKey, i)} className="text-green-600 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Profile</h2>
        <TagInput label="Dietary Restrictions" field="dietary" profileKey="dietaryRestrictions" />
        <TagInput label="Cuisine Preferences" field="cuisine" profileKey="cuisinePreferences" />
        <TagInput label="Pantry Staples" field="pantry" profileKey="pantryItems" />
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            min={1}
            max={20}
            value={profile.servings}
            onChange={(e) => setProfile((p) => ({ ...p, servings: Number(e.target.value) }))}
            className="border rounded px-2 py-1 text-sm w-20"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
