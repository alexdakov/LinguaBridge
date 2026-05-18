-- ═══════════════════════════════════════════════════════════════
-- LinguaBridge – Course Seed Data
-- Oracle Database Actions → SQL Worksheet → Run Script (F5)
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Add duration_min column if not already there
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE courses ADD (duration_min NUMBER(5) DEFAULT 60)';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- Step 2: Insert courses (one row per language × course × format)
-- English
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-a1a2-gro', 'english', 'A1–A2', 'group', 120.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-a1a2-ind', 'english', 'A1–A2', 'individual', 240.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-a1a2-sel', 'english', 'A1–A2', 'self-paced', 80.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-b1b2-gro', 'english', 'B1–B2', 'group', 126.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-b1b2-ind', 'english', 'B1–B2', 'individual', 253.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-b1b2-sel', 'english', 'B1–B2', 'self-paced', 86.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-c1c2-gro', 'english', 'C1–C2', 'group', 136.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-c1c2-ind', 'english', 'C1–C2', 'individual', 273.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-c1c2-sel', 'english', 'C1–C2', 'self-paced', 93.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-business-gro', 'english', 'B1–C1', 'group', 140.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-business-ind', 'english', 'B1–C1', 'individual', 280.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-business-sel', 'english', 'B1–C1', 'self-paced', 95.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-ielts-gro', 'english', 'B2–C2', 'group', 143.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-ielts-ind', 'english', 'B2–C2', 'individual', 286.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-ielts-sel', 'english', 'B2–C2', 'self-paced', 100.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-academic-gro', 'english', 'B2–C1', 'group', 138.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-academic-ind', 'english', 'B2–C1', 'individual', 273.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-academic-sel', 'english', 'B2–C1', 'self-paced', 93.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-conversational-gro', 'english', 'A2–C1', 'group', 133.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('en-conversational-ind', 'english', 'A2–C1', 'individual', 260.0, 60);
-- German
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-a1a2-gro', 'german', 'A1–A2', 'group', 132.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-a1a2-ind', 'german', 'A1–A2', 'individual', 264.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-a1a2-sel', 'german', 'A1–A2', 'self-paced', 88.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-b1b2-gro', 'german', 'B1–B2', 'group', 139.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-b1b2-ind', 'german', 'B1–B2', 'individual', 278.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-b1b2-sel', 'german', 'B1–B2', 'self-paced', 95.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-c1c2-gro', 'german', 'C1–C2', 'group', 150.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-c1c2-ind', 'german', 'C1–C2', 'individual', 300.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-c1c2-sel', 'german', 'C1–C2', 'self-paced', 102.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-business-gro', 'german', 'B1–C1', 'group', 146.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-business-ind', 'german', 'B1–C1', 'individual', 293.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-business-sel', 'german', 'B1–C1', 'self-paced', 98.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-testdaf-gro', 'german', 'B2–C2', 'group', 150.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-testdaf-ind', 'german', 'B2–C2', 'individual', 300.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-testdaf-sel', 'german', 'B2–C2', 'self-paced', 102.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-academic-gro', 'german', 'B2–C1', 'group', 143.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-academic-ind', 'german', 'B2–C1', 'individual', 286.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-academic-sel', 'german', 'B2–C1', 'self-paced', 95.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-conversational-gro', 'german', 'A2–C1', 'group', 139.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('de-conversational-ind', 'german', 'A2–C1', 'individual', 278.67, 60);
-- Bulgarian
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-a1a2-gro', 'bulgarian', 'A1–A2', 'group', 96.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-a1a2-ind', 'bulgarian', 'A1–A2', 'individual', 192.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-a1a2-sel', 'bulgarian', 'A1–A2', 'self-paced', 64.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-b1b2-gro', 'bulgarian', 'B1–B2', 'group', 101.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-b1b2-ind', 'bulgarian', 'B1–B2', 'individual', 202.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-b1b2-sel', 'bulgarian', 'B1–B2', 'self-paced', 69.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-c1c2-gro', 'bulgarian', 'C1–C2', 'group', 109.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-c1c2-ind', 'bulgarian', 'C1–C2', 'individual', 218.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('bg-c1c2-sel', 'bulgarian', 'C1–C2', 'self-paced', 74.67, 60);
-- Russian
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-a1a2-gro', 'russian', 'A1–A2', 'group', 108.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-a1a2-ind', 'russian', 'A1–A2', 'individual', 216.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-a1a2-sel', 'russian', 'A1–A2', 'self-paced', 72.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-b1b2-gro', 'russian', 'B1–B2', 'group', 114.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-b1b2-ind', 'russian', 'B1–B2', 'individual', 228.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-b1b2-sel', 'russian', 'B1–B2', 'self-paced', 78.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-c1c2-gro', 'russian', 'C1–C2', 'group', 123.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-c1c2-ind', 'russian', 'C1–C2', 'individual', 246.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('ru-c1c2-sel', 'russian', 'C1–C2', 'self-paced', 84.0, 60);
-- Chinese
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-a1a2-gro', 'chinese', 'A1–A2', 'group', 150.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-a1a2-ind', 'chinese', 'A1–A2', 'individual', 300.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-a1a2-sel', 'chinese', 'A1–A2', 'self-paced', 100.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-b1b2-gro', 'chinese', 'B1–B2', 'group', 158.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-b1b2-ind', 'chinese', 'B1–B2', 'individual', 316.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-b1b2-sel', 'chinese', 'B1–B2', 'self-paced', 108.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-c1c2-gro', 'chinese', 'C1–C2', 'group', 171.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-c1c2-ind', 'chinese', 'C1–C2', 'individual', 341.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('cn-c1c2-sel', 'chinese', 'C1–C2', 'self-paced', 116.67, 60);
-- Japanese
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-a1a2-gro', 'japanese', 'A1–A2', 'group', 143.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-a1a2-ind', 'japanese', 'A1–A2', 'individual', 286.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-a1a2-sel', 'japanese', 'A1–A2', 'self-paced', 95.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-b1b2-gro', 'japanese', 'B1–B2', 'group', 150.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-b1b2-ind', 'japanese', 'B1–B2', 'individual', 301.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-b1b2-sel', 'japanese', 'B1–B2', 'self-paced', 103.0, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-c1c2-gro', 'japanese', 'C1–C2', 'group', 162.67, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-c1c2-ind', 'japanese', 'C1–C2', 'individual', 325.33, 60);
INSERT INTO courses (id, language, course_level, format, price_monthly, duration_min) VALUES ('jp-c1c2-sel', 'japanese', 'C1–C2', 'self-paced', 111.33, 60);

-- Step 3: Insert English translations
-- English
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-a1a2-gro', 'en', 'English Foundations', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-a1a2-ind', 'en', 'English Foundations', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-a1a2-sel', 'en', 'English Foundations', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-b1b2-gro', 'en', 'Fluency & Logic', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-b1b2-ind', 'en', 'Fluency & Logic', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-b1b2-sel', 'en', 'Fluency & Logic', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-c1c2-gro', 'en', 'Advanced Mastery', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-c1c2-ind', 'en', 'Advanced Mastery', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-c1c2-sel', 'en', 'Advanced Mastery', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-business-gro', 'en', 'Business English', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-business-ind', 'en', 'Business English', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-business-sel', 'en', 'Business English', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-ielts-gro', 'en', 'IELTS / Cambridge Prep', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-ielts-ind', 'en', 'IELTS / Cambridge Prep', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-ielts-sel', 'en', 'IELTS / Cambridge Prep', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-academic-gro', 'en', 'Academic Admissions', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-academic-ind', 'en', 'Academic Admissions', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-academic-sel', 'en', 'Academic Admissions', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-conversational-gro', 'en', 'Conversational English', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('en-conversational-ind', 'en', 'Conversational English', 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.');
-- German
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-a1a2-gro', 'en', 'German Foundations', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-a1a2-ind', 'en', 'German Foundations', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-a1a2-sel', 'en', 'German Foundations', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-b1b2-gro', 'en', 'Intermediate German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-b1b2-ind', 'en', 'Intermediate German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-b1b2-sel', 'en', 'Intermediate German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-c1c2-gro', 'en', 'German Excellence', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-c1c2-ind', 'en', 'German Excellence', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-c1c2-sel', 'en', 'German Excellence', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-business-gro', 'en', 'Business German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-business-ind', 'en', 'Business German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-business-sel', 'en', 'Business German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-testdaf-gro', 'en', 'TestDaF / Goethe Prep', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-testdaf-ind', 'en', 'TestDaF / Goethe Prep', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-testdaf-sel', 'en', 'TestDaF / Goethe Prep', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-academic-gro', 'en', 'Academic Admissions', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-academic-ind', 'en', 'Academic Admissions', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-academic-sel', 'en', 'Academic Admissions', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-conversational-gro', 'en', 'Conversational German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('de-conversational-ind', 'en', 'Conversational German', 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.');
-- Bulgarian
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-a1a2-gro', 'en', 'Bulgarian Foundations', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-a1a2-ind', 'en', 'Bulgarian Foundations', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-a1a2-sel', 'en', 'Bulgarian Foundations', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-b1b2-gro', 'en', 'Bulgarian Fluency', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-b1b2-ind', 'en', 'Bulgarian Fluency', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-b1b2-sel', 'en', 'Bulgarian Fluency', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-c1c2-gro', 'en', 'Advanced Bulgarian', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-c1c2-ind', 'en', 'Advanced Bulgarian', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('bg-c1c2-sel', 'en', 'Advanced Bulgarian', 'A South Slavic language rich in tradition, folklore, and history, spoken across the Balkans and the Bulgarian diaspora worldwide.');
-- Russian
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-a1a2-gro', 'en', 'Russian Foundations', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-a1a2-ind', 'en', 'Russian Foundations', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-a1a2-sel', 'en', 'Russian Foundations', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-b1b2-gro', 'en', 'Russian Fluency', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-b1b2-ind', 'en', 'Russian Fluency', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-b1b2-sel', 'en', 'Russian Fluency', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-c1c2-gro', 'en', 'Advanced Russian', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-c1c2-ind', 'en', 'Advanced Russian', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('ru-c1c2-sel', 'en', 'Advanced Russian', 'One of the most widely spoken languages in the world, Russian opens doors across Eastern Europe, Central Asia, and global culture and science.');
-- Chinese
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-a1a2-gro', 'en', 'Chinese Foundations', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-a1a2-ind', 'en', 'Chinese Foundations', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-a1a2-sel', 'en', 'Chinese Foundations', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-b1b2-gro', 'en', 'Chinese Fluency', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-b1b2-ind', 'en', 'Chinese Fluency', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-b1b2-sel', 'en', 'Chinese Fluency', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-c1c2-gro', 'en', 'Advanced Chinese', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-c1c2-ind', 'en', 'Advanced Chinese', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('cn-c1c2-sel', 'en', 'Advanced Chinese', 'The world''s most spoken language, offering access to one of humanity''s oldest civilizations, vibrant modern culture, and the world''s largest economy.');
-- Japanese
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-a1a2-gro', 'en', 'Japanese Foundations', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-a1a2-ind', 'en', 'Japanese Foundations', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-a1a2-sel', 'en', 'Japanese Foundations', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-b1b2-gro', 'en', 'Japanese Fluency', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-b1b2-ind', 'en', 'Japanese Fluency', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-b1b2-sel', 'en', 'Japanese Fluency', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-c1c2-gro', 'en', 'Advanced Japanese', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-c1c2-ind', 'en', 'Advanced Japanese', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');
INSERT INTO courses_translations (course_id, locale, title, description) VALUES ('jp-c1c2-sel', 'en', 'Advanced Japanese', 'A fascinating language of precision and nuance, Japanese unlocks one of the world''s most unique cultures, from anime to Zen philosophy.');

COMMIT;
