-- EcoRecycle AI Database Schema
-- Compatible with PostgreSQL and SQLite

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Waste Analysis sessions table
CREATE TABLE IF NOT EXISTS waste_analysis (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    radius_km FLOAT DEFAULT 10.0,
    total_items INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Individual Waste classification results table
CREATE TABLE IF NOT EXISTS waste_results (
    id VARCHAR(36) PRIMARY KEY,
    analysis_id VARCHAR(36) NOT NULL,
    waste_type VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    quantity INTEGER DEFAULT 1,
    detected_object VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES waste_analysis(id) ON DELETE CASCADE
);

-- 4. Recycling Facilities table
CREATE TABLE IF NOT EXISTS recycling_facilities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    contact VARCHAR(100),
    capacity_tpd FLOAT NOT NULL, -- tons per day
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Facility Accepted Waste Types & Processing Methods
CREATE TABLE IF NOT EXISTS facility_waste_types (
    id VARCHAR(36) PRIMARY KEY,
    facility_id VARCHAR(36) NOT NULL,
    waste_type VARCHAR(100) NOT NULL,
    processing_method VARCHAR(255) NOT NULL,
    FOREIGN KEY (facility_id) REFERENCES recycling_facilities(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_coords ON recycling_facilities (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_facility_waste ON facility_waste_types (waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_analysis_coords ON waste_analysis (latitude, longitude);
