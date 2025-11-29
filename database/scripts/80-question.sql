-- ====================================================================================
-- 2. BỔ SUNG BẢNG CHO NGÂN HÀNG CÂU HỎI (QUIZ BANK)
-- ====================================================================================

-- Bảng Questions: Lưu trữ câu hỏi trắc nghiệm
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type ENUM('MULTIPLE_CHOICE', 'FILL_IN_BLANK') NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    cefr_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL, -- Dùng cho Adaptive Testing
    topic_area VARCHAR(50),                                      -- Grammar, Vocabulary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Answers: Lưu trữ các lựa chọn đáp án
CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index cho việc truy vấn nhanh câu hỏi theo Level
CREATE INDEX idx_questions_level ON questions(cefr_level);
CREATE INDEX idx_answers_question ON answers(question_id);


-- ====================================================================================
-- 3. DỮ LIỆU MẪU CÂU HỎI (80 CÂU)
-- ====================================================================================

-- Tạm thời tắt kiểm tra khóa ngoại để chèn dữ liệu theo nhóm
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------
-- A1: BEGINNER (ID 1 - 15)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(1, 'Hello. My name ___ John.', 'A1', 'Grammar'),
(2, 'I have two ___ and one sister.', 'A1', 'Vocabulary'),
(3, '___ is the capital of France?', 'A1', 'Grammar'),
(4, 'She ___ to school every day.', 'A1', 'Grammar'),
(5, 'What time ___ it?', 'A1', 'Grammar'),
(6, 'This is ___ apple.', 'A1', 'Grammar'),
(7, 'We are ___ the cinema now.', 'A1', 'Vocabulary'),
(8, '___ your keys on the table?', 'A1', 'Grammar'),
(9, 'They ___ not like coffee.', 'A1', 'Grammar'),
(10, 'Can I have ___ water, please?', 'A1', 'Grammar'),
(11, 'My favorite color is ___ .', 'A1', 'Vocabulary'),
(12, 'I am a teacher. ___ is my job.', 'A1', 'Grammar'),
(13, 'How many ___ are there in a week?', 'A1', 'Vocabulary'),
(14, 'He has a blue car and ___ red motorcycle.', 'A1', 'Grammar'),
(15, 'I usually ___ up at seven o\'clock.', 'A1', 'Vocabulary');

-- ---------------------------------
-- A2: PRE-INTERMEDIATE (ID 16 - 30)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(16, 'I ___ TV when the phone rang.', 'A2', 'Grammar'),
(17, 'She is better ___ tennis than me.', 'A2', 'Grammar'),
(18, 'I need to buy ___ bread and some milk.', 'A2', 'Grammar'),
(19, 'The train is ___ than the bus.', 'A2', 'Grammar'),
(20, 'Did you ___ shopping yesterday?', 'A2', 'Grammar'),
(21, 'We don\'t have ___ money.', 'A2', 'Grammar'),
(22, 'He ___ a new book last month.', 'A2', 'Grammar'),
(23, '___ you ever been to London?', 'A2', 'Grammar'),
(24, 'The concert starts ___ 7 p.m.', 'A2', 'Grammar'),
(25, 'They are planning to visit the ___ tomorrow.', 'A2', 'Vocabulary'),
(26, 'The weather is very ___ today.', 'A2', 'Vocabulary'),
(27, 'I think it ___ rain soon.', 'A2', 'Grammar'),
(28, 'You shouldn\'t ___ so much fast food.', 'A2', 'Grammar'),
(29, 'I can\'t find my phone. Where ___ it?', 'A2', 'Grammar'),
(30, 'We enjoy ___ board games.', 'A2', 'Grammar');

-- ---------------------------------
-- B1: INTERMEDIATE (ID 31 - 45)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(31, 'If I had more time, I ___ learn Spanish.', 'B1', 'Grammar'),
(32, 'The house ___ last year.', 'B1', 'Grammar'),
(33, 'Despite ___ hard, he failed the exam.', 'B1', 'Grammar'),
(34, 'I stopped ___ when I turned twenty.', 'B1', 'Grammar'),
(35, 'We looked ___ the missing keys for hours.', 'B1', 'Vocabulary'),
(36, 'She is the woman ___ works at the bank.', 'B1', 'Grammar'),
(37, 'It\'s difficult to get ___ the habit of checking social media.', 'B1', 'Vocabulary'),
(38, 'The movie was quite long, but it was ___ interesting.', 'B1', 'Vocabulary'),
(39, 'He apologized ___ being late.', 'B1', 'Grammar'),
(40, 'They didn\'t recognize her ___ she changed her hair.', 'B1', 'Grammar'),
(41, 'I wish I ___ play a musical instrument.', 'B1', 'Grammar'),
(42, 'You will be successful ___ you keep working hard.', 'B1', 'Grammar'),
(43, 'We are looking forward ___ you again.', 'B1', 'Grammar'),
(44, 'I\'ve been working on this project ___ three weeks.', 'B1', 'Grammar'),
(45, 'She suggested ___ out for dinner.', 'B1', 'Grammar');

-- ---------------------------------
-- B2: UPPER-INTERMEDIATE (ID 46 - 60)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(46, 'Hardly had he arrived home ___ he was asked to leave again.', 'B2', 'Grammar'),
(47, 'The government is being urged to take ___ action against climate change.', 'B2', 'Vocabulary'),
(48, 'She tried to ___ the conversation away from her personal life.', 'B2', 'Vocabulary'),
(49, 'The company is ___ for a significant technological breakthrough.', 'B2', 'Vocabulary'),
(50, 'I prefer to work with people ___ enthusiasm is infectious.', 'B2', 'Grammar'),
(51, 'Only after the war ended ___ the truth be revealed.', 'B2', 'Grammar'),
(52, 'I can\'t ___ with all the noise in the office.', 'B2', 'Vocabulary'),
(53, 'The presentation was confusing; it was not very ___ .', 'B2', 'Vocabulary'),
(54, 'The factory owner was charged with ___ pollution laws.', 'B2', 'Vocabulary'),
(55, 'Were it not ___ his timely intervention, the deal would have failed.', 'B2', 'Grammar'),
(56, 'You must ensure that your writing is free from ___ errors.', 'B2', 'Vocabulary'),
(57, 'The committee ___ the report for several hours before voting.', 'B2', 'Grammar'),
(58, 'The new policy will be ___ effect from next month.', 'B2', 'Grammar'),
(59, 'The meeting was postponed ___ until the manager returned.', 'B2', 'Grammar'),
(60, 'He took ___ of the opportunity to travel abroad.', 'B2', 'Vocabulary');

-- ---------------------------------
-- C1: ADVANCED (ID 61 - 70)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(61, 'The CEO\'s comments were considered highly ___ and caused a stir in the media.', 'C1', 'Vocabulary'),
(62, '___ what the critics say, the film is a masterpiece.', 'C1', 'Grammar'),
(63, 'She has always taken her responsibilities very ___ .', 'C1', 'Vocabulary'),
(64, 'The sudden resignation of the director sent ___ through the organization.', 'C1', 'Vocabulary'),
(65, 'We are committed to developing a ___ strategy for expansion.', 'C1', 'Vocabulary'),
(66, 'If the train had been on time, I ___ missed the connection.', 'C1', 'Grammar'),
(67, 'His argument was so ___ that nobody could find fault with it.', 'C1', 'Vocabulary'),
(68, 'The project was abandoned due to an ___ of funds.', 'C1', 'Vocabulary'),
(69, 'The new regulations are ___ to improve safety standards.', 'C1', 'Grammar'),
(70, 'He was determined to succeed, ___ the obstacles.', 'C1', 'Grammar');

-- ---------------------------------
-- C2: NEAR-NATIVE (ID 71 - 80)
-- ---------------------------------
INSERT INTO questions (id, question_text, cefr_level, topic_area) VALUES
(71, '___ as it may seem, the company managed to turn a profit.', 'C2', 'Grammar'),
(72, 'She managed to ___ the problem by simplifying the entire process.', 'C2', 'Vocabulary'),
(73, 'The book is a ___ account of his experiences in the wilderness.', 'C2', 'Vocabulary'),
(74, 'The politician was accused of ___ the public with false promises.', 'C2', 'Vocabulary'),
(75, 'This ancient custom has been passed down ___ generation to generation.', 'C2', 'Grammar'),
(76, 'To try to solve this issue would be akin ___ flogging a dead horse.', 'C2', 'Vocabulary'),
(77, 'The atmosphere in the room was fraught ___ tension.', 'C2', 'Vocabulary'),
(78, 'He decided to ___ a path away from his family\'s tradition.', 'C2', 'Vocabulary'),
(79, 'His commitment to the cause was ___ doubt.', 'C2', 'Grammar'),
(80, 'The argument was based on a fundamental ___ of the facts.', 'C2', 'Vocabulary');


-- -----------------------------------------------------------------------------------------------------
-- ANSWERS (Chèn 4 đáp án cho mỗi câu, đánh dấu đáp án đúng là TRUE)
-- -----------------------------------------------------------------------------------------------------

INSERT INTO answers (question_id, answer_text, is_correct) VALUES
-- Q1 (A1: is)
(1, 'am', FALSE), (1, 'is', TRUE), (1, 'are', FALSE), (1, 'be', FALSE),
-- Q2 (A1: brothers)
(2, 'brother', FALSE), (2, 'brothers', TRUE), (2, 'brotheres', FALSE), (2, 'brother\'s', FALSE),
-- Q3 (A1: What)
(3, 'Who', FALSE), (3, 'When', FALSE), (3, 'What', TRUE), (3, 'Where', FALSE),
-- Q4 (A1: goes)
(4, 'go', FALSE), (4, 'going', FALSE), (4, 'goes', TRUE), (4, 'went', FALSE),
-- Q5 (A1: is)
(5, 'do', FALSE), (5, 'is', TRUE), (5, 'does', FALSE), (5, 'are', FALSE),
-- Q6 (A1: an)
(6, 'a', FALSE), (6, 'an', TRUE), (6, 'the', FALSE), (6, 'some', FALSE),
-- Q7 (A1: at)
(7, 'on', FALSE), (7, 'in', FALSE), (7, 'at', TRUE), (7, 'to', FALSE),
-- Q8 (A1: Are)
(8, 'Is', FALSE), (8, 'Do', FALSE), (8, 'Are', TRUE), (8, 'Have', FALSE),
-- Q9 (A1: do)
(9, 'do', TRUE), (9, 'does', FALSE), (9, 'is', FALSE), (9, 'are', FALSE),
-- Q10 (A1: some)
(10, 'a', FALSE), (10, 'an', FALSE), (10, 'some', TRUE), (10, 'many', FALSE),
-- Q11 (A1: blue)
(11, 'big', FALSE), (11, 'happy', FALSE), (11, 'blue', TRUE), (11, 'fast', FALSE),
-- Q12 (A1: It)
(12, 'He', FALSE), (12, 'It', TRUE), (12, 'They', FALSE), (12, 'She', FALSE),
-- Q13 (A1: days)
(13, 'weekends', FALSE), (13, 'days', TRUE), (13, 'hours', FALSE), (13, 'months', FALSE),
-- Q14 (A1: a)
(14, 'an', FALSE), (14, 'a', TRUE), (14, 'the', FALSE), (14, 'some', FALSE),
-- Q15 (A1: get)
(15, 'gets', FALSE), (15, 'get', TRUE), (15, 'got', FALSE), (15, 'getting', FALSE),
-- Q16 (A2: was watching)
(16, 'watched', FALSE), (16, 'was watching', TRUE), (16, 'watch', FALSE), (16, 'have watched', FALSE),
-- Q17 (A2: at)
(17, 'in', FALSE), (17, 'on', FALSE), (17, 'at', TRUE), (17, 'to', FALSE),
-- Q18 (A2: some)
(18, 'a', FALSE), (18, 'an', FALSE), (18, 'some', TRUE), (18, 'many', FALSE),
-- Q19 (A2: slower)
(19, 'more slow', FALSE), (19, 'slower', TRUE), (19, 'slow', FALSE), (19, 'slowlier', FALSE),
-- Q20 (A2: go)
(20, 'went', FALSE), (20, 'gone', FALSE), (20, 'go', TRUE), (20, 'going', FALSE),
-- Q21 (A2: much)
(21, 'many', FALSE), (21, 'much', TRUE), (21, 'a lot', FALSE), (21, 'some', FALSE),
-- Q22 (A2: bought)
(22, 'buy', FALSE), (22, 'buys', FALSE), (22, 'bought', TRUE), (22, 'is buying', FALSE),
-- Q23 (A2: Have)
(23, 'Did', FALSE), (23, 'Are', FALSE), (23, 'Have', TRUE), (23, 'Do', FALSE),
-- Q24 (A2: at)
(24, 'in', FALSE), (24, 'on', FALSE), (24, 'at', TRUE), (24, 'to', FALSE),
-- Q25 (A2: beach)
(25, 'beach', TRUE), (25, 'library', FALSE), (25, 'hospital', FALSE), (25, 'office', FALSE),
-- Q26 (A2: windy)
(26, 'wind', FALSE), (26, 'windy', TRUE), (26, 'winded', FALSE), (26, 'windless', FALSE),
-- Q27 (A2: will)
(27, 'is', FALSE), (27, 'going to', FALSE), (27, 'will', TRUE), (27, 'must', FALSE),
-- Q28 (A2: eat)
(28, 'to eat', FALSE), (28, 'eating', FALSE), (28, 'eat', TRUE), (28, 'ate', FALSE),
-- Q29 (A2: is)
(29, 'are', FALSE), (29, 'is', TRUE), (29, 'do', FALSE), (29, 'does', FALSE),
-- Q30 (A2: playing)
(30, 'to play', FALSE), (30, 'play', FALSE), (30, 'playing', TRUE), (30, 'played', FALSE),
-- Q31 (B1: would)
(31, 'will', FALSE), (31, 'would', TRUE), (31, 'can', FALSE), (31, 'might have', FALSE),
-- Q32 (B1: was sold)
(32, 'sold', FALSE), (32, 'was sold', TRUE), (32, 'is sold', FALSE), (32, 'has sold', FALSE),
-- Q33 (B1: studying)
(33, 'to study', FALSE), (33, 'studying', TRUE), (33, 'to studying', FALSE), (33, 'study', FALSE),
-- Q34 (B1: smoking) <-- ĐÃ SỬA LỖI Ở ĐÂY
(34, 'to smoke', FALSE), (34, 'smoking', TRUE), (34, 'smoke', FALSE), (34, 'smoked', FALSE),
-- Q35 (B1: for)
(35, 'at', FALSE), (35, 'for', TRUE), (35, 'after', FALSE), (35, 'up', FALSE),
-- Q36 (B1: who)
(36, 'which', FALSE), (36, 'what', FALSE), (36, 'who', TRUE), (36, 'whose', FALSE),
-- Q37 (B1: out of)
(37, 'of', FALSE), (37, 'out of', TRUE), (37, 'from', FALSE), (37, 'off', FALSE),
-- Q38 (B1: rather)
(38, 'very', FALSE), (38, 'rather', TRUE), (38, 'too much', FALSE), (38, 'quite much', FALSE),
-- Q39 (B1: for)
(39, 'on', FALSE), (39, 'for', TRUE), (39, 'to', FALSE), (39, 'about', FALSE),
-- Q40 (B1: until)
(40, 'unless', FALSE), (40, 'since', FALSE), (40, 'until', TRUE), (40, 'if', FALSE),
-- Q41 (B1: could)
(41, 'can', FALSE), (41, 'could', TRUE), (41, 'will', FALSE), (41, 'might', FALSE),
-- Q42 (B1: as long as)
(42, 'despite', FALSE), (42, 'as long as', TRUE), (42, 'so that', FALSE), (42, 'even though', FALSE),
-- Q43 (B1: to seeing)
(43, 'to see', FALSE), (43, 'to seeing', TRUE), (43, 'see', FALSE), (43, 'seeing', FALSE),
-- Q44 (B1: for)
(44, 'since', FALSE), (44, 'for', TRUE), (44, 'during', FALSE), (44, 'while', FALSE),
-- Q45 (B1: going)
(45, 'to go', FALSE), (45, 'going', TRUE), (45, 'go', FALSE), (45, 'to going', FALSE),
-- Q46 (B2: when)
(46, 'than', FALSE), (46, 'when', TRUE), (46, 'that', FALSE), (46, 'while', FALSE),
-- Q47 (B2: decisive)
(47, 'certain', FALSE), (47, 'decisive', TRUE), (47, 'strong', FALSE), (47, 'powerful', FALSE),
-- Q48 (B2: steer)
(48, 'steer', TRUE), (48, 'guide', FALSE), (48, 'move', FALSE), (48, 'lead', FALSE),
-- Q49 (B2: poised)
(49, 'poised', TRUE), (49, 'waiting', FALSE), (49, 'expecting', FALSE), (49, 'ready', FALSE),
-- Q50 (B2: whose)
(50, 'who', FALSE), (50, 'that', FALSE), (50, 'whose', TRUE), (50, 'whom', FALSE),
-- Q51 (B2: was the truth)
(51, 'the truth was', FALSE), (51, 'was the truth', TRUE), (51, 'it was the truth', FALSE), (51, 'did the truth', FALSE),
-- Q52 (B2: put up)
(52, 'put up', TRUE), (52, 'stand for', FALSE), (52, 'deal', FALSE), (52, 'tolerate', FALSE),
-- Q53 (B2: coherent)
(53, 'clear', FALSE), (53, 'coherent', TRUE), (53, 'understandable', FALSE), (53, 'logical', FALSE),
-- Q54 (B2: violating)
(54, 'breaking', FALSE), (54, 'violating', TRUE), (54, 'damaging', FALSE), (54, 'ruining', FALSE),
-- Q55 (B2: for)
(55, 'with', FALSE), (55, 'for', TRUE), (55, 'to', FALSE), (55, 'of', FALSE),
-- Q56 (B2: blatant)
(56, 'obvious', FALSE), (56, 'flagrant', FALSE), (56, 'blatant', TRUE), (56, 'clear', FALSE),
-- Q57 (B2: deliberated on)
(57, 'reviewed about', FALSE), (57, 'deliberated on', TRUE), (57, 'discussed about', FALSE), (57, 'talked', FALSE),
-- Q58 (B2: taking)
(58, 'taking', TRUE), (58, 'in', FALSE), (58, 'having', FALSE), (58, 'with', FALSE),
-- Q59 (B2: indefinitely)
(59, 'forever', FALSE), (59, 'everlastingly', FALSE), (59, 'indefinitely', TRUE), (59, 'eternally', FALSE),
-- Q60 (B2: advantage)
(60, 'advantage', TRUE), (60, 'benefit', FALSE), (60, 'profit', FALSE), (60, 'chance', FALSE),
-- Q61 (C1: contentious)
(61, 'debatable', FALSE), (61, 'contentious', TRUE), (61, 'disputed', FALSE), (61, 'argumentative', FALSE),
-- Q62 (C1: Irrespective of)
(62, 'Notwithstanding', FALSE), (62, 'Irrespective of', TRUE), (62, 'However', FALSE), (62, 'Although', FALSE),
-- Q63 (C1: seriously)
(63, 'seriously', TRUE), (63, 'heavily', FALSE), (63, 'gravely', FALSE), (63, 'importantly', FALSE),
-- Q64 (C1: ripples)
(64, 'waves', FALSE), (64, 'shocks', FALSE), (64, 'ripples', TRUE), (64, 'tremors', FALSE),
-- Q65 (C1: viable)
(65, 'feasible', FALSE), (65, 'viable', TRUE), (65, 'workable', FALSE), (65, 'possible', FALSE),
-- Q66 (C1: wouldn\'t have)
(66, 'wouldn\'t have', TRUE), (66, 'hadn\'t', FALSE), (66, 'might not have', FALSE), (66, 'shouldn\'t have', FALSE),
-- Q67 (C1: cogent)
(67, 'compelling', FALSE), (67, 'cogent', TRUE), (67, 'convincing', FALSE), (67, 'persuasive', FALSE),
-- Q68 (C1: outlay)
(68, 'outlay', TRUE), (68, 'deficit', FALSE), (68, 'lack', FALSE), (68, 'expenditure', FALSE),
-- Q69 (C1: intended)
(69, 'intended', TRUE), (69, 'aimed', FALSE), (69, 'wished', FALSE), (69, 'designed', FALSE),
-- Q70 (C1: notwithstanding)
(70, 'despite of', FALSE), (70, 'notwithstanding', TRUE), (70, 'in spite', FALSE), (70, 'even though', FALSE),
-- Q71 (C2: Incredible)
(71, 'Incredible', TRUE), (71, 'Impossible', FALSE), (71, 'Unbelievable', FALSE), (71, 'Hard', FALSE),
-- Q72 (C2: circumvent)
(72, 'circumvent', TRUE), (72, 'avoid', FALSE), (72, 'bypass', FALSE), (72, 'escape', FALSE),
-- Q73 (C2: harrowing)
(73, 'harrowing', TRUE), (73, 'difficult', FALSE), (73, 'complex', FALSE), (73, 'adventurous', FALSE),
-- Q74 (C2: beguiling)
(74, 'misleading', FALSE), (74, 'beguiling', TRUE), (74, 'deceiving', FALSE), (74, 'tricking', FALSE),
-- Q75 (C2: from)
(75, 'through', FALSE), (75, 'by', FALSE), (75, 'from', TRUE), (75, 'over', FALSE),
-- Q76 (C2: to)
(76, 'for', FALSE), (76, 'to', TRUE), (76, 'with', FALSE), (76, 'of', FALSE),
-- Q77 (C2: with)
(77, 'of', FALSE), (77, 'with', TRUE), (77, 'by', FALSE), (77, 'in', FALSE),
-- Q78 (C2: forge)
(78, 'create', FALSE), (78, 'forge', TRUE), (78, 'build', FALSE), (78, 'set', FALSE),
-- Q79 (C2: beyond)
(79, 'over', FALSE), (79, 'beyond', TRUE), (79, 'above', FALSE), (79, 'without', FALSE),
-- Q80 (C2: misapprehension)
(80, 'misunderstanding', FALSE), (80, 'misapprehension', TRUE), (80, 'mistake', FALSE), (80, 'error', FALSE);

-- Khôi phục kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;