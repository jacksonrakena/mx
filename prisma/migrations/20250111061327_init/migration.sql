-- CreateEnum
CREATE TYPE "object_type" AS ENUM ('ASSET', 'LIABILITY');

-- CreateTable
CREATE TABLE "user_object" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "object_type" NOT NULL,
    "unit_count_provider" TEXT NOT NULL,
    "unit_value_provider" TEXT NOT NULL,

    CONSTRAINT "user_object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unit_value" DECIMAL(65,30) NOT NULL,
    "unit_value_source" TEXT NOT NULL,
    "unit_count" DECIMAL(65,30) NOT NULL,
    "unit_count_source" TEXT NOT NULL,
    "total_value" DECIMAL(65,30) NOT NULL,
    "total_value_source" TEXT NOT NULL,
    "additional_data" JSONB,
    "object_id" TEXT NOT NULL,

    CONSTRAINT "ledger_entry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "user_object"("id") ON DELETE CASCADE ON UPDATE CASCADE;
