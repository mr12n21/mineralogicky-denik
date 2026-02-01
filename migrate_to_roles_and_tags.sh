#!/bin/bash

# Migration script for adding roles and tags system
# Run this after backing up your database

echo "Starting database migration..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mineralogy_db}
DB_USER=${DB_USER:-postgres}

# SQL migration script
cat <<EOF | PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME

-- Step 1: Create new enums
DO \$\$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'manager', 'administrator');
EXCEPTION
    WHEN duplicate_object THEN null;
END \$\$;

-- Step 2: Add new role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Step 3: Migrate existing admin users
UPDATE users SET role = 'administrator' WHERE is_admin = true;
UPDATE users SET role = 'user' WHERE is_admin = false OR is_admin IS NULL;

-- Step 4: Drop old is_admin column (optional, can keep for rollback)
-- ALTER TABLE users DROP COLUMN IF EXISTS is_admin;

-- Step 5: Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- Step 6: Create junction tables
CREATE TABLE IF NOT EXISTS location_tags (
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, tag_id)
);

CREATE TABLE IF NOT EXISTS find_tags (
    find_id UUID REFERENCES finds(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (find_id, tag_id)
);

-- Step 7: Insert default tags
INSERT INTO tags (name, category) VALUES
    ('Spací místo', 'location_type'),
    ('Kamenolom', 'location_type'),
    ('Důl', 'location_type'),
    ('Lom', 'location_type'),
    ('Minerály', 'find_category'),
    ('Fosilie', 'find_category'),
    ('Krušné hory', 'region'),
    ('Český les', 'region'),
    ('Šumava', 'region'),
    ('Jeseníky', 'region'),
    ('Moravský kras', 'region')
ON CONFLICT (name) DO NOTHING;

COMMIT;

EOF

echo "Migration completed!"
echo ""
echo "Please verify the changes and restart your application."
echo ""
echo "To rollback (if needed):"
echo "  1. Restore database from backup"
echo "  2. Or manually drop new tables: DROP TABLE location_tags, find_tags, tags CASCADE;"
