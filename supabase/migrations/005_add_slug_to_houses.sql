-- Add slug column to houses table for SEO-friendly URLs
-- Run this in your Supabase SQL Editor

-- Add slug column
ALTER TABLE houses 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_houses_slug ON houses(slug);

-- Generate slugs for existing houses
UPDATE houses
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name || '-' || city || '-' || state, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_houses_slug_unique ON houses(slug);

-- Function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION generate_house_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from name, city, state
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        COALESCE(NEW.name, '') || '-' || 
        COALESCE(NEW.city, '') || '-' || 
        COALESCE(NEW.state, ''),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If slug is not provided or empty, generate one
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    final_slug := base_slug;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM houses WHERE slug = final_slug AND id != COALESCE(NEW.id, 0)) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS trigger_generate_house_slug ON houses;
CREATE TRIGGER trigger_generate_house_slug
  BEFORE INSERT OR UPDATE ON houses
  FOR EACH ROW
  EXECUTE FUNCTION generate_house_slug();

