import { apiRequest } from "./queryClient";
import type { Employee, Contact, Settings, Message } from "@shared/schema";

const BASE_URL = "/api";

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      // window.location.href = '/login'; // Example redirect
      throw new Error("Unauthorized");
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || response.statusText);
  }

  // Handle cases where the response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return {} as T; // Or appropriate empty representation
  }

  return await response.json() as T;
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}


export const api = {
  auth: {
    login: async (credentials: { username: string; password: string }) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    me: async () => request<any>("/auth/me"),

    logout: async () => request<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
  },

  users: {
    getAll: async () => request<any[]>("/users"),
    create: async (user: any) => request<any>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),
    update: async (id: string, user: any) => request<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),
    delete: async (id: string) => request<void>(`/users/${id}`, {
      method: "DELETE",
    }),
  },

  // Employee API
  employees: {
    getAll: () => request<Employee[]>("/employees"),
    create: (data: any) => request<any>("/employees", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/employees/${id}`, { method: "DELETE" }),
  },

  // Contact API
  contacts: {
    getAll: async (): Promise<Contact[]> => {
      const response = await fetch("/api/contacts", {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    create: (data: any) => apiRequest("POST", "/api/contacts", data),
    update: (id: string, data: any) => apiRequest("PUT", `/api/contacts/${id}`, data),
    delete: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),
  },

  // Message API
  messages: {
    getAll: () => request<Message[]>("/messages"),
  },

  // Settings API
  settings: {
    get: () => request<Settings>("/settings"),
    save: (data: any) => request<any>("/settings", { method: "POST", body: JSON.stringify(data) }),
  },

  // WhatsApp API
  whatsapp: {
    testConnection: () => request<any>("/whatsapp/test-connection", { method: "POST" }),
    sendTest: (data: { phoneNumber: string; message: string }) =>
      request<any>("/whatsapp/send-test", { method: "POST", body: JSON.stringify(data) }),
  },

  // Stats API
  stats: {
    get: () => request<any>("/stats"),
  },
};

