import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "profile.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const { mkdirSync } = require("fs");
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        dietary_restrictions TEXT DEFAULT '[]',
        cuisine_preferences TEXT DEFAULT '[]',
        pantry_items TEXT DEFAULT '[]',
        servings INTEGER DEFAULT 2
      );
      INSERT OR IGNORE INTO profile (id) VALUES (1);
    `);
  }
  return db;
}

export interface UserProfile {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  pantryItems: string[];
  servings: number;
}

export function getProfile(): UserProfile {
  const row = getDb()
    .prepare("SELECT * FROM profile WHERE id = 1")
    .get() as Record<string, string | number>;
  return {
    dietaryRestrictions: JSON.parse(row.dietary_restrictions as string),
    cuisinePreferences: JSON.parse(row.cuisine_preferences as string),
    pantryItems: JSON.parse(row.pantry_items as string),
    servings: row.servings as number,
  };
}

export function saveProfile(profile: UserProfile): void {
  getDb()
    .prepare(
      `UPDATE profile SET
        dietary_restrictions = ?,
        cuisine_preferences = ?,
        pantry_items = ?,
        servings = ?
      WHERE id = 1`
    )
    .run(
      JSON.stringify(profile.dietaryRestrictions),
      JSON.stringify(profile.cuisinePreferences),
      JSON.stringify(profile.pantryItems),
      profile.servings
    );
}
