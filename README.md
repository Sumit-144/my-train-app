# my-train-app
It is a NextJs-ExpressJs test project.

# Train Ticket Booking Web Application

A full-stack web application for booking train tickets built with **Next.js**, **Node.js/Express**, and **PostgreSQL**. The application allows users to sign up, log in, view the current seating layout of a train, book tickets using a smart seating algorithm, and cancel all their bookings. The booking algorithm prioritizes grouping seats in a single row and falls back to clustering nearby seats if needed.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Database Setup](#database-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- **User Authentication:**  
  - Sign up with name, email, and password.
  - Log in with email and password using JWT-based authentication.

- **Train Seating Dashboard:**  
  - View real-time train seating layout.
  - Seats are color-coded:
    - **Green:** Seats booked by the currently logged-in user.
    - **Yellow:** Seats booked by other users.
    - **White/Light:** Available seats.
    
- **Ticket Booking:**  
  - Book between 1 and 7 seats at a time.
  - The system automatically assigns seats by first trying to fill seats in a single row before clustering nearby available seats.

- **Booking Cancellation:**  
  - Cancel all tickets booked by the logged-in user with one click.

- **Responsive Design:**  
  - Built using Bootstrap to ensure a responsive, mobile-friendly design.

## Project Structure

my-train-app/
├── 📁 server/ # Backend Server (Express.js)
│ ├── 📁 config/
│ │ └── db.js # PostgreSQL database configuration
│ ├── 📁 middleware/
│ │ └── auth.js # JWT authentication middleware
│ ├── 📁 routes/
│ │ ├── auth.js # Authentication routes (signup/login)
│ │ └── booking.js # Booking management routes
│ ├── 📁 scripts/
│ │ └── seedSeats.sql # Database seeding script for seats
│ ├── .env # Environment variables 🔐
│ ├── server.js # Server entry point
│ ├── package.json # Backend dependencies
│ └── package-lock.json
│
└── 📁 client/ # Frontend Client (Next.js)
├── 📁 components/
│ └── SeatGrid.js # Interactive seat grid component
├── 📁 pages/
│ ├── index.js # Main dashboard page
│ ├── login.js # User login page
│ └── signup.js # User registration page
├── 📁 public/ # Static assets
├── package.json # Frontend dependencies
└── package-lock.json


## Prerequisites

- **Node.js** (v14 or newer recommended)
- **PostgreSQL** (Ensure that PostgreSQL is running and accessible)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sumit-144/my-train-app.git
   cd my-train-app/server

2. Install backend dependencies:

npm install

3. Create a .env file in the server folder with the following contents:
DATABASE_URL=postgres://yourUsername:yourPassword@localhost:5432/yourDatabase
JWT_SECRET=your_jwt_secret_key
PORT=5000

# JWT_SECRET can be any alpha numeric key or use this to generate one : 
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

### Database Setup

1. Create the PostgreSQL tables:
Connect to your PostgreSQL instance (via psql or a GUI like pgAdmin) and run the following SQL commands:

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Create seats table
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  row_number INTEGER NOT NULL,
  col_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  status INTEGER DEFAULT 0,       -- 0 = available, 1 = booked, 2 = not available
  booked_by INTEGER,
  CONSTRAINT fk_user FOREIGN KEY(booked_by) REFERENCES users(id)
);

2. Seed the Seats Table:
In the server/ folder, you have the file seedSeats.sql.Run this script using your preferred method. For example, using psql.

### Frontend setup (client/)

1. Navigate to client folder
 cd client
2. Install dependencies
npm install

### Run application

1. Start backend server
cd my-train-app/backend
npm start

2. Start frontend server
cd my-train-app/client
npm run dev
