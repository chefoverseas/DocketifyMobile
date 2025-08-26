# 🚀 Docketify - Chef Overseas Document Management System

A secure, modern web application for international work permit processing and document management, featuring robust authentication, real-time notifications, and comprehensive admin controls.

![Chef Overseas](https://img.shields.io/badge/Company-Chef%20Overseas-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791)

## ✨ Features

### 🔐 **Secure Authentication**
- Mobile OTP verification with SendGrid integration
- Admin-only user provisioning system
- Session-based authentication with secure cookies
- Multi-country OTP support (13 country codes)

### 📋 **Document Management**
- Comprehensive docket system for document collection
- File upload with validation (PDF, JPG, PNG, DOC, DOCX)
- Real-time file processing and metadata storage
- Secure local file storage with UUID naming

### 👨‍💼 **Admin Dashboard**
- Modern glassmorphism UI design
- User management with full CRUD operations
- Document status tracking and approval workflows
- Real-time notification system
- Comprehensive audit logging

### 📧 **Email Notifications**
- Work permit status change notifications
- Docket completion reminders (daily frequency control)
- Final document upload alerts
- Professional HTML email templates with Chef Overseas branding

### 🔄 **Data Synchronization**
- Automated consistency checks every 5 minutes
- Cross-module data integrity validation
- Auto-healing for missing records
- Real-time admin monitoring dashboard

### 📊 **Work Permit Processing**
- Multi-status workflow (preparation → submitted → under_review → approved/rejected)
- Interview scheduling for work visas
- Contract management integration
- Progress tracking with visual indicators

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with Chef Overseas branding
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions + OTP verification
- **File Handling**: Multer middleware with validation
- **Email Service**: SendGrid with professional templates

### Security
- **HTTPS**: SSL/TLS with Helmet.js security headers
- **Input Validation**: Zod schema validation throughout
- **Session Security**: Secure server-side sessions with expiration
- **File Security**: Type and size restrictions (10MB limit)
- **Audit Trail**: Comprehensive logging of all system activities

### Database Design
```sql
Core Tables:
├── users (authentication & profiles)
├── dockets (document collections with JSON metadata)
├── work_permits (status tracking & processing)
├── work_visas (interview scheduling)
├── contracts (agreement management)
├── otp_sessions (temporary verification codes)
├── notifications (admin dashboard alerts)
└── audit_logs (comprehensive activity tracking)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SendGrid API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/docketify.git
cd docketify
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Deployment

This application is optimized for deployment on Replit:

1. Import project to Replit
2. Add secrets via Replit's Secrets tab
3. Deploy using Replit Deployments
4. Configure custom domain (optional)

## 📱 Usage

### For Users
1. **Authentication**: Receive OTP via email/SMS
2. **Profile Setup**: Complete personal information
3. **Document Upload**: Submit required documents via docket
4. **Status Tracking**: Monitor work permit progress
5. **Notifications**: Receive email updates on status changes

### For Administrators
1. **User Management**: Create and manage user accounts
2. **Document Review**: Approve/reject submitted documents
3. **Status Updates**: Update work permit processing stages
4. **Monitoring**: Track system health via data sync dashboard
5. **Audit Logs**: Review comprehensive activity logs

## 📧 Email Notifications

The system sends automated notifications for:
- Work permit status changes
- Docket completion reminders (once daily)
- Final document availability
- Welcome messages for new users

All emails feature:
- Professional Chef Overseas branding
- Working action buttons linking to the application
- Both HTML and plain text formats
- Responsive design for mobile devices

## 🛡️ Security Features

- **Authentication**: Secure OTP-based login system
- **Authorization**: Role-based access control (user/admin)
- **Data Protection**: Input validation and sanitization
- **Session Management**: Secure server-side sessions
- **Audit Trail**: Complete activity logging
- **File Security**: Type validation and size limits
- **HTTPS**: Enforced SSL/TLS encryption

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP code
- `POST /api/auth/verify-otp` - Verify and login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### User Management
- `GET /api/users` - List all users (admin)
- `POST /api/users` - Create new user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Document Management
- `GET /api/docket` - Get user's docket
- `POST /api/docket/upload` - Upload document
- `DELETE /api/docket/:field` - Remove document

### Work Permit Processing
- `GET /api/work-permit` - Get work permit status
- `PUT /api/work-permit/:id` - Update status (admin)

## 📋 Environment Variables

See `.env.example` for complete configuration template.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session encryption key
- `SENDGRID_API_KEY` - Email service API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Email**: info@chefoverseas.com
- **WhatsApp**: +919363234028
- **Documentation**: See project wiki
- **Issues**: GitHub Issues tab

## 📄 License

This project is proprietary software owned by Chef Overseas.

---

**Chef Overseas** - Specializing in international work permit processing with cutting-edge technology and streamlined workflows.