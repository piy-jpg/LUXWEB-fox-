-- Migration 002: Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_verified BOOLEAN DEFAULT TRUE,
    title VARCHAR(255),
    comment TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
