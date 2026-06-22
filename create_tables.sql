-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('main', 'sub')),
  "parentId" TEXT REFERENCES categories("id") ON DELETE SET NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "image" TEXT,
  "imageFileId" TEXT,
  "description" TEXT,
  "whatsappNumber" TEXT
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "name_hi" TEXT,
  "mainCategory" TEXT NOT NULL,
  "subcategory" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "discountPrice" DOUBLE PRECISION,
  "description" TEXT NOT NULL,
  "description_hi" TEXT,
  "image" TEXT NOT NULL,
  "imageFileId" TEXT,
  "features" TEXT NOT NULL,
  "features_hi" TEXT,
  "minQuantity" INTEGER DEFAULT 1,
  "brand" TEXT,
  "brandId" TEXT REFERENCES brands("id") ON DELETE SET NULL,
  "gpd" INTEGER,
  "voltage" TEXT,
  "inletOutletSize" TEXT,
  "material" TEXT,
  "color" TEXT
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "title_hi" TEXT,
  "subtitle" TEXT NOT NULL,
  "subtitle_hi" TEXT,
  "badge" TEXT,
  "badge_hi" TEXT,
  "image" TEXT NOT NULL,
  "imageFileId" TEXT,
  "link" TEXT,
  "active" BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0
);
