CREATE TYPE "public"."owner" AS ENUM('Me', 'Wife', 'Shared');--> statement-breakpoint
CREATE TYPE "public"."source" AS ENUM('CSV', 'Manual');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"card_name" text NOT NULL,
	"card_last_four" text NOT NULL,
	"category" text NOT NULL,
	"custom_category" text,
	"description" text NOT NULL,
	"installment" text DEFAULT '1/1',
	"amount" integer NOT NULL,
	"original_amount_us" integer,
	"owner" "owner" NOT NULL,
	"source_file" text NOT NULL,
	"source" "source" NOT NULL,
	"excluded" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
