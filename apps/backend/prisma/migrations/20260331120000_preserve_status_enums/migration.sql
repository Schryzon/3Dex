/*
  Follow-up mitigation migration.
  Goal: avoid destructive status resets when enum type naming changes.
  This migration is intentionally non-destructive and keeps existing values.
*/

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModelStatus')
     AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Model_Status') THEN
    CREATE TYPE "Model_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModelStatus')
     AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Model_Status') THEN
    ALTER TABLE "Model"
      ALTER COLUMN "status" TYPE "Model_Status"
      USING ("status"::text::"Model_Status");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountStatus')
     AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Account_Status') THEN
    CREATE TYPE "Account_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountStatus')
     AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Account_Status') THEN
    ALTER TABLE "User"
      ALTER COLUMN "account_status" TYPE "Account_Status"
      USING ("account_status"::text::"Account_Status");
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrintStatus')
     AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Print_Status') THEN
    CREATE TYPE "Print_Status" AS ENUM ('PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrintStatus')
     AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Print_Status') THEN
    ALTER TABLE "Order_Item"
      ALTER COLUMN "print_status" TYPE "Print_Status"
      USING ("print_status"::text::"Print_Status");
  END IF;
END $$;
