CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"birth_date" date NOT NULL,
	"position" text NOT NULL,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar NOT NULL,
	"contact_id" varchar NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"status" text NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reminder_template" text NOT NULL,
	"birthday_template" text NOT NULL,
	"reminder_time" text DEFAULT '08:00' NOT NULL,
	"birthday_time" text DEFAULT '09:00' NOT NULL,
	"weekends_enabled" boolean DEFAULT true NOT NULL,
	"retry_attempts" integer DEFAULT 2 NOT NULL,
	"retry_interval" integer DEFAULT 5 NOT NULL
);
