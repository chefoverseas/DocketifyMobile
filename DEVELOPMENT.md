# 🛠️ Development Guide - Docketify

This guide provides comprehensive instructions for developers working on the Docketify project.

## 🏃‍♂️ Quick Development Setup

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Database Setup
```bash
# Push schema to database
npm run db:push

# Generate new migration (if needed)
npm run db:generate

# Apply migrations (if needed)
npm run db:push --force
```

### 3. Start Development Server
```bash
# Start both frontend and backend
npm run dev
```

This starts:
- Express server on port 5000
- Vite dev server (integrated with Express)
- File watcher for TypeScript compilation

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   ├── sendgrid.ts       # Email service
│   └── *.ts              # Other server modules
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema (Drizzle)
└── uploads/              # File storage directory
```

## 📊 Database Operations

### Schema Changes
1. Modify `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update storage operations in `server/storage.ts`
4. Update TypeScript types if needed

### Adding New Tables
```typescript
// In shared/schema.ts
export const newTable = pgTable('new_table', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  // ... other fields
});

// Add relations if needed
export const newTableRelations = relations(newTable, ({ one, many }) => ({
  // ... relations
}));
```

## 🎨 Frontend Development

### Component Development
- Use Shadcn/ui components as base
- Follow Chef Overseas branding (orange/red/green colors)
- Implement glassmorphism design for admin modules
- Add proper TypeScript types
- Include data-testid attributes for testing

### Adding New Pages
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation if needed

### State Management
- Use TanStack Query for server state
- Use React hooks for local state
- Follow query key patterns: `['/api/endpoint', ...params]`

## 🔧 Backend Development

### Adding New API Endpoints
1. Define route in `server/routes.ts`
2. Add storage method in `server/storage.ts`
3. Update TypeScript interfaces
4. Add proper validation with Zod

### Email Templates
- Modify functions in `server/sendgrid.ts`
- Test in development mode (logs to console)
- Use Chef Overseas branding
- Include both HTML and text versions

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and OTP verification
- [ ] Document upload and validation
- [ ] Admin dashboard functionality
- [ ] Email notifications (check console logs)
- [ ] Data synchronization service
- [ ] Work permit status updates
- [ ] File download functionality

### Email Testing
In development mode, emails are logged to console:
```bash
# Check server logs for email content
npm run dev
# Look for 📧 email log entries
```

## 🛡️ Security Considerations

### Authentication
- OTP codes expire in 10 minutes
- Sessions are server-side only
- Admin access is role-based
- Input validation on all endpoints

### File Uploads
- Type validation (PDF, JPG, PNG, DOC, DOCX)
- Size limits (10MB maximum)
- UUID-based filename generation
- Secure storage in uploads/ directory

### Environment Variables
- Never commit real secrets
- Use Replit Secrets for production
- Rotate SESSION_SECRET regularly
- Monitor API key usage

## 📈 Performance Optimization

### Database
- Use proper indexes on frequently queried fields
- Implement pagination for large datasets
- Use connection pooling (built into Drizzle)

### Frontend
- Lazy load components where appropriate
- Optimize images and files
- Use React Query caching effectively

### Email Service
- Implement rate limiting
- Monitor SendGrid usage
- Cache email templates

## 🔍 Debugging

### Common Issues

**Git Lock File**
```bash
rm -f .git/index.lock
```

**Database Connection**
- Check DATABASE_URL format
- Verify PostgreSQL service is running
- Confirm network access to database

**Email Delivery**
- Verify SENDGRID_API_KEY is set
- Check sender email is verified
- Review SendGrid activity logs

**File Upload Issues**
- Check uploads/ directory permissions
- Verify file size limits
- Confirm MIME type validation

### Logging
- Server logs: Check console output
- Client logs: Browser developer tools
- Database logs: Enable in development
- Audit logs: Check audit_logs table

## 📦 Deployment

### Replit Deployment (Recommended)
1. Push code to repository
2. Connect repository to Replit
3. Configure secrets in Replit dashboard
4. Deploy via Replit Deployments

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
SESSION_SECRET=secure-random-string
SENDGRID_API_KEY=SG.xxx
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Email templates tested
- [ ] Admin user created
- [ ] File upload permissions set

## 🎯 Code Style

### TypeScript
- Use strict type checking
- Prefer interfaces over types for objects
- Use proper error handling
- Document complex functions

### React
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for expensive components
- Follow component composition patterns

### CSS/Tailwind
- Use consistent spacing scale
- Implement Chef Overseas color scheme
- Use responsive design principles
- Maintain glassmorphism aesthetic for admin

## 🚀 Advanced Features

### Adding New Notification Types
1. Create email template in `server/sendgrid.ts`
2. Add notification type to admin service
3. Implement trigger conditions
4. Test in development mode

### Extending Data Sync Service
1. Add new consistency checks to sync service
2. Implement auto-healing logic
3. Update admin dashboard monitoring
4. Add audit logging

### Custom Admin Modules
1. Create new admin page component
2. Add API endpoints for CRUD operations
3. Implement proper authorization
4. Style with glassmorphism design

## 📞 Getting Help

- Check existing documentation first
- Review error logs thoroughly
- Test in development mode
- Contact: info@chefoverseas.com

---

**Note**: This is a living document. Update it when adding new features or changing development processes.