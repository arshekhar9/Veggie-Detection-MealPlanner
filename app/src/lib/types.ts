export interface Recipe {
  name: string;
  day: "Monday" | "Wednesday" | "Friday";
  ingredients: string[];
  steps: string[];
  servings: number;
  cuisineType: string;
}

export interface MealPlan {
  recipes: Recipe[];
}
