import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  birthDate: date("birth_date").notNull(),
  position: text("position").notNull(),
  email: text("email"),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  contactId: varchar("contact_id").notNull(),
  type: text("type").notNull(), // 'reminder' or 'birthday'
  content: text("content").notNull(),
  status: text("status").notNull(), // 'sent', 'scheduled', 'failed'
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reminderTemplate: text("reminder_template").notNull(),
  birthdayTemplate: text("birthday_template").notNull(),
  reminderTime: text("reminder_time").notNull().default("08:00"),
  birthdayTime: text("birthday_time").notNull().default("09:00"),
  weekendsEnabled: boolean("weekends_enabled").notNull().default(true),
  retryAttempts: integer("retry_attempts").notNull().default(2),
  retryInterval: integer("retry_interval").notNull().default(5),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
