# Overview

Docketify is a document management web application that allows users to authenticate via mobile OTP, manage their profiles, and organize required documents and professional references in a structured "docket". The application features file upload capabilities, progress tracking, and admin functionality for managing users and their document completion status.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives with Tailwind CSS styling
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **File Uploads**: React Dropzone for drag-and-drop file upload interface

## Backend Architecture
- **Express.js Server**: Node.js/Express API server with TypeScript
- **Session Management**: Express sessions for authentication state
- **File Upload Handling**: Multer middleware for multipart form data processing
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Structure**: RESTful endpoints organized by feature (auth, users, docket, admin)

## Database Design
- **Users Table**: Stores user authentication and profile information (phone, name, email, admin status)
- **Dockets Table**: Document collection with JSON fields for file metadata and references
- **OTP Sessions Table**: Temporary storage for phone verification codes with expiration
- **Relationships**: One-to-one relationship between users and their dockets

## Authentication System
- **Phone-based OTP**: Users authenticate using their mobile phone number and SMS verification codes
- **Session-based Auth**: Server-side sessions for maintaining authentication state
- **Role-based Access**: Admin users have additional permissions for user management

## File Storage Strategy
- **Local File System**: Files stored in uploads directory with UUID-based naming
- **File Validation**: Type and size restrictions (images and PDFs, 10MB limit)
- **Metadata Storage**: File information stored in database JSON fields

## Development Environment
- **Vite**: Fast build tool and dev server with HMR support
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Path Aliases**: Organized imports with @ aliases for clean code structure

# External Dependencies

## Database
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migrations and schema management

## UI Components
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Runtime Dependencies
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Dynamic class name generation
- **Nanoid**: Unique ID generation for files and sessions

The application is designed as a production-ready starter with emphasis on type safety, user experience, and maintainable code structure. The architecture supports easy scaling and can be adapted to use external services like Firebase or AWS for file storage and authentication.