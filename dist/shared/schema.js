var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export var employees = pgTable("employees", {
    id: varchar("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: text("name").notNull(),
    birthDate: date("birth_date").notNull(),
    position: text("position").notNull(),
    email: text("email"),
});
export var contacts = pgTable("contacts", {
    id: varchar("id").primaryKey().default(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    role: text("role").notNull(),
    isActive: boolean("is_active").notNull().default(true),
});
export var messages = pgTable("messages", {
    id: varchar("id").primaryKey().default(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    employeeId: varchar("employee_id").notNull(),
    contactId: varchar("contact_id").notNull(),
    type: text("type").notNull(), // 'reminder' or 'birthday'
    content: text("content").notNull(),
    status: text("status").notNull(), // 'sent', 'scheduled', 'failed'
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),
    errorMessage: text("error_message"),
});
export var settings = pgTable("settings", {
    id: varchar("id").primaryKey().default(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    reminderTemplate: text("reminder_template").notNull(),
    birthdayTemplate: text("birthday_template").notNull(),
    reminderTime: text("reminder_time").notNull().default("08:00"),
    birthdayTime: text("birthday_time").notNull().default("09:00"),
    weekendsEnabled: boolean("weekends_enabled").notNull().default(true),
    retryAttempts: integer("retry_attempts").notNull().default(2),
    retryInterval: integer("retry_interval").notNull().default(5),
});
export var users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").notNull().default("management"), // 'admin' or 'management'
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().default(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["now()"], ["now()"])))),
    lastLogin: timestamp("last_login"),
});
export var insertEmployeeSchema = createInsertSchema(employees).omit({
    id: true,
});
export var insertContactSchema = createInsertSchema(contacts).omit({
    id: true,
});
export var insertMessageSchema = createInsertSchema(messages).omit({
    id: true,
});
export var insertSettingsSchema = createInsertSchema(settings).omit({
    id: true,
});
export var insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    lastLogin: true,
});
export var loginSchema = z.object({
    username: z.string().min(1, "Username é obrigatório"),
    password: z.string().min(1, "Senha é obrigatória"),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
