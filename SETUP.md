# Setup Guide - Solo Dev PM

## Quick Start

### 1. Environment Setup

Before running the application, you need to set up your environment variables.

#### Generate Secrets

Run these commands to generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

#### Configure .env.local

Update your `.env.local` file with the generated secrets and your MongoDB URI:

```env
# MongoDB - Get this from MongoDB Atlas or your local MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solo-dev-pm?retryWrites=true&w=majority

# NextAuth - Use the first generated secret
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Encryption - Use the second generated secret
ENCRYPTION_KEY=your_generated_secret_here
```

### 2. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for Development)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `myFirstDatabase` with `solo-dev-pm`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/solo-dev-pm`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## First Time Setup

### 1. Register an Account

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Click "Sign up" to create a new account
4. Fill in your name, email, and password
5. Click "Create account"

### 2. Login

1. After registration, you'll be redirected to the login page
2. Enter your email and password
3. Click "Sign in"

### 3. Create Your First Project

1. From the dashboard, click "New Project"
2. Fill in the project details:
   - **Name**: Give your project a name
   - **Description**: Add a brief description
   - **Status**: Choose from Planning, Active, On Hold, or Completed
   - **Color**: Pick a color for visual identification
   - **Tech Stack**: Select the technologies you're using
   - **Dates**: Optionally set start and end dates
3. Click "Create Project"

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**: 
- Check if MongoDB is running (for local setup)
- Verify your connection string in `.env.local`
- Ensure your IP is whitelisted in MongoDB Atlas (if using Atlas)

### NextAuth Errors

**Error**: `[next-auth][error][NO_SECRET]`

**Solution**: 
- Make sure `NEXTAUTH_SECRET` is set in `.env.local`
- Restart the development server after adding the secret

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Reload

Next.js has hot reload enabled by default. Any changes you make to the code will automatically refresh the browser.

### Database Inspection

Use MongoDB Compass or MongoDB Atlas UI to inspect your database:
- View collections
- Check documents
- Run queries

### API Testing

You can test API routes using:
- Browser DevTools Network tab
- Postman
- curl commands

Example:
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Next Steps

Once Part 1 is working:

1. ✅ Test user registration and login
2. ✅ Create a few test projects
3. ✅ Edit and archive projects
4. ✅ Explore the dashboard
5. 🔜 Ready for Part 2 implementation (Kanban Board & Tasks)

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible
5. Try restarting the development server

## Production Deployment

For production deployment (covered in Part 3):

- Use Vercel for hosting
- Use MongoDB Atlas for database
- Set environment variables in Vercel dashboard
- Enable production optimizations

---

**Current Status**: Part 1 Complete ✅
**Next**: Part 2 - Task Management & Kanban Board

