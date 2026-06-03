# Render Deployment

This repo is ready to deploy as two Render services:

- `server`: Express, Socket.IO, MongoDB, Cloudinary
- `client`: Vite static site

## 1. Prepare external services

Create a free MongoDB Atlas cluster and a free Cloudinary account.

In MongoDB Atlas, add a database user and allow network access from Render. For a free Render service, the simplest Atlas network access setting is `0.0.0.0/0`.

## 2. Deploy the backend first

Create a Render Web Service:

- Root Directory: `server`
- Runtime: `Node`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/health`

Set these environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

After deploy, copy the backend URL, for example:

```txt
https://quickchat-api.onrender.com
```

## 3. Deploy the frontend

Create a Render Static Site:

- Root Directory: `client`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

Set this environment variable:

```txt
VITE_BACKEND_URL=https://your-backend-service.onrender.com
```

Add a rewrite rule for React Router:

```txt
Source: /*
Destination: /index.html
Action: Rewrite
```

## 4. Optional CORS lock-down

After the frontend is deployed, copy its URL and add this backend environment variable:

```txt
CLIENT_URL=https://your-frontend-service.onrender.com
```

Redeploy the backend after setting it.
