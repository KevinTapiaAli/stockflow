CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'SALE', 'CANCELLATION');
CREATE TYPE "SaleStatus" AS ENUM ('CONFIRMED', 'CANCELLED');
CREATE TABLE "Category" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "nameKey" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "Category_nameKey_key" ON "Category"("nameKey");
CREATE TABLE "Product" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "sku" VARCHAR(50) NOT NULL,
  "description" VARCHAR(1000) NOT NULL DEFAULT '',
  "price" DECIMAL(12,2) NOT NULL CHECK ("price" >= 0),
  "stock" INTEGER NOT NULL DEFAULT 0 CHECK ("stock" >= 0 AND "stock" <= 1000000000),
  "minStock" INTEGER NOT NULL DEFAULT 5 CHECK ("minStock" >= 0 AND "minStock" <= 1000000000),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "categoryId" UUID NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE TABLE "Sale" (
  "id" UUID PRIMARY KEY,
  "customer" VARCHAR(150) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL CHECK ("total" >= 0),
  "status" "SaleStatus" NOT NULL DEFAULT 'CONFIRMED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "cancellationReason" VARCHAR(500),
  CONSTRAINT "Sale_cancellation_check" CHECK (
    ("status" = 'CONFIRMED' AND "cancelledAt" IS NULL AND "cancellationReason" IS NULL) OR
    ("status" = 'CANCELLED' AND "cancelledAt" IS NOT NULL AND "cancellationReason" IS NOT NULL)
  )
);
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
CREATE INDEX "Sale_status_idx" ON "Sale"("status");
CREATE TABLE "SaleItem" (
  "id" UUID PRIMARY KEY,
  "saleId" UUID NOT NULL REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "productName" VARCHAR(150) NOT NULL,
  "sku" VARCHAR(50) NOT NULL,
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "unitPrice" DECIMAL(12,2) NOT NULL CHECK ("unitPrice" >= 0),
  "subtotal" DECIMAL(14,2) NOT NULL CHECK ("subtotal" = "quantity" * "unitPrice")
);
CREATE UNIQUE INDEX "SaleItem_saleId_productId_key" ON "SaleItem"("saleId", "productId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE TABLE "InventoryMovement" (
  "id" UUID PRIMARY KEY,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "type" "MovementType" NOT NULL,
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "reason" VARCHAR(500) NOT NULL,
  "saleId" UUID REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_sale_check" CHECK (
    ("type" IN ('IN', 'OUT') AND "saleId" IS NULL) OR
    ("type" IN ('SALE', 'CANCELLATION') AND "saleId" IS NOT NULL)
  )
);
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement"("createdAt");
CREATE INDEX "InventoryMovement_saleId_idx" ON "InventoryMovement"("saleId");
