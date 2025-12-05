CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  img_url TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
