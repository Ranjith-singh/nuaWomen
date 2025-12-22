# Secure File Share

A full-stack file sharing application allowing users to upload, manage, and share files securely. Built with React.js (Frontend) and Node.js/Express (Backend).

## 🚀 Live Demo
**Frontend**: [Add your Vercel/Netlify link here]
**Backend**: [Add your Render/Railway link here]

---

## 📋 Features & Requirements Coverage

This project was built to satisfy the "Fullstack Developer Assignment" requirements.

### 1. File Upload
*   **Bulk Upload**: Users can select and upload multiple files simultaneously using the dashboard interface.
*   **Storage**: Files are securely stored in **Cloudinary**, ensuring reliable cloud storage.
*   **Metadata**: The dashboard displays key details for every file:
    *   Filename
    *   Preview (for images)
    *   Size (calculated in MB)
    *   Upload Date

### 2. File Sharing
The application supports two distinct sharing methods:

#### a. Share with specific users
*   Users can share files by entering the email addresses of other registered users.
*   **Access Control**: The backend validates that the target email exists and grants specific `viewer` permissions in the database (`sharedWith` array).
*   Only designated users can view these files in their "Shared with me" section.

#### b. Share via Link
*   **Secure Links**: Users can generate a unique shareable link.
*   **Protected Access**: Unlike public links (e.g., Dropbox public links), these links are **protected by authentication**.
*   **Requirement Met**: "Only users with an account should be able to access the file using that link." If a user is not logged in, they cannot access the file content even if they have the URL.

### 3. Access Control & Security (Critical)
*   **Authentication**: All interaction requires a valid JWT (JSON Web Token).
*   **Authorization Middleware**: Every backend route (`/files/*`) is protected by a `verifyJWT` middleware.
*   **Ownership Checks**:
    *   Users can only delete or share files they own.
    *   Users can only view files they own or have been explicitly granted access to.
*   **Validation**:
    *   File types and sizes are validated on the server side (Multer limits).
    *   Input sanitization for email addresses.

### 4. Bonus Features
*   **Link Expiry**: The "Share via Link" feature allows users to set an expiration date/time. This is encoded in the generated URL to enforce temporal access limits.

---

## 🛠 Tech Stack

*   **Frontend**: React.js (Vite), Tailwind CSS (Custom Design System), Lucide React (Icons), Axios.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose) for metadata and user relationships.
*   **Storage**: Cloudinary for physical file storage.
*   **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies.

---

## ⚙️ How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB installed locally or a MongoDB Atlas connection string.
*   Cloudinary Account (Cloud Name, API Key, API Secret).

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BACKEND_URL=http://localhost:8000/api/v1/files
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the application:
```bash
npm run dev
```

Access the app at `http://localhost:5173`.
