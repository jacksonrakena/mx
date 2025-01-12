/*
  Warnings:

  - Changed the type of `currency_code` on the `ledger_entry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "currency" AS ENUM ('NZD', 'AUD', 'USD', 'HKD');

-- AlterTable
ALTER TABLE "ledger_entry" ALTER COLUMN "currency_code" TYPE "currency" using "currency_code"::"currency";

-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "home_currency" "currency" NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

INSERT INTO "app_user" VALUES ('jackson@rakena.com.au', 'NZD');

-- AddForeignKey
ALTER TABLE "user_object" ADD CONSTRAINT "user_object_owner_fkey" FOREIGN KEY ("owner") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
