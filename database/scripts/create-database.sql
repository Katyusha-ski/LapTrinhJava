-- AESP Database Schema - Minimal Version for Speaking Practice Platform
-- Focus: AI-assisted speaking practice with pronunciation feedback

CREATE DATABASE IF NOT EXISTS aesp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE aesp_db;

-- CREATE TABLES

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    mentor_id BIGINT,
    english_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'A1',
    learning_goals TEXT,
    current_streak INT DEFAULT 0,
    total_practice_hours DECIMAL(5,2) DEFAULT 0.00,
    average_pronunciation_score DECIMAL(5,2) DEFAULT 0.00,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH', 'VISA', 'MOMO') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conversation_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
    description TEXT,
    sample_questions JSON,
    difficulty_keywords JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE practice_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    learner_id BIGINT NOT NULL,
    mentor_id BIGINT,
    topic_id BIGINT,
    session_type ENUM('MENTOR_LED', 'AI_ASSISTED') NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INT,
    cost DECIMAL(10,2) DEFAULT 0.00,
    session_status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES conversation_topics(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE INDEX idx_topics_category ON conversation_topics(category);
CREATE INDEX idx_topics_level ON conversation_topics(level);
CREATE INDEX idx_topics_active ON conversation_topics(is_active);

CREATE INDEX idx_sessions_learner ON practice_sessions(learner_id);
CREATE INDEX idx_sessions_mentor ON practice_sessions(mentor_id);
CREATE INDEX idx_sessions_topic ON practice_sessions(topic_id);
CREATE INDEX idx_sessions_status ON practice_sessions(session_status);

-- INSERT ROLES
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System administrator with full access'),
('MENTOR', 'English mentor who teaches learners'),
('LEARNER', 'Student learning English');


-- INSERT USERS
INSERT INTO users (username, email, password_hash, full_name, phone, is_active) VALUES
-- admin user

('admin', 'admin@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'System Admin', '0123456789', TRUE),
('mentor1', 'mentor1@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'Sarah Johnson', '0123456790', TRUE),
('mentor2', 'mentor2@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'David Wilson', '0123456791', TRUE),
('learner1', 'learner1@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'Nguyễn Văn An', '0123456792', TRUE),
('learner2', 'learner2@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'Trần Thị Bình', '0123456793', TRUE),
('learner3', 'learner3@aesp.com', '$2y$10$krxBfAc3EZjPIxPVdbnvAuxsgu7gtjLcWPHTJurUv.S0MBs6wUDgO', 'Lê Minh Cường', '0123456794', TRUE);



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
(4, 1, 'A1', 'Improve basic conversation skills and pronunciation'),
(5, 1, 'B2', 'Business English communication and presentation skills'),
(6, 2, 'C1', 'Native-level fluency and accent reduction');

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

-- INSERT CONVERSATION TOPICS (Speaking scenarios)
INSERT INTO conversation_topics (name, category, level, description, sample_questions, difficulty_keywords) VALUES
('Daily Greetings & Small Talk', 'Daily Life', 'A1', 'Basic greetings and casual conversations', 
 JSON_ARRAY('How are you today?', 'What did you do yesterday?', 'Do you like coffee or tea?'),
 JSON_ARRAY('hello', 'good morning', 'nice to meet you', 'weather', 'weekend')),

('Travel Planning', 'Travel', 'A2', 'Booking hotels, asking for directions, airport conversations',
 JSON_ARRAY('How do I get to the airport?', 'I would like to book a room.', 'Where is the nearest subway station?'),
 JSON_ARRAY('ticket', 'reservation', 'passport', 'luggage', 'directions')),

('Job Interview Practice', 'Business', 'B2', 'Professional interview scenarios and responses',
 JSON_ARRAY('Tell me about yourself.', 'What are your strengths and weaknesses?', 'Why do you want this job?'),
 JSON_ARRAY('experience', 'skills', 'teamwork', 'leadership', 'achievements')),

('Business Negotiations', 'Business', 'C1', 'Advanced negotiation tactics and persuasion',
 JSON_ARRAY('What are your terms?', 'Can we discuss the price?', 'I propose a different approach.'),
 JSON_ARRAY('contract', 'terms', 'agreement', 'compromise', 'leverage')),

('Medical Consultations', 'Healthcare', 'B1', 'Doctor-patient conversations and health topics',
 JSON_ARRAY('I have been feeling sick.', 'What are the symptoms?', 'How often should I take this medicine?'),
 JSON_ARRAY('symptoms', 'diagnosis', 'prescription', 'treatment', 'allergy')),

('Restaurant & Food Ordering', 'Daily Life', 'A1', 'Ordering food, asking about menu items',
 JSON_ARRAY('Can I see the menu?', 'I would like to order...', 'Is this dish spicy?'),
 JSON_ARRAY('menu', 'order', 'delicious', 'waiter', 'bill'));

INSERT INTO practice_sessions 
(learner_id, mentor_id, topic_id, session_type, start_time, end_time, duration_minutes, cost, session_status) 
VALUES
(1, 1, 1, 'MENTOR_LED', NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), 30, 25.00, 'COMPLETED'),
(2, 1, 3, 'MENTOR_LED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 60 MINUTE), 60, 50.00, 'COMPLETED'),
(3, NULL, 4, 'AI_ASSISTED', NOW(), DATE_ADD(NOW(), INTERVAL 15 MINUTE), 15, 0.00, 'COMPLETED');

-- AI Conversations (Chat history with AI)
CREATE TABLE ai_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    speaker ENUM('USER', 'AI') NOT NULL,
    message TEXT NOT NULL,
    corrected_message TEXT,
    grammar_errors JSON,
    vocabulary_suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE
);

-- Pronunciation Scores (Scoring for each pronunciation attempt)
CREATE TABLE pronunciation_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    learner_id BIGINT NOT NULL,
    text_to_read TEXT NOT NULL,
    audio_url VARCHAR(500),
    transcribed_text TEXT,
    accuracy_score DECIMAL(5,2),
    fluency_score DECIMAL(5,2),
    pronunciation_score DECIMAL(5,2),
    detailed_feedback JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
);

-- Indexes for AI and Pronunciation tables
CREATE INDEX idx_ai_conv_session ON ai_conversations(session_id);
CREATE INDEX idx_ai_conv_created ON ai_conversations(created_at);
CREATE INDEX idx_pron_session ON pronunciation_scores(session_id);
CREATE INDEX idx_pron_learner ON pronunciation_scores(learner_id);
CREATE INDEX idx_pron_created ON pronunciation_scores(created_at);

-- Sample AI Conversations
INSERT INTO ai_conversations (session_id, speaker, message, corrected_message, grammar_errors, vocabulary_suggestions) VALUES
(1, 'USER', 'Hello, I want practice speaking today.', 'Hello, I want to practice speaking today.', 
 JSON_ARRAY('want practice -> want to practice'), 
 JSON_ARRAY('practice (verb) needs "to" before infinitive')),
(1, 'AI', 'Hello! That is great! What topic would you like to practice?', NULL, NULL, NULL),
(1, 'USER', 'I like talk about my daily routine.', 'I would like to talk about my daily routine.',
 JSON_ARRAY('I like talk -> I would like to talk'),
 JSON_ARRAY('Use "would like to" for polite requests'));

-- Sample Pronunciation Scores
INSERT INTO pronunciation_scores (session_id, learner_id, text_to_read, transcribed_text, accuracy_score, fluency_score, pronunciation_score, detailed_feedback) VALUES
(1, 1, 'Hello, how are you today?', 'Hello, how are you today?', 95.50, 88.00, 91.75,
 JSON_OBJECT('strengths', JSON_ARRAY('Clear pronunciation', 'Good pace'), 'improvements', JSON_ARRAY('Work on "how" sound'))),
(2, 2, 'I would like to schedule a meeting for tomorrow.', 'I would like to schedule a meeting for tomorrow.', 92.00, 90.00, 91.00,
 JSON_OBJECT('strengths', JSON_ARRAY('Professional tone', 'Good fluency'), 'improvements', JSON_ARRAY('Stress on "schedule"')));

