-- schema.sql
-- KhamarBari Management System - Final Database Schema
-- Fully aligned with Livestock Management & Marketplace logic.

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT, 
    name TEXT,
    avatar TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'user', -- 'user' (Marketplace), 'livestock_farmer', 'receptionist', 'admin'
    isVerified INTEGER DEFAULT 0,
    firebaseUid TEXT UNIQUE,
    firebaseMetadata TEXT,
    showPets INTEGER DEFAULT 1,
    showEmail INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 2. Veterinarians table
CREATE TABLE IF NOT EXISTS veterinarians (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT,
    clinic TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    photo TEXT,
    qualification TEXT,
    experience INTEGER,
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    consultationFee REAL,
    availability TEXT,
    bio TEXT,
    latitude REAL,
    longitude REAL,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- 3. Livestock table (Harmonized with API expectations)
CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL, -- cow, goat, buffalo, sheep, camel, other
    breed TEXT,
    age TEXT,
    birthDate TEXT,
    weight TEXT,
    gender TEXT,
    color TEXT,
    photo TEXT,
    notes TEXT,
    medicalNotes TEXT,
    bloodGroup TEXT,
    isNeutered INTEGER DEFAULT 0,
    lastCheckup TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    petId TEXT NOT NULL,
    vetId TEXT, 
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER DEFAULT 30,
    reason TEXT,
    type TEXT DEFAULT 'consultation',
    status TEXT DEFAULT 'pending', 
    notes TEXT,
    fee REAL DEFAULT 0,
    paymentStatus TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (vetId) REFERENCES veterinarians(id) ON DELETE SET NULL
);

-- 5. Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    petId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    manufacturer TEXT,
    dateAdministered TEXT,
    nextDueDate TEXT,
    veterinarian TEXT,
    clinic TEXT,
    batchNumber TEXT,
    notes TEXT,
    status TEXT DEFAULT 'completed',
    reminderSent INTEGER DEFAULT 0,
    reminderDays INTEGER DEFAULT 7,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Marketplace Products table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id TEXT PRIMARY KEY,
    farmerId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- milk_dairy, fresh_meat, live_animals, animal_feed, equipment
    price REAL NOT NULL,
    unit TEXT DEFAULT 'kg', -- kg, liter, head, piece
    stock INTEGER DEFAULT 1,
    images TEXT, -- JSON array of image URLs
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (farmerId) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Marketplace Orders table
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id TEXT PRIMARY KEY,
    buyerId TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    shippingAddress TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (buyerId) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Marketplace Order Items table
CREATE TABLE IF NOT EXISTS marketplace_order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES marketplace_products(id) ON DELETE CASCADE
);

-- 9. Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    category TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    adminResponse TEXT,
    reviewedAt TEXT,
    reviewedBy TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    actionUrl TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Receptionist to Doctor Mapping
CREATE TABLE IF NOT EXISTS receptionist_doctors (
    receptionistId TEXT NOT NULL,
    vetId TEXT NOT NULL,
    assignedAt TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (receptionistId, vetId),
    FOREIGN KEY (receptionistId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vetId) REFERENCES veterinarians(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pets_userId ON pets(userId);
CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments(userId);
CREATE INDEX IF NOT EXISTS idx_appointments_petId ON appointments(petId);
CREATE INDEX IF NOT EXISTS idx_appointments_vetId ON appointments(vetId);
CREATE INDEX IF NOT EXISTS idx_vaccinations_userId ON vaccinations(userId);
CREATE INDEX IF NOT EXISTS idx_vaccinations_petId ON vaccinations(petId);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_farmerId ON marketplace_products(farmerId);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyerId ON marketplace_orders(buyerId);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_orderId ON marketplace_order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_feedbacks_userId ON feedbacks(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_receptionist_doctors_receptionistId ON receptionist_doctors(receptionistId);
CREATE INDEX IF NOT EXISTS idx_receptionist_doctors_vetId ON receptionist_doctors(vetId);
