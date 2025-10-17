-- Active: 1730199308212@@127.0.0.1@1433
CREATE DATABASE IF NOT EXISTS aesp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE aesp_db;

-- CREATE table

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);

CREATE TABLE mentors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    experience_years INT DEFAULT 0,
    certification VARCHAR(255),
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE learners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    mentor_id BIGINT,
    english_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
    learning_goals TEXT,
    current_streak INT DEFAULT 0,
    total_practice_hours DECIMAL(5,2) DEFAULT 0.00,
    pronunciation_score DECIMAL(5,2) DEFAULT 0.00,
    grammar_score DECIMAL(5,2) DEFAULT 0.00,
    vocabulary_score DECIMAL(5,2) DEFAULT 0.00,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
);

CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH', 'VISA', 'MOMO') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT
);

CREATE TABLE learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    lesson_type VARCHAR(50) NOT NULL,
    lesson_title VARCHAR(200) NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INT DEFAULT 0,
    attempts INT DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);


-- Indexes and OPTIMIZation

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_users_roles_user ON user_roles(user_id);
CREATE INDEX idx_users_roles_role ON user_roles(role_id);

CREATE INDEX idx_mentors_user ON mentors(user_id);
CREATE INDEX idx_mentors_available ON mentors(is_available);
CREATE INDEX idx_mentors_rating ON mentors(rating);

CREATE INDEX idx_learners_user ON learners(user_id);
CREATE INDEX idx_learners_mentor ON learners(mentor_id);
CREATE INDEX idx_learners_level ON learners(english_level);

CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_price ON packages(price);

CREATE INDEX idx_subscriptions_learner ON subscriptions(learner_id);
CREATE INDEX idx_subscriptions_package ON subscriptions(package_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IDX_SUBSCRIPTIONS_DATES ON SUBSCRIPTIONS(START_DATE, END_DATE);

CREATE INDEX idx_progress_learner ON learning_progress(learner_id);
CREATE INDEX idx_progress_type ON learning_progress(lesson_type);
CREATE INDEX idx_progress_completed ON learning_progress(completed_at DESC);

-- INSERT ROLES
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System administrator with full access'),
('MENTOR', 'English mentor who teaches learners'),
('LEARNER', 'Student learning English');


-- INSERT USERS
INSERT INTO users (username, email, password_hash, full_name, phone, is_active) VALUES
-- admin user
('admin', 'admin@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'System Admin', '0123456789', TRUE),

-- Mentor users  
('mentor1', 'mentor1@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Sarah Johnson', '0123456790', TRUE),
('mentor2', 'mentor2@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'David Wilson', '0123456791', TRUE),

-- Learner users
('learner1', 'learner1@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Nguyễn Văn An', '0123456792', TRUE),
('learner2', 'learner2@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Trần Thị Bình', '0123456793', TRUE),
('learner3', 'learner3@aesp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7I6ZqF7DWDaJhYcgikibHv1HYf6kT5.', 'Lê Minh Cường', '0123456794', TRUE);



-- INSERT ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
-- ADMIN
(1, 1),
-- MENTORS
(2, 2),
(3, 2),
-- LEARNERS
(4, 3),
(5, 3),
(6, 3);

-- INSERT MENTORS
INSERT INTO mentors (user_id, bio, experience_years, certification, hourly_rate, rating) VALUES
(2, 'Experienced English teacher with TESOL certification. Specializing in pronunciation and conversation.', 
 5, 'TESOL Certified', 25.00, 4.8),
 
(3, 'Native English speaker with business English expertise. Former corporate trainer.', 
 3, 'TEFL Certified', 30.00, 4.6);

 -- INSERT LEARNERS
INSERT INTO learners (user_id, mentor_id, english_level, learning_goals) VALUES
(4, 1, 'BEGINNER', 'Improve basic conversation skills and pronunciation'),
(5, 1, 'INTERMEDIATE', 'Business English communication and presentation skills'),
(6, 2, 'ADVANCED', 'Native-level fluency and accent reduction');

-- INSERT PACKAGES
INSERT INTO packages (name, description, price, duration_days, features) VALUES
('Basic Plan', 'Essential English practice with AI feedback', 99000.00, 30, 
 JSON_OBJECT('ai_sessions', 100, 'mentor_sessions', 2, 'progress_tracking', true, 'mobile_access', true)),
 
('Premium Plan', 'Advanced learning with mentor support', 199000.00, 30,
 JSON_OBJECT('ai_sessions', 500, 'mentor_sessions', 8, 'progress_tracking', true, 'mobile_access', true, 'priority_support', true)),
 
('Enterprise Plan', 'Complete learning solution for organizations', 499000.00, 90,
 JSON_OBJECT('ai_sessions', 2000, 'mentor_sessions', 20, 'progress_tracking', true, 'mobile_access', true, 'priority_support', true, 'custom_curriculum', true));

 -- INSERT SUBSCRIPTIONS
 INSERT INTO subscriptions (learner_id, package_id, start_date, end_date, payment_amount, payment_method) VALUES
(1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 99000.00, 'CREDIT_CARD'),
(2, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 199000.00, 'PAYPAL'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 199000.00, 'BANK_TRANSFER');

-- INSERT LEARNING PROGRESS
INSERT INTO learning_progress (learner_id, lesson_type, lesson_title, score, time_spent_minutes, attempts) VALUES
-- Learner 1 progress
(1, 'PRONUNCIATION', 'Basic Vowel Sounds', 75.5, 25, 2),
(1, 'VOCABULARY', 'Common Greetings', 88.0, 15, 1),
(1, 'GRAMMAR', 'Present Simple Tense', 82.5, 30, 1),

-- Learner 2 progress  
(2, 'PRONUNCIATION', 'Business Presentation Skills', 91.0, 45, 1),
(2, 'VOCABULARY', 'Business Terminology', 94.5, 20, 1),

-- Learner 3 progress
(3, 'PRONUNCIATION', 'Advanced Accent Training', 96.5, 60, 1),
(3, 'GRAMMAR', 'Complex Sentence Structures', 89.0, 40, 2);
