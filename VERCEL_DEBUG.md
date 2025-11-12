# Vercel Deployment Debug Guide

## Error Details
- **Error**: White screen with Server Components render error
- **Console Error**: `Uncaught Error: An error occurred in the Server Components render`
- **Status**: Error message is hidden in production builds

## Changes Made for Debugging

### 1. Added Console Logs Throughout the App

All major components now have console.log statements to track rendering:

- ✅ `src/app/layout.tsx` - Root layout
- ✅ `src/app/(dashboard)/layout.tsx` - Dashboard layout
- ✅ `src/app/(dashboard)/page.tsx` - Dashboard page
- ✅ `src/components/providers/SessionProvider.tsx` - Session provider
- ✅ `src/components/providers/PlanjoExperienceProvider.tsx` - Experience provider
- ✅ `src/components/layout/Sidebar.tsx` - Sidebar component
- ✅ `src/components/vibe/VibeContainer.tsx` - Vibe mode container
- ✅ `src/components/vibe/AmbientSoundPlayer.tsx` - Ambient sound player
- ✅ `src/components/tasks/TaskDetail.tsx` - Task detail dialog

### 2. Added Error Boundaries

Created error boundary components to catch and display errors:

- ✅ `src/app/error.tsx` - Root error boundary
- ✅ `src/app/(dashboard)/error.tsx` - Dashboard error boundary

### 3. Fixed AmbientSoundPlayer SSR Issues

Added comprehensive client-side checks:

```typescript
- Added `isClient` state flag
- Check `typeof window === 'undefined'` before accessing browser APIs
- Prevent duplicate YouTube API script loading
- Validate YouTube API availability before creating players
- Show loading message during SSR
```

### 4. Added Safety Checks in TaskDetail

- Check if `task` exists before accessing `task._id`
- Added early return if task is null
- Added console logs for debugging

## How to Debug on Vercel

### Step 1: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to the "Functions" tab
4. Look for error logs in the function execution logs

### Step 2: Check Browser Console

1. Open the deployed app in your browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Look for the console.log messages we added:
   - `[RootLayout]` - Root layout rendering
   - `[DashboardLayout]` - Dashboard layout rendering
   - `[SessionProvider]` - Session provider rendering
   - `[PlanjoExperienceProvider]` - Experience provider rendering
   - `[Sidebar]` - Sidebar rendering
   - `[DashboardPage]` - Dashboard page rendering
   - `[AmbientSoundPlayer]` - Ambient sound player rendering
   - `[VibeContainer]` - Vibe container rendering
   - `[TaskDetail]` - Task detail rendering

### Step 3: Check Network Tab

1. Open Developer Tools (F12)
2. Go to the Network tab
3. Refresh the page
4. Look for failed requests (red status codes)
5. Check if API routes are returning errors

### Step 4: Enable Detailed Error Messages (Temporarily)

To see the actual error message in production:

1. Add this to `next.config.js`:
   ```javascript
   module.exports = {
     productionBrowserSourceMaps: true,
   }
   ```
2. Redeploy
3. Check the error message in the browser console
4. **IMPORTANT**: Remove this after debugging (it exposes source code)

## Common Issues to Check

### 1. Environment Variables
- ✅ MONGODB_URI
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ ENCRYPTION_KEY

### 2. Database Connection
- Check if MongoDB Atlas allows connections from Vercel IPs
- Check if connection string is correct
- Check if database user has proper permissions

### 3. Server-Side Rendering Issues
- Components using `window`, `document`, or browser APIs without checks
- YouTube IFrame API loading on server side
- Audio context creation on server side

### 4. Import Errors
- Missing dependencies in package.json
- Incorrect import paths
- Circular dependencies

## Next Steps

1. **Deploy the changes** with all the console logs
2. **Open the deployed app** in your browser
3. **Check the console** for the log messages
4. **Find where the logs stop** - that's where the error occurs
5. **Report back** with the last log message you see

The console logs will tell us exactly where the app is failing!

