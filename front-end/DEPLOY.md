# 🚀 Hướng dẫn Deploy EZ Home

## 📋 Yêu cầu trước khi deploy

### Backend (.env file)
```env
# Required
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
MONGODB_URI=mongodb://localhost:27017/ezhome
NODE_ENV=production

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL_PROD=https://yourdomain.com
```

### Frontend (.env file)
```env
# Development
VITE_API_URL=http://localhost:5000

# Production - Tạo file .env.production
VITE_API_URL=https://yourdomain.com
```

---

## 🌐 Khi Deploy lên Production

### 1. **Frontend - Tạo file `.env.production`**
```bash
cd front-end
```

Tạo file `.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
```

**Ví dụ:**
- Nếu backend deploy tại `https://api.ezhome.com`:
  ```env
  VITE_API_URL=https://api.ezhome.com
  ```

- Nếu backend cùng domain với frontend `https://ezhome.com`:
  ```env
  VITE_API_URL=https://ezhome.com
  ```

### 2. **Build Frontend**
```bash
npm run build
```

File build sẽ nằm trong folder `dist/`

### 3. **Deploy Frontend**
Upload folder `dist/` lên hosting (Vercel, Netlify, etc.)

**Lưu ý:** Trên hosting, thêm biến môi trường:
- Variable name: `VITE_API_URL`
- Value: `https://your-backend-domain.com`

### 4. **Backend - Update CORS**

File `back-end/server.js` cần update CORS:
```javascript
const corsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://yourdomain.com",           // Frontend production
      "https://www.yourdomain.com",       // WWW version
      "http://localhost:3000",            // Dev frontend
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
```

### 5. **Update Backend .env**
```env
NODE_ENV=production
FRONTEND_URL_PROD=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

---

## 🧪 Test Connection sau khi Deploy

1. Mở Browser Console (F12)
2. Check logs:
   - ✅ Backend đang chạy! → OK
   - ❌ Backend không kết nối được → Check URL

3. Test endpoints:
```javascript
// Test trong Browser Console
fetch('https://your-backend-domain.com/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 🐛 Troubleshooting

### Lỗi: CORS Error
**Nguyên nhân:** Backend không cho phép frontend domain

**Giải pháp:**
- Thêm frontend domain vào `FRONTEND_URL_PROD` trong backend `.env`
- Restart backend server

### Lỗi: ERR_CONNECTION_REFUSED
**Nguyên nhân:** Backend không chạy hoặc URL sai

**Giải pháp:**
- Kiểm tra backend có chạy không
- Kiểm tra `VITE_API_URL` có đúng không

### Lỗi: 404 Not Found
**Nguyên nhân:** Route không tồn tại

**Giải pháp:**
- Kiểm tra backend routes
- Đảm bảo API path đúng (có `/api` hay không)

---

## 📦 Deploy Options

### Option 1: Vercel (Frontend + Backend)
```bash
# Frontend
vercel --prod

# Backend
vercel --prod
```

### Option 2: Netlify (Frontend) + Heroku (Backend)
```bash
# Frontend
netlify deploy --prod

# Backend
git push heroku main
```

### Option 3: VPS (Full Stack)
```bash
# Backend
pm2 start server.js --name ezhome-backend

# Frontend (serve static files with nginx)
nginx -s reload
```

---

## ✅ Checklist Deploy

- [ ] Backend `.env` đã config đúng
- [ ] Frontend `.env.production` đã tạo
- [ ] CORS đã update cho phép frontend domain
- [ ] Google OAuth callback URL đã update
- [ ] Database connection string đúng
- [ ] Test `/health` endpoint
- [ ] Test login/register
- [ ] Test booking flow

