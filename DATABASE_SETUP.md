# Database Configuration for ServeFlow
# This file shows how to configure your database connection

## Common Hosting Providers & Their Databases:

### Namecheap Hosting
- Database Type: MySQL
- Host: Usually your domain or server IP
- Port: 3306
- Access via: cPanel → MySQL Databases

### GoDaddy Hosting
- Database Type: MySQL  
- Host: Provided in hosting dashboard
- Port: 3306
- Access via: Hosting → Manage → Databases

### Bluehost/HostGator
- Database Type: MySQL
- Host: localhost or server name
- Port: 3306
- Access via: cPanel → MySQL Database Wizard

### Cloudflare (if using their services)
- They don't provide databases directly
- Use external database service

---

## Setup Steps:

### 1. Create Database in Your Hosting Panel

Log into your hosting control panel (cPanel, Plesk, etc.) and:

1. **Create a new database**
   - Database name: `serveflow` or similar
   
2. **Create a database user**
   - Username: Choose a username
   - Password: Generate a strong password
   
3. **Assign user to database**
   - Grant ALL PRIVILEGES

4. **Note down these details:**
   ```
   Database Host: ________ (often localhost or your domain)
   Database Name: ________
   Database User: ________
   Database Password: ________
   Database Port: 3306 (usually)
   ```

---

## 2. Database Schema for ServeFlow

Once you have your database, run this SQL to create the tables:

```sql
-- Create volunteers table
CREATE TABLE volunteers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events/services table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location VARCHAR(255),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create volunteer-role assignments
CREATE TABLE volunteer_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    volunteer_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create event assignments
CREATE TABLE event_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    role_id INT,
    confirmed BOOLEAN DEFAULT FALSE,
    attended BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Create users table (for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    organization_id INT,
    role ENUM('admin', 'manager', 'volunteer') DEFAULT 'volunteer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Create organizations table
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(50) UNIQUE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Update Application Configuration

After creating your database, you'll need to:

1. **Create a `.env` file** in your project root:
   ```
   VITE_DATABASE_HOST=your-db-host.com
   VITE_DATABASE_NAME=serveflow
   VITE_DATABASE_USER=your-db-user
   VITE_DATABASE_PASSWORD=your-db-password
   VITE_DATABASE_PORT=3306
   ```

2. **Create a backend API** (Node.js/Express, PHP, etc.) to connect to your database
   - The frontend React app can't connect directly to MySQL for security reasons
   - You need a backend API layer

---

## 4. Backend Options

### Option A: Node.js + Express Backend
Create a simple Express server that connects to your MySQL database and provides REST API endpoints.

### Option B: PHP Backend
If your hosting supports PHP, you can create PHP API endpoints.

### Option C: Serverless Functions
Use Vercel/Netlify serverless functions or GitHub Actions.

### Option D: Keep Using Supabase (Recommended)
Supabase is actually free for small projects and much easier to set up!

---

## What Would You Like To Do?

Tell me:
1. **Which hosting provider do you use?** (Namecheap, GoDaddy, etc.)
2. **What type of database did they provide?** (MySQL, PostgreSQL)
3. **Do you have database credentials yet?**

Then I can help you:
- Set up the database schema
- Create a backend API to connect to it
- OR help you set up free Supabase account (easier!)

Let me know your hosting details! 🚀
