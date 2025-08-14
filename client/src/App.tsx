import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/context/auth";
import AppSidebar from "@/components/layout/sidebar";
import ProtectedRoute from "@/components/protected-route";

import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Contacts from "@/pages/contacts";
import Messages from "@/pages/messages";
import Settings from "@/pages/settings";
import WhatsApp from "@/pages/whatsapp";
import Users from "@/pages/users";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <SidebarTrigger />
            </div>
            <Switch>
              <Route path="/">
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Route>

              <Route path="/employees">
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              </Route>

              <Route path="/contacts">
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              </Route>

              <Route path="/messages">
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              </Route>

              <Route path="/settings">
                <ProtectedRoute requireAdmin>
                  <Settings />
                </ProtectedRoute>
              </Route>

              <Route path="/whatsapp">
                <ProtectedRoute requireAdmin>
                  <WhatsApp />
                </ProtectedRoute>
              </Route>

              <Route path="/users">
                <ProtectedRoute requireAdmin>
                  <Users />
                </ProtectedRoute>
              </Route>

              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;