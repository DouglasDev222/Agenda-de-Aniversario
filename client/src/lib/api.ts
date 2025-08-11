import { apiRequest } from "./queryClient";
import type { Employee, Contact, Settings, Message } from "@shared/schema";

export const api = {
  // Employee API
  employees: {
    getAll: () => fetch("/api/employees").then(res => res.json()) as Promise<Employee[]>,
    create: (data: any) => apiRequest("POST", "/api/employees", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/employees/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/employees/${id}`),
  },

  // Contact API
  contacts: {
    getAll: () => fetch("/api/contacts").then(res => res.json()) as Promise<Contact[]>,
    create: (data: any) => apiRequest("POST", "/api/contacts", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/contacts/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),
  },

  // Message API
  messages: {
    getAll: () => fetch("/api/messages").then(res => res.json()) as Promise<Message[]>,
  },

  // Settings API
  settings: {
    get: () => fetch("/api/settings").then(res => res.json()) as Promise<Settings>,
    save: (data: any) => apiRequest("POST", "/api/settings", data),
  },

  // WhatsApp API
  whatsapp: {
    testConnection: () => apiRequest("POST", "/api/whatsapp/test-connection"),
    sendTest: (data: { phoneNumber: string; message: string }) => 
      apiRequest("POST", "/api/whatsapp/send-test", data),
  },

  // Stats API
  stats: {
    get: () => fetch("/api/stats").then(res => res.json()),
  },
};
