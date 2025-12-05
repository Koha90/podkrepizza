CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL, -- card, crypto, cash, etc
  status TEXT NOT NULL, -- pending, success, failed
  transaction_id TEXT, -- ID в платёжной системе
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
