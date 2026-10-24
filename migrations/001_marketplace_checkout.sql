-- Run once against the existing Turso database before using marketplace checkout.
-- This migration only adds checkout metadata; it does not alter existing orders.
ALTER TABLE marketplace_orders ADD COLUMN paymentMethod TEXT DEFAULT 'cash_on_delivery';
ALTER TABLE marketplace_orders ADD COLUMN paymentStatus TEXT DEFAULT 'unpaid';
ALTER TABLE marketplace_orders ADD COLUMN customerName TEXT;
ALTER TABLE marketplace_orders ADD COLUMN customerPhone TEXT;
ALTER TABLE marketplace_orders ADD COLUMN customerEmail TEXT;
ALTER TABLE marketplace_orders ADD COLUMN estimatedDelivery TEXT;
