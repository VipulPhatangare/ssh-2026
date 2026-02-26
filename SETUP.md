# MP E-Governance Portal - Quick Setup Guide

## Installation Steps

1. Install backend dependencies:
   npm install

2. Install frontend dependencies:
   cd frontend
   npm install
   cd ..

3. Create .env file from .env.example:
   copy .env.example .env
   (Edit .env with your MongoDB URI and JWT secret)

4. Make sure MongoDB is running:
   net start MongoDB

5. Seed the database with MP schemes:
   npm run seed

6. Start the development servers:
   Option 1 - Run separately:
     Backend:  npm run dev
     Frontend: cd frontend && npm start

   Option 2 - Run together:
     npm run dev:full

7. Access the application:
   Frontend: http://localhost:3000
   Backend:  http://localhost:5000

## Testing

1. Register a new citizen account
2. Update one user to Admin role via MongoDB:
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { role: "Admin" } }
   )

## Features to Test

- User Registration & Login
- Dashboard with eligible schemes
- Scheme Explorer with filters
- Life Event based scheme discovery
- Application tracking
- Document upload
- Grievance submission
- Admin Panel (for admin users)

---

For detailed documentation, see README.md
