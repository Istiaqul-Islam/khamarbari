-- Non-destructive subscription and order-history improvements.
-- Existing users remain on Free; existing orders and line items are retained.
ALTER TABLE users ADD COLUMN subscriptionPlan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscriptionStartedAt TEXT;
ALTER TABLE users ADD COLUMN subscriptionExpiresAt TEXT;
ALTER TABLE users ADD COLUMN subscriptionCancelledAt TEXT;
ALTER TABLE marketplace_order_items ADD COLUMN productTitle TEXT;
ALTER TABLE marketplace_order_items ADD COLUMN productImage TEXT;
UPDATE marketplace_order_items
SET productTitle = (SELECT title FROM marketplace_products WHERE marketplace_products.id = marketplace_order_items.productId)
WHERE productTitle IS NULL;
UPDATE marketplace_order_items
SET productImage = (SELECT json_extract(images, '$[0]') FROM marketplace_products WHERE marketplace_products.id = marketplace_order_items.productId)
WHERE productImage IS NULL;
CREATE TABLE IF NOT EXISTS marketplace_subscription_payments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 99,
  accountNumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preview_completed',
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_userId ON marketplace_subscription_payments(userId);
