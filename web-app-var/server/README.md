# Web App Backend

Express.js REST API with MongoDB.

## 🚀 Tech Stack

- Node.js
- Express.js 5.2.1
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm start
```

Server will run on `http://localhost:3001`

## 🔐 Authentication

Uses JWT tokens with bcrypt password hashing.

- Access Token: 24 hours
- Refresh Token: 7 days

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
MONGO_URL=your_mongodb_connection_string
SECRET_KEY=your_secret_key
```

## 🔗 Frontend Repository

[Web App Frontend](https://github.com/YOUR_USERNAME/web-app-frontend)

## 📚 API Endpoints

### Authentication
- `POST /api/users/login` - Login
- `POST /api/users/register` - Register

### Users (Protected)
- `GET /api/users` - Get all users (requires auth)
- `POST /api/users` - Create user (requires admin)
- `PUT /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires admin)

### Posts (Protected)
- `GET /api/posts` - Get all posts (requires auth)
- `POST /api/posts` - Create post (requires auth)
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)

### Services (Protected)
- `GET /api/services` - Get all services (requires auth)
- `POST /api/services` - Create service (requires auth)
- `PUT /api/services/:id` - Update service (requires auth)
- `DELETE /api/services/:id` - Delete service (requires auth)

## 📄 License

MIT

## 🚂 Deploy to Railway

### Prerequisites
- GitHub account with this repository
- Railway account (sign up at https://railway.app)
- MongoDB Atlas account (for database)

### Step 1: Prepare MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Railway access
5. Get your connection string

### Step 2: Deploy to Railway

1. **Login to Railway**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `web-app-backend` repository

3. **Configure Environment Variables**
   - Go to your project → Variables
   - Add the following variables:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
     SECRET_KEY=your_secret_key_here
     PORT=3001
     ```

4. **Deploy**
   - Railway will automatically detect Node.js
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete

5. **Get Your URL**
   - Go to Settings → Generate Domain
   - Your API will be available at: `https://your-app.up.railway.app`

### Step 3: Test Your Deployment

```bash
# Test health check
curl https://your-app.up.railway.app/api/users

# Test login
curl -X POST https://your-app.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### Step 4: Update Frontend

Update your frontend `.env` file:
```env
VITE_API_URL=https://your-app.up.railway.app
```

### Troubleshooting

**Deployment failed?**
- Check Railway logs in the Deployments tab
- Verify environment variables are set correctly
- Ensure MongoDB connection string is valid

**Can't connect to database?**
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify database user credentials
- Test connection string locally first

**API not responding?**
- Check if PORT environment variable is set
- Verify Railway generated domain is correct
- Check CORS settings if frontend can't connect

