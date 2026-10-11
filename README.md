# 🏺 Artisan Connect

A dedicated full-stack e-commerce platform connecting artisans with customers for handmade and traditional craft products.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) + Vanilla CSS |
| Backend | Spring Boot 3.x (Java 17) |
| Security | Spring Security + JWT |
| Database | TiDB Cloud (MySQL-compatible) |
| Payment | Razorpay |
| Image Storage | Cloudinary |
| Backend Deploy | Render |
| Frontend Deploy | Vercel |

## 📁 Project Structure

```
Artisan/
├── backend/          # Spring Boot Maven project
├── frontend/         # React Vite project
├── render.yaml       # Render deployment config
└── README.md
```

## ⚙️ Prerequisites

- Java 17+
- Node.js 18+
- A TiDB Cloud cluster and its database connection details
- Maven 3.9+

## 🔧 Local Setup

### 1. Backend Setup (TiDB Cloud)
```bash
cd backend
 .\run-tidb.ps1
```
The launcher securely prompts for your TiDB password and JWT signing secret each time and connects to the `artisan_db` schema. Use the same JWT signing secret on each local start so existing login tokens remain valid. Set `SPRING_PROFILES_ACTIVE=tidb`, `DB_PASS`, and `JWT_SECRET` when launching by another method. Do not put credentials or signing keys in source files or commit them. The TiDB account must have permission to read and update tables in `artisan_db`.

Backend runs on: http://localhost:8080

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL and Razorpay key

npm run dev
```
Frontend runs on: http://localhost:5173

## 🔑 Environment Variables

### Backend (application.properties / Render env vars)
| Variable | Description |
|---|---|
| `DB_URL` | Optional JDBC URL override; default TiDB URL targets `artisan_db` |
| `DB_USER` | Optional TiDB username override |
| `DB_PASS` | TiDB password; prompt locally with `backend/run-tidb.ps1`, set as a secret in hosting |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

### Frontend (.env / Vercel env vars)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (public) |

## 🚢 Deployment

### Backend → Render (TiDB Cloud)
1. Push code to GitHub
2. In Render, create a Blueprint from the repository root, or create a Docker Web Service with the repository root as its **Root Directory**. The Dockerfile is `backend/Dockerfile` and its context is `backend`.
3. Set `SPRING_PROFILES_ACTIVE=prod`.
4. Set `DB_URL` to the TiDB JDBC URL for `artisan_db` with TLS, and set `DB_USER`, `DB_PASS`, and a newly generated `JWT_SECRET` as secret environment variables.
5. Set `ALLOWED_ORIGINS` to the exact Vercel site origin (for example, `https://your-site.vercel.app`, with no trailing slash). Add payment variables if checkout needs Razorpay.
6. Deploy and copy the Render service URL, such as `https://your-service.onrender.com`.

### Frontend → Vercel
1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`, framework preset to **Vite**, build command to `npm run build`, and output directory to `dist`.
3. Set `VITE_API_URL` to the Render service origin (for example, `https://your-service.onrender.com`, with no trailing slash). Set `VITE_RAZORPAY_KEY_ID` if using Razorpay.
4. Deploy. The `frontend/vercel.json` rewrite lets React Router routes such as `/products` work when opened directly.
5. Copy the deployed Vercel origin into Render's `ALLOWED_ORIGINS`, save, and redeploy the backend. Redeploy the frontend after changing its Vite environment variables.

### 🗄️ TiDB Cloud
Local and hosted backend runs should point to the same TiDB Cloud `artisan_db` schema. For Render, use the TiDB Cloud JDBC endpoint with TLS enabled, the TiDB username, and the rotated password. Existing accounts and products only appear if this is the same TiDB cluster and schema where they were saved.

## 👥 User Roles

| Role | Access |
|---|---|
| **Customer** | Browse products, cart, checkout, orders, reviews |
| **Artisan** | Manage products, view artisan orders, edit profile |
| **Admin** | Manage all users, products, orders, verify artisans |

## 📋 Default Admin Setup
After first run, manually update a user's role to ADMIN in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@artisanconnect.com';
```

## 🔒 Validation Rules

| Field | Rule |
|---|---|
| Username | 3–20 chars, alphanumeric + underscore only |
| Email | Valid email format |
| Phone | 10 digits, starts with 6–9 (Indian mobile) |
| Password | Min 8 chars, at least 1 letter + 1 number |

## 💳 Razorpay Test Credentials
Use Razorpay test mode keys for development. Test card: 4111 1111 1111 1111

## 📸 Cloudinary Setup
1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to environment variables

## 📄 License
MIT License - Built for educational and production use.
