# Overview

Docketify is a document management web application designed for secure user authentication via mobile OTP, comprehensive profile management, and organized storage of required documents and professional references within a "docket" system. Key features include file upload capabilities, detailed progress tracking, robust admin functionalities for user and document status management, and a modern real-time notification system. The platform features a revamped user dashboard with prominent user profile cards and professional UI/UX design using Chef Overseas branding. All admin modules have been modernized with consistent glassmorphism design, featuring orange-to-red gradients, interactive elements, and unified Chef Overseas branding across Work Permits, Work Visa, Contract Management, and User Management modules. The system aims to streamline the document collection process, ensuring a secure, efficient, and user-friendly experience for both individuals and administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: React with TypeScript, utilizing functional components and hooks for type safety.
- **Routing**: Wouter for lightweight client-side routing, including protected admin routes.
- **UI/UX**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS, incorporating Chef Overseas branding (logo, orange, red, green color scheme). All admin modules feature modernized glassmorphism design with consistent orange-to-red gradients, backdrop blur effects, and interactive animations.
- **State Management**: React Query (@tanstack/react-query) for server state management and caching.
- **Form Handling**: React Hook Form with Zod validation for type-safe forms.
- **File Uploads**: React Dropzone for drag-and-drop file interface.
- **Navigation**: Comprehensive interlinking between user modules (docket, work permit, contract, profile) with modernized admin interface navigation.

## Backend Architecture
- **Server**: Node.js/Express API server with TypeScript and error handling.
- **Session Management**: Express sessions for secure authentication state.
- **File Handling**: Multer middleware for multipart form data processing with validation.
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations.
- **API Structure**: RESTful endpoints organized by feature (auth, users, docket, admin, contracts, work permits).
- **Admin Management**: CRUD operations for users and their details.

## Database Design
- **Core Tables**: Users (auth, profile), Dockets (document collection, JSON fields for metadata), OTP Sessions (temporary codes).
- **Relationships**: One-to-one between users and their dockets.

## Authentication System
- **Method**: Custom email-based OTP system using SendGrid (replaced Replit Auth).
- **Session Management**: Secure server-side sessions for users and admins.
- **Access Control**: Role-based access with separate permissions for admin users.
- **User Provisioning**: Only admin-created users can access the system.
- **Admin Access**: Hardcoded admin credentials for secure access.
- **Contact Information**: Primary email contact info@chefoverseas.com, WhatsApp support +919363234028
- **Localization**: Supports 13 country codes for OTP verification.

## File Storage Strategy
- **Location**: Local file system (`uploads` directory) with UUID-based naming.
- **Validation**: Type and size restrictions (images, PDFs, DOC/DOCX; 10MB limit).
- **Metadata**: File information stored in database JSON fields.

## Security Features
- **SSL/TLS**: HTTPS implementation for production (Replit Deployments) and self-signed for development. Includes comprehensive security headers (Helmet.js) and HTTPS redirection.
- **Authentication Security**: OTP verification, secure server-side sessions with expiration, separate admin authentication.
- **Input Validation**: Zod schema validation for all user inputs.

# External Dependencies

## Database
- **Neon PostgreSQL**: Serverless PostgreSQL with connection pooling.
- **Drizzle Kit**: Database migrations and schema management.

## UI Components
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Security Dependencies
- **Helmet.js**: Security middleware for Express.js.
- **OpenSSL**: Certificate generation for development HTTPS.

## Development Tools
- **Vite**: Fast build tool and dev server.
- **TypeScript**: Full type safety.
- **ESBuild**: Fast bundling.
- **PostCSS**: CSS processing.

## Runtime Dependencies
- **Date-fns**: Date manipulation.
- **Class Variance Authority**: Dynamic class name generation.
- **Nanoid**: Unique ID generation.