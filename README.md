# MyScheme Portal (MERN Stack Clone)

This is a "best-in-class," full-stack MERN (MongoDB, Express, React, Node.js) clone of the Indian government's `myScheme.gov.in` portal. Built from the ground up, this project is a comprehensive, data-driven application that demonstrates a professional, secure, and complex role-based architecture.

It is not just a simple UI clone; it includes a complete backend with a dynamic eligibility algorithm, role-based access control (RBAC), and a true separation of duties between different user types.

## 🚀 Key Features

This project is built around three distinct user roles, each with a unique dashboard and set of permissions.

### 👑 Admin (The "System Owner")
* **Analytics Dashboard:** A live-updating dashboard with **Recharts** graphs showing system-wide statistics (e.g., Applications by Status, Schemes by Department).
* **User Management:** Full CRUD (Create, Read, Update, Delete) capabilities for all users. Can promote/demote users between roles (e.g., promote a Citizen to a Coordinator).
* **Full Scheme Management:** Full CRUD (Create, Read, Update, Delete) for all schemes, both Government and Private.
* **Dynamic Form Builder:** A powerful UI for creating **custom application forms** for any private scheme. The Admin can add/remove text fields, number inputs, dropdowns, and file uploads.
* **True Role Separation:** The Admin has a "Scheme Assignment" panel to assign specific private schemes to specific coordinators.

### 🧑‍💼 Coordinator (The "Scheme Manager")
* **Role-Based Security:** Coordinators can **only** see and manage applications for the private schemes they have been assigned to by the Admin.
* **Coordinator Dashboard:** A custom dashboard showing stats for their assigned schemes (e.g., "Pending Applications," "Total Reviewed").
* **Analytics Graph:** A Pie Chart visualizing their personal review history (Approved vs. Rejected).
* **Full Application Workflow:**
    * **Review:** View all dynamically submitted data and uploaded documents from the citizen.
    * **Approve/Reject:** Approve or reject an application.
    * **Request More Info:** Send an application back to a citizen with notes, setting the status to "More Info Required."
* **Application History & Search:** A full, paginated history of all applications they've managed, with a search bar to find citizens by name or email.

### 👨‍👩‍👧‍👦 Citizen (The "End-User")
* **Dynamic Eligibility Checker:** A custom "algorithm" that asks for detailed personal data (age, state, income, BPL status, disability, etc.) and returns a sorted list of all schemes, each with a **Match Percentage (e.g., 100% Match)**.
* **Advanced Scheme Filtering:** A public "All Schemes" page with pagination and a search bar to filter by state, category, and occupation.
* **Dynamic Application Forms:** When a citizen applies for a private scheme, the application form is **dynamically rendered** based on the fields the Admin created.
* **File Uploads:** A complete file upload system (using Multer) integrated into the dynamic forms.
* **Real-time Notifications:** A navbar "bell" icon that lights up when a citizen's application status is updated by a coordinator.
* **Full User Workflow:**
    * **Save for Later:** Ability to save schemes.
    * **Track Status:** A dashboard to track all submitted applications and read coordinator notes.
    * **Re-submit:** If an application has "More Info Required," the user can re-submit with new documents.
    * **Change Password:** A secure page for users to change their own password.

### 💎 Technical Features
* **Authentication:** Secure, role-based authentication using JSON Web Tokens (JWT).
* **UI/UX:** A floating "Customer Care" button and a custom 404 "Not Found" page.
* **Database:** Complex data modeling in MongoDB with relational links (e.g., Users -> Schemes -> Applications).

## 🛠️ Technology Stack

### Backend
* **Node.js**
* **Express.js**
* **MongoDB** (with **Mongoose** for data modeling)
* **JSON Web Token (JWT)** (for authentication)
* **bcrypt.js** (for password hashing)
* **Multer** (for file uploads)

### Frontend
* **React** (with Hooks, Context API for state management)
* **React Router** (for page navigation)
* **Axios** (for API requests)
* **Recharts** (for admin/coordinator analytics charts)
* **CSS3** (for all custom styling)

## 🚀 Getting Started

To run this project on your local machine, follow these steps.

### Prerequisites
* [Node.js](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27018`)
* [Git](https://git-scm.com/)

### 1. Backend Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd myscheme-project/backend

# Install dependencies
npm install

# Create a .env file in the /backend folder with these contents:
# (You must use an App Password for Gmail)
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27018/myscheme
JWT_SECRET=your_super_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Run the seeder to populate the database with 100+ demo items
npm run seed

# Start the backend server
npm run dev