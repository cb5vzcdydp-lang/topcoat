CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  servings REAL NOT NULL,
  ingredients TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS recipes_owner_created_idx ON recipes(owner, created);
CREATE TABLE IF NOT EXISTS meal_plan_entries (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  date TEXT NOT NULL,
  servings REAL NOT NULL,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS meal_plan_owner_date_idx ON meal_plan_entries(owner, date);
CREATE TABLE IF NOT EXISTS grocery_items (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '',
  checked INTEGER NOT NULL DEFAULT 0,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS grocery_owner_created_idx ON grocery_items(owner, created);
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  subscription TEXT NOT NULL,
  created TEXT NOT NULL,
  UNIQUE(owner, endpoint)
);
