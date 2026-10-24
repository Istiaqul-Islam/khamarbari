-- Keep historical order line items if a farmer later removes a marketplace product.
-- Product titles and images are snapshots; productId remains as a historical reference.
CREATE TABLE marketplace_order_items_new (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  productTitle TEXT,
  productImage TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES marketplace_orders(id) ON DELETE CASCADE
);
INSERT INTO marketplace_order_items_new (id, orderId, productId, productTitle, productImage, quantity, price)
SELECT id, orderId, productId, productTitle, productImage, quantity, price FROM marketplace_order_items;
DROP TABLE marketplace_order_items;
ALTER TABLE marketplace_order_items_new RENAME TO marketplace_order_items;
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_orderId ON marketplace_order_items(orderId);
