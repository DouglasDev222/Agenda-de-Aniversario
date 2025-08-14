
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'management' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO "users" ("username", "email", "password", "role") 
VALUES ('admin', 'admin@empresa.com', '$2b$10$8K1p/a0S6Pw6JK5oXYPFXOlDOm2pxj1FZHx1wGXpq1.Vj1FZ1FZ1F', 'admin');
