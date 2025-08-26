# Overview

Docketify is a document management web application designed for secure user authentication via mobile OTP, comprehensive profile management, and organized storage of required documents and professional references within a "docket" system. Key features include file upload capabilities, detailed progress tracking, robust admin functionalities for user and document status management, automated data synchronization service, and a modern real-time notification system. The platform features a revamped user dashboard with prominent user profile cards and professional UI/UX design using Chef Overseas branding. All admin modules have been modernized with consistent glassmorphism design, featuring orange-to-red gradients, interactive elements, and unified Chef Overseas branding across Work Permits, Work Visa, Contract Management, User Management, and Data Synchronization modules. The system includes comprehensive interview time scheduling for work visas and maintains perfect data consistency between admin and user dashboards through automated synchronization checks every 5 minutes.

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
- **API Structure**: RESTful endpoints organized by feature (auth, users, docket, admin, contracts, work permits, sync).
- **Admin Management**: CRUD operations for users and their details.
- **Data Synchronization**: Automated service running every 5 minutes to ensure data consistency across all user modules.

## Database Design
- **Core Tables**: Users (auth, profile), Dockets (document collection, JSON fields for metadata), Work Permits, Work Visas (with interview scheduling), Contracts, OTP Sessions (temporary codes).
- **Relationships**: One-to-one between users and their respective modules (dockets, work permits, work visas, contracts).
- **Interview Management**: Work visa table includes interviewDate and interviewTime fields for comprehensive scheduling.

## Authentication System
- **Method**: Custom email-based OTP system using SendGrid (replaced Replit Auth).
- **Session Management**: Secure server-side sessions for users and admins.
- **Access Control**: Role-based access with separate permissions for admin users.
- **User Provisioning**: Only admin-created users can access the system.
- **Admin Access**: Hardcoded admin credentials for secure access.
- **Contact Information**: Primary email contact info@chefoverseas.com, WhatsApp support +919363234028
- **Localization**: Supports 13 country codes for OTP verification.

## Email Notification System
- **Provider**: SendGrid email service with Chef Overseas branding.
- **Work Permit Notifications**: Automatic emails when work permit status changes (approved, rejected, under_review, preparation, submitted).
- **Final Docket Notifications**: Automatic emails when final docket documents are uploaded by admin.
- **Email Templates**: Professional HTML and text templates with Chef Overseas branding and direct links to user dashboard.
- **Development Mode**: Console logging for testing without sending actual emails.
- **Error Handling**: Graceful email failure handling with detailed logging.

## File Storage Strategy
- **Location**: Local file system (`uploads` directory) with UUID-based naming.
- **Validation**: Type and size restrictions (images, PDFs, DOC/DOCX; 10MB limit).
- **Metadata**: File information stored in database JSON fields.

## Security Features
- **SSL/TLS**: HTTPS implementation for production (Replit Deployments) and self-signed for development. Includes comprehensive security headers (Helmet.js) and HTTPS redirection.
- **Authentication Security**: OTP verification, secure server-side sessions with expiration, separate admin authentication.
- **Input Validation**: Zod schema validation for all user inputs.
- **Data Integrity**: Automated synchronization service ensures data consistency and prevents corruption across all modules.
- **Comprehensive Audit Logging**: Complete audit trail system tracking all user activities, admin actions, data changes, authentication events, and system operations with detailed metadata, IP tracking, and severity levels for security compliance and forensic analysis.

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

## Data Synchronization System
- **Automated Monitoring**: Runs every 5 minutes to check data consistency across all users
- **Auto-Healing**: Automatically creates missing records and fixes invalid status values
- **Admin Dashboard**: Real-time monitoring with manual sync triggers and detailed reporting
- **Consistency Checks**: Validates dockets, work permits, work visas, and contracts for each user
- **Interview Scheduling**: Ensures proper synchronization of interview dates and times between admin and user views
- **Error Reporting**: Comprehensive logging and admin notifications for data inconsistencies

## User Archive System
- **Automated Archiving**: Scheduled service runs every 24 hours to archive users older than 1 year
- **Admin Management**: Comprehensive admin interface with archive statistics, user lists, and management tools
- **Manual Controls**: Admin can manually archive or restore individual users with custom reasons
- **Database Schema**: Added archived, archivedAt, and archivedReason fields to users table
- **API Endpoints**: RESTful endpoints for archive operations including stats, user lists, and archive/restore actions
- **Safety Features**: Archive operations are reversible and maintain data integrity

## Recent Major Updates
- **Copyright Footer Implementation**: Added Senmer Consulting OPC Pvt Ltd copyright footer across all application pages and PDF export functionality (August 2025)
- **Reports PDF Export Enhancement**: Fixed PDF export functionality with proper error handling, toast notifications, and Senmer Consulting copyright integration (August 2025)
- **User Archive Management System**: Implemented comprehensive archive module with automated archiving for users older than 1 year, admin interface for archive management, and API endpoints for manual archiving/restoration operations (August 2025)
- **Comprehensive Audit Logging System**: Implemented complete audit trail with database schema, service layer, and modern admin dashboard for tracking all system activities including user authentication, data changes, file operations, and admin actions (August 2025)
- **Interview Time Scheduling**: Added comprehensive interview time support for work visa applications (August 2025)
- **Data Synchronization Service**: Implemented automated 5-minute data consistency checks with admin monitoring dashboard (August 2025)
- **Enhanced Work Visa Module**: Complete synchronization between admin and user dashboards for interview scheduling (August 2025)
- **Modernized Administrator Console**: Completely revamped admin dashboard with futuristic glassmorphism design, interactive animations, and enhanced user experience (August 2025)
- **Advanced Data Sync Center**: Implemented modern monitoring interface with real-time status indicators and professional Chef Overseas branding (August 2025)