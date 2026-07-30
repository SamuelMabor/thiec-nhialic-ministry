-- Create database (run this separately)
-- CREATE DATABASE thiec_nhialic;

-- Switch to the database
\c thiec_db;

-- Create ENUM types
CREATE TYPE gender_enum AS ENUM ('Male', 'Female');
CREATE TYPE membership_status_enum AS ENUM ('Active', 'Inactive', 'Suspended');
CREATE TYPE baptism_status_enum AS ENUM ('Baptized', 'Not Baptized', 'In Progress');
CREATE TYPE news_category_enum AS ENUM ('Conference', 'Youth', 'Women', 'Chapters', 'Evangelism', 'Worship', 'General');
CREATE TYPE event_category_enum AS ENUM ('Conference', 'Youth', 'Women', 'Worship', 'Crusade', 'Training', 'General');
CREATE TYPE admin_role_enum AS ENUM ('admin', 'editor', 'viewer');

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    coordinator VARCHAR(255),
    members INTEGER DEFAULT 0,
    address VARCHAR(255),
    phone VARCHAR(50),
    activities TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    "memberNumber" VARCHAR(20) NOT NULL UNIQUE,
    "fullName" VARCHAR(255) NOT NULL,
    title VARCHAR(100) DEFAULT 'Member',
    gender gender_enum NOT NULL,
    "dateOfBirth" DATE,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    nationality VARCHAR(100) DEFAULT 'South Sudanese',
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    "refugeeCamp" VARCHAR(255),
    "localChurch" VARCHAR(255),
    "chapterId" INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
    position VARCHAR(255),
    "dateJoined" DATE,
    "membershipStatus" membership_status_enum DEFAULT 'Active',
    "baptismStatus" baptism_status_enum DEFAULT 'Not Baptized',
    occupation VARCHAR(255),
    biography TEXT,
    "profilePicture" TEXT,
    "emergencyContactName" VARCHAR(255),
    "emergencyContactPhone" VARCHAR(50),
    "emergencyContactRelation" VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    author VARCHAR(255) DEFAULT 'Admin',
    category news_category_enum DEFAULT 'General',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    "endDate" DATE,
    venue VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    category event_category_enum DEFAULT 'General',
    poster TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    src TEXT NOT NULL,
    caption VARCHAR(255) DEFAULT 'Untitled',
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaders table
CREATE TABLE IF NOT EXISTS leaders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    image TEXT,
    bio TEXT,
    contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    text TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role admin_role_enum DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admins (username, email, password, role)
VALUES (
    'admin',
    'admin@thiecnhialic.org',
    '$2a$10$9.XqBRuFcYFvGXk5zCFuQ.TD.oRrYhQGLKTxPN8sBkUwhxZFAXmY6',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample chapters
INSERT INTO chapters (name, country, coordinator, members, address, phone, activities) VALUES
('South Sudan — Juba', 'South Sudan', 'Deaconess Mary Nyajima Kuol', 8500, 'Juba Main Church', '+211 923 456 789', 'Sunday Services, Prayer, Bible Study'),
('South Sudan — Bor', 'South Sudan', 'Elder Martha Nyandeng Malek', 4200, 'Bor Town Church', '+211 901 678 901', 'Sunday Worship, Women''s Fellowship'),
('South Sudan — Wau', 'South Sudan', 'Evangelist James Wani Tombe', 2800, 'Wau Centre Church', '+211 955 789 012', 'Crusades, Church Planting'),
('Uganda — Kampala', 'Uganda', 'Elder Peter Garang Dhieu', 2100, 'Kampala Fellowship Hall', '+256 774 567 890', 'Sunday Services, Leadership Training'),
('Kenya — Nairobi', 'Kenya', 'Thomas Bol Riak', 1500, 'Nairobi Outreach Centre', '+254 746 789 012', 'Sunday Worship, Youth Programmes'),
('Kenya — Kakuma', 'Kenya', 'Elizabeth Adut Kwai', 850, 'Kakuma Chapel', '+254 734 012 345', 'Sunday Services, Children''s Ministry')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_members_member_number ON members("memberNumber");
CREATE INDEX idx_members_full_name ON members("fullName");
CREATE INDEX idx_members_chapter_id ON members("chapterId");
CREATE INDEX idx_news_date ON news(date);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_chapters_name ON chapters(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON leaders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();