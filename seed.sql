-- seed.sql
-- KhamarBari Management System - Initial Seed Data

-- Admin account (Password: admin123)
INSERT OR IGNORE INTO users (id, email, password, name, role, isVerified, phone, address, createdAt, updatedAt)
VALUES ('admin_1', 'admin@khamarbari.com', '$2b$10$pXC3SpbfCkFLgj4her9pWeZwX.Mv10rFenYeJ9Fhph.x.r8u4KXKq', 'System Administrator', 'admin', 1, NULL, NULL, datetime('now'), datetime('now'));
