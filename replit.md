# Birthday Management System

## Overview

This is a comprehensive employee birthday management system built with React and Express.js. The application automates birthday notifications through WhatsApp integration, allowing organizations to manage employee birthdays, contacts, and automated messaging. The system features a dashboard for tracking upcoming birthdays, employee management, contact management for notifications, message history tracking, and configurable settings for automated messaging schedules.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage**: PostgreSQL database with configurable connection
- **API Design**: RESTful API endpoints with JSON responses
- **Error Handling**: Centralized error handling middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Backup Storage**: In-memory storage implementation for development/testing
- **Session Storage**: Connect-pg-simple for PostgreSQL session storage

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store
- **Security**: Basic session-based authentication (expandable architecture)
- **CORS**: Configured for cross-origin requests

### External Service Integrations
- **WhatsApp Integration**: WhatsApp-Web.js library with dual-mode support
  - Simulation mode: For development and testing (default in Replit)
  - Real mode: For production with actual WhatsApp Web connection (requires local environment)
  - Uses createRequire for ES module compatibility with CommonJS library
- **Scheduling**: Node-cron for automated birthday notifications
- **Email Support**: Prepared for email notifications (infrastructure ready)

### Key Architectural Decisions

**Monorepo Structure**: Single repository with clear separation between client, server, and shared code
- **Problem**: Need for code sharing between frontend and backend
- **Solution**: Shared schema definitions and TypeScript configurations
- **Benefits**: Type safety across full stack, easier maintenance

**Database Layer Abstraction**: Interface-based storage with multiple implementations
- **Problem**: Need for flexible data storage during development
- **Solution**: IStorage interface with both memory and database implementations
- **Benefits**: Easy testing, development flexibility, production scalability

**Component-Based UI**: Shadcn/ui with Radix UI primitives
- **Problem**: Need for consistent, accessible UI components
- **Solution**: Pre-built component library with customization support
- **Benefits**: Rapid development, accessibility compliance, consistent design

**Service-Oriented Backend**: Separate services for WhatsApp and scheduling
- **Problem**: Complex business logic for messaging and automation
- **Solution**: Dedicated service classes with clear responsibilities
- **Benefits**: Maintainable code, testable components, scalable architecture

**Type-Safe Database Operations**: Drizzle ORM with Zod validation
- **Problem**: Runtime errors from database operations and data validation
- **Solution**: Compile-time type checking with runtime validation
- **Benefits**: Reduced bugs, better developer experience, data integrity

## Recent Changes

### 2025-08-11: WhatsApp Integration Setup
- **WhatsApp-Web.js Migration**: Successfully migrated from Puppeteer to whatsapp-web.js library
- **ES Module Compatibility**: Implemented createRequire solution for CommonJS library integration
- **Dual Mode System**: Implemented switching between simulation and real modes
- **Environment Limitations**: Documented Replit environment constraints for browser automation
- **Message Templates**: Created comprehensive birthday and reminder templates with variables:
  - Variables: [NOME], [CARGO], [IDADE], [DATA_NASCIMENTO]
  - Reminder template for day-before notifications
  - Birthday template for same-day celebrations
- **Test Data**: Populated database with 10 sample employees for testing
- **UI Enhancement**: Added WhatsApp connection interface with QR code display capability

### Production Notes
- WhatsApp real mode requires local environment or Docker with proper system dependencies
- In Replit: Use simulation mode for development and testing
- For production: Deploy to environment with libgbm1, libnss3, libxss1, libgtk-3-0, libasound2
- WhatsApp-Web.js provides better session management and stability than raw Puppeteer