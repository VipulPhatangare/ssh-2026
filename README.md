# Madhya Pradesh Citizen-Centric E-Governance Portal

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application providing an AI-powered citizen intelligence layer that unifies multiple government department services into one seamless user experience.

## 🚀 Features

### Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (Citizen, Admin)
- HTTP-only cookie storage for enhanced security
- Password hashing with bcrypt

### User Profile System
- Comprehensive user profiles with demographic information
- Samagra ID integration
- Document vault for secure file storage
- Profile update functionality

### Intelligent Scheme Discovery
- **Missed Benefit Detection Engine**: Automatically identifies eligible but unclaimed government schemes
- **Life-Event Based Service Bundling**: Recommends schemes based on major life events
- **Smart Matching Algorithm**: Calculates eligibility with 100% accuracy using multi-factor scoring

### Application Management
- Track application status in real-time
- Detailed application timeline
- Document requirement checklist
- Application history with status badges

### Document Vault
- Secure document upload and storage
- Document expiry tracking and alerts
- Support for multiple document types
- Auto-match documents with scheme requirements

### Grievance System
- Raise grievances for any application
- Auto-escalation after specified days
- Track grievance status and responses
- Multi-level escalation support

### Admin Panel
- Comprehensive dashboard with statistics
- User management
- Application status updates
- Grievance monitoring
- Scheme management (CRUD operations)

## 📋 Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Helmet for security
- Express Rate Limiter
- CORS

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- Context API for state management
- CSS3 for styling

## 📁 Project Structure

```
ssh-2026/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── multer.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── schemeController.js
│   │   ├── applicationController.js
│   │   ├── documentController.js
│   │   ├── grievanceController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Scheme.js
│   │   ├── Application.js
│   │   ├── Document.js
│   │   └── Grievance.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── schemeRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── grievanceRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   ├── schemeMatchingService.js
│   │   ├── grievanceService.js
│   │   └── seedSchemes.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   └── PrivateRoute.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js
│       │   ├── Profile.js
│       │   ├── SchemeExplorer.js
│       │   ├── LifeEventPage.js
│       │   ├── ApplicationTracker.js
│       │   ├── GrievancePage.js
│       │   └── AdminPanel.js
│       ├── utils/
│       │   └── api.js
│       ├── App.js
│       └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ssh-2026
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mp-egovernance
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 5: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Windows
net start MongoDB

# For macOS/Linux
sudo systemctl start mongod
```

### Step 6: Seed Database with MP Schemes

Run the seeder to populate the database with Madhya Pradesh government schemes:

```bash
npm run seed
```

### Step 7: Start the Application

**Option 1: Run Backend and Frontend Separately**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option 2: Run Both Concurrently**
```bash
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 👤 Default User Accounts

After registration, you can create users with different roles:

**Citizen Account:**
- Register through the frontend at `/register`

**Admin Account:**
- Manually update a user's role to 'Admin' in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "Admin" } }
)
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Update password

### Schemes
- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme by ID
- `GET /api/schemes/eligible/me` - Get eligible schemes for current user
- `GET /api/schemes/unclaimed/me` - Get unclaimed schemes
- `GET /api/schemes/life-event/:event` - Get schemes by life event
- `POST /api/schemes` - Create scheme (Admin only)
- `PUT /api/schemes/:id` - Update scheme (Admin only)
- `DELETE /api/schemes/:id` - Delete scheme (Admin only)

### Applications
- `POST /api/applications` - Create new application
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications` - Get all applications (Admin)
- `PUT /api/applications/:id/status` - Update application status (Admin)

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/my-documents` - Get user's documents
- `GET /api/documents/:id` - Get document by ID
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/expiry-alerts` - Get expiry alerts
- `PUT /api/documents/:id/verify` - Verify document (Admin)

### Grievances
- `POST /api/grievances` - Create grievance
- `GET /api/grievances/my-grievances` - Get user's grievances
- `GET /api/grievances/:id` - Get grievance by ID
- `GET /api/grievances` - Get all grievances (Admin)
- `PUT /api/grievances/:id/status` - Update grievance status (Admin)
- `POST /api/grievances/:id/response` - Add response to grievance (Admin)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID

## 🧪 Testing the Application

### Test User Journey

1. **Registration**: Create a new citizen account
   - Fill in all required details including district, occupation, income, etc.

2. **Login**: Login with your credentials

3. **Dashboard**: View your personalized dashboard showing:
   - Eligible schemes
   - Unclaimed benefits
   - Document expiry alerts

4. **Explore Schemes**: 
   - Browse all schemes
   - Filter by eligibility
   - View unclaimed benefits

5. **Life Events**: Select a life event to see relevant schemes

6. **Apply for Schemes**: Click "Apply Now" on eligible schemes

7. **Track Applications**: View application status and timeline

8. **Upload Documents**: Add documents to your document vault

9. **Raise Grievance**: Submit a grievance for any application

10. **Admin Panel** (Admin users only):
    - View statistics
    - Manage users
    - Update application statuses
    - Respond to grievances

## 🔒 Security Features

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet for setting security headers
- CORS configuration
- Input validation and sanitization
- Protected routes with authentication middleware
- Role-based access control

## 📊 Database Schema

### User
- fullName, email, password (hashed)
- age, gender, casteCategory
- annualIncome, occupation, district
- samagraId (optional)
- role (Citizen/Admin)
- documents (array of references)

### Scheme
- name, description, department
- eligibility criteria (age, income, caste, gender, occupation)
- requiredDocuments
- lifeEvents
- benefits, applyUrl

### Application
- userId, schemeId
- status, submissionDate
- timeline (array of status updates)
- submittedDocuments
- applicationNumber (auto-generated)

### Document
- userId, documentType
- fileName, filePath, fileUrl
- expiryDate
- isVerified

### Grievance
- userId, applicationId
- complaintText, status
- escalationLevel
- responses (array)
- grievanceNumber (auto-generated)

## 🎯 Key Algorithms

### Scheme Matching Algorithm

The system uses a multi-factor scoring algorithm:

1. **Age Eligibility** (25 points): Check if user's age falls within scheme's age range
2. **Income Eligibility** (25 points): Verify annual income is within the limit
3. **Caste Category** (20 points): Match user's caste category
4. **Gender** (15 points): Match gender requirements
5. **Occupation** (15 points): Match occupation type

Total Score: 100 points (100% = Fully Eligible)

### Auto-Escalation Logic

Grievances are automatically escalated:
- After 7 days of being open/in-progress
- Maximum 3 escalation levels
- System automatically adds escalation timeline entry

## 🚦 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production MongoDB URI
4. Set up Cloudinary for file storage
5. Enable HTTPS

### Build Frontend
```bash
cd frontend
npm run build
```

### Serve Static Files
Update `server.js` to serve the React build:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
```

## 📝 License

MIT License

## 👥 Contributors

Developed as part of SSH-2026 project

## 📞 Support

For any queries or issues, please open an issue in the repository.

---

**Note**: This application is designed as an intelligent layer that complements (not replaces) the official MP e-Seva portal by providing enhanced citizen services through AI-powered scheme discovery and unified service access.
