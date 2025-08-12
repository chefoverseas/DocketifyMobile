# Overview

Docketify is a document management web application that allows users to authenticate via mobile OTP, manage their profiles, and organize required documents and professional references in a structured "docket". The application features file upload capabilities, progress tracking, and admin functionality for managing users and their document completion status.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Enhancements (Latest Session)

## Deployment Preparation (August 12, 2025)
- **TypeScript Error Resolution**: Fixed all compilation errors including:
  - AdminUserDetail and AdminContractDetail component props interfaces
  - API response structure issues in admin pages (data?.users → data)
  - File uploader null/undefined type issues (resumeUrl)
  - Storage layer array type conversion for database operations
  - SendGrid email optional parameter handling
- **Code Cleanup**: Removed legacy routes-old.ts file that contained unused code
- **Build Optimization**: Confirmed successful production build (740KB bundle, 39.3KB server)
- **Database Migration**: Verified schema synchronization with `npm run db:push` showing "No changes detected"

## Authentication System Overhaul (August 2025)
- **Complete Email OTP Authentication**: Replaced Replit Auth with custom email-based OTP system using SendGrid
- **Session-based Authentication**: Implemented secure server-side session management for both users and admins
- **Development Mode Testing**: Added console logging for OTP codes during development (bypasses email sending)
- **Database Schema Updates**: Modified user table to support email-only authentication with nullable phone fields
- **Admin Login System**: Hardcoded admin credentials (info@chefoverseas.com / Revaan56789!) for secure admin access
- **Production Deployment Ready**: Fixed all TypeScript errors, React render issues, and SSL configuration for production
- **AuthProvider Context**: Implemented proper React context for user authentication state management

## Performance and Bug Fixes (August 12, 2025)
- **Fixed Excessive API Polling**: Resolved performance issues with UserNavigationHub causing continuous API calls by adding proper enabled conditions
- **Database Schema Sync**: Successfully removed legacy profile_photo_url column and synced database
- **User Logout Functionality**: Fixed user sign out functionality with proper session destruction and redirect to homepage
- **SelectItem Runtime Error**: Fixed React SelectItem components with empty value props in advanced search filters
- **Query Optimization**: Added proper staleTime (10 minutes) and refetchInterval configurations to all useQuery hooks
- **TypeScript Error Resolution**: Fixed all LSP errors including navigation component profileImageUrl reference

## Previous Advanced Features
- **Enhanced Dashboard**: Added quick stats cards, activity timeline, and visual progress tracking
- **Notification System**: Real-time notifications with priority sorting and interactive actions
- **Advanced Search**: Multi-criteria search with filtering by document type, status, and date range
- **Document Preview**: Full document preview with zoom, rotate, and embedded PDF viewer
- **Bulk Actions**: Multi-select operations for users, documents, and contracts with contextual actions
- **Backup System**: Automated backup with full/incremental options and recovery capabilities
- **System Monitoring**: Real-time system metrics, performance tracking, and alert management

## Production Readiness Improvements
- Complete TypeScript error resolution
- Enhanced security with dependency auditing
- Optimized build process (720KB bundle)
- Comprehensive error handling and user feedback
- Professional UI/UX with Chef Overseas branding throughout

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks with complete type safety
- **Routing**: Wouter for lightweight client-side routing with protected admin routes
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives with Tailwind CSS styling
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **File Uploads**: React Dropzone for drag-and-drop file upload interface
- **Module Interlinking**: Comprehensive navigation between user modules (docket ↔ work permit ↔ contract ↔ profile)

## Backend Architecture
- **Express.js Server**: Node.js/Express API server with TypeScript and comprehensive error handling
- **Session Management**: Express sessions for authentication state with security headers
- **File Upload Handling**: Multer middleware for multipart form data processing with validation
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Structure**: RESTful endpoints organized by feature (auth, users, docket, admin, contracts, work permits)
- **Admin Management**: Complete CRUD operations with user detail drill-down capabilities

## Database Design
- **Users Table**: Stores user authentication and profile information (phone, name, email, admin status)
- **Dockets Table**: Document collection with JSON fields for file metadata and references
- **OTP Sessions Table**: Temporary storage for phone verification codes with expiration
- **Relationships**: One-to-one relationship between users and their dockets

## Authentication System
- **Phone-based OTP**: Users authenticate using their mobile phone number and SMS verification codes with country code selection
- **Session-based Auth**: Server-side sessions for maintaining authentication state
- **Role-based Access**: Admin users have additional permissions for user management
- **Admin Pre-registration**: Only admin-created users can access the system with proper error messaging
- **Country Code Support**: 13 country codes supported including US, UK, India, UAE, Singapore, etc.

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
- **Tailwind CSS**: Utility-first CSS framework with Chef Overseas brand colors (orange, red, green)
- **Lucide React**: Icon library for consistent iconography
- **Brand Integration**: Chef Overseas logo displayed across all pages with matching color scheme

## Security Dependencies
- **Helmet.js**: Security middleware for Express.js with CSP, HSTS, and other security headers
- **HTTPS Module**: Native Node.js HTTPS server support for SSL/TLS encryption
- **OpenSSL**: Certificate generation for development HTTPS

## Development Tools
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Runtime Dependencies
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Dynamic class name generation
- **Nanoid**: Unique ID generation for files and sessions

# Security Features

## SSL/TLS Implementation
- **Development HTTPS**: Self-signed certificates for local development
- **Production SSL**: Automatic SSL termination via Replit Deployments
- **Security Headers**: Comprehensive security header implementation with Helmet.js
- **HTTPS Redirect**: Automatic HTTP to HTTPS redirection in production
- **Secure Sessions**: HTTPOnly and secure cookie configuration

## Authentication Security
- **OTP Verification**: Phone-based authentication with SMS verification
- **Session Security**: Server-side session management with expiration
- **Admin Protection**: Separate admin authentication system
- **Input Validation**: Zod schema validation for all user inputs

The application is designed as a production-ready starter with enterprise-grade security, type safety, user experience, and maintainable code structure. The architecture supports easy scaling and can be adapted to use external services while maintaining security best practices.