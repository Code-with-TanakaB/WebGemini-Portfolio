-- WebGemini Affiliate Tracking System Database Schema

-- Table: affiliates
-- Stores influencer/affiliate information
CREATE TABLE affiliates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    social_media_handle VARCHAR(255),
    platform VARCHAR(100), -- e.g., Instagram, TikTok, YouTube, etc.
    coupon_code VARCHAR(10) UNIQUE NOT NULL, -- Must end with @wg
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    commission_rate_starter DECIMAL(5,2) DEFAULT 10.00, -- 10% for starter plan
    commission_rate_professional DECIMAL(5,2) DEFAULT 25.00, -- 25% for professional
    commission_rate_enterprise DECIMAL(5,2) DEFAULT 25.00, -- 25% for enterprise
    total_referrals INT DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0.00,
    pending_commission DECIMAL(10,2) DEFAULT 0.00,
    paid_commission DECIMAL(10,2) DEFAULT 0.00,
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(255),
    payment_method ENUM('bank_transfer', 'paypal', 'crypto') DEFAULT 'bank_transfer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupon (coupon_code),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Table: referrals
-- Tracks every customer referred by an affiliate
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    affiliate_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    service_type VARCHAR(100), -- website-design, e-commerce, etc.
    plan_type ENUM('starter', 'professional', 'enterprise') NOT NULL,
    budget_range VARCHAR(50),
    project_details TEXT,
    coupon_code VARCHAR(10) NOT NULL,
    plan_price DECIMAL(10,2), -- Actual plan price (R1500, R2500, R4000+)
    commission_rate DECIMAL(5,2), -- Commission percentage applied
    commission_amount DECIMAL(10,2), -- Calculated commission
    status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    conversion_date TIMESTAMP NULL,
    referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
    INDEX idx_affiliate (affiliate_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_referred_at (referred_at)
);

-- Table: commission_payments
-- Tracks commission payments made to affiliates
CREATE TABLE commission_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    affiliate_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    notes TEXT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100), -- Admin who processed payment
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
    INDEX idx_affiliate (affiliate_id),
    INDEX idx_payment_date (payment_date)
);

-- Table: affiliate_analytics
-- Daily analytics snapshot for performance tracking
CREATE TABLE affiliate_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    affiliate_id INT NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    referrals INT DEFAULT 0,
    conversions INT DEFAULT 0,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
    UNIQUE KEY unique_affiliate_date (affiliate_id, date),
    INDEX idx_date (date)
);

-- Table: admin_users
-- Admin users who can manage the affiliate system
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'viewer') DEFAULT 'admin',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
);

-- Table: coupon_usage_log
-- Detailed log of every coupon code usage attempt
CREATE TABLE coupon_usage_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(10),
    affiliate_id INT,
    customer_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    validation_status ENUM('valid', 'invalid', 'expired') NOT NULL,
    form_data JSON, -- Store entire form submission
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coupon (coupon_code),
    INDEX idx_affiliate (affiliate_id),
    INDEX idx_used_at (used_at)
);

-- Sample data for testing
INSERT INTO affiliates (name, email, social_media_handle, platform, coupon_code, status) VALUES
('John Influencer', 'john@example.com', '@johninfluencer', 'Instagram', 'JOHN@wg', 'active'),
('Sarah Creator', 'sarah@example.com', '@sarahcreates', 'TikTok', 'SARAH@wg', 'active'),
('Mike Blogger', 'mike@example.com', '@mikeblog', 'YouTube', 'MIKE@wg', 'active');

-- Create admin user (password: admin123 - CHANGE THIS!)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@webgemini.co.za', '$2b$10$rBV2kqHCOqH.fMY4PCmvvORqLvPYnFJWJmOp5dKGV8N5wL5vYN7LS', 'super_admin');
