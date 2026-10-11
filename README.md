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
| `DB_URL` | Required on Render; JDBC URL for the TiDB `artisan_db` schema |
| `DB_USER` | TiDB Cloud database username |
| `DB_PASS` | TiDB password; prompt locally with `backend/run-tidb.ps1`, set as a secret in hosting |
| `JWT_SECRET` | JWT signing secret; use at least 64 UTF-8 bytes and keep the same value across restarts |
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
The repository includes `render.yaml` and `backend/Dockerfile`. Render builds the backend with Java 17 and starts the Spring Boot app in the Docker image.

1. Push the project to GitHub. In Render, choose **New → Blueprint**, connect the repository, and select the repository root. Render reads `render.yaml`; the Dockerfile path is `backend/Dockerfile` and the Docker build context is `backend`.
2. When Render asks for values marked `sync: false`, enter the settings below. Use the same TiDB Cloud cluster and `artisan_db` database that contain your products and users:

   | Render variable | Value |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` (the Blueprint sets this) |
   | `DB_URL` | `jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/artisan_db?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3` |
   | `DB_USER` | The TiDB Cloud database username shown in the project's `application-tidb.properties` or TiDB **Connect** page |
   | `DB_PASS` | Your rotated TiDB password; enter it only in Render's environment settings |
   | `JWT_SECRET` | A newly generated secret of at least 64 UTF-8 bytes. Keep it private and stable across backend restarts. |
   | `ALLOWED_ORIGINS` | Initially `http://localhost:5173`; replace this with the Vercel site origin after frontend deployment |
   | `RAZORPAY_KEY_ID` | Optional for browsing; use your Razorpay key if checkout is enabled |
   | `RAZORPAY_KEY_SECRET` | Optional for browsing; set as a secret if checkout is enabled |

   Do not use the local development profile on Render. Do not paste database passwords or signing keys into GitHub, this README, or source files.

   To generate a strong JWT secret in PowerShell, run this locally and paste the output directly into Render's `JWT_SECRET` field. Keep it private:

   ```powershell
   $bytes = New-Object byte[] 64
   [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
   [Convert]::ToBase64String($bytes)
   ```

3. Click **Apply** to create/deploy the service. Open its **Logs** in Render and wait for the deployment to finish and Spring Boot to report that it started. If startup fails, check the first database/JWT error in the logs and confirm the `DB_URL`, username, password, and TiDB network access.
4. Copy the service's public URL from Render, for example `https://artisan-connect-backend.onrender.com`. Check that the API responds by opening `https://YOUR-SERVICE.onrender.com/api/products?page=0&size=12`. A JSON response (including an empty products list) means the frontend can reach the backend; a database error means the Render-to-TiDB connection needs attention.
5. Deploy the frontend to Vercel as described below, then return to Render → **Environment** and set `ALLOWED_ORIGINS` to the exact Vercel origin, for example `https://your-site.vercel.app` (no trailing slash). Save and redeploy the backend so browsers are allowed to call it.

For an existing Render service instead of a new Blueprint, open that service's **Environment** page and add/update the same variables. Keep the repository root as the service root so the paths in `render.yaml` remain correct. A Render free service may take a little while to wake after being idle; the first request can be slower.

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
