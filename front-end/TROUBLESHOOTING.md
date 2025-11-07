# Troubleshooting Guide

## Lỗi: ERR_CONNECTION_REFUSED

### Nguyên nhân:
1. **Backend chưa chạy**
2. **URL sai format** (có dấu `//` thừa)
3. **Port sai** hoặc backend đang chạy ở port khác

### Cách sửa:

#### 1. Kiểm tra Backend có đang chạy không:

```bash
# Vào thư mục backend
cd back-end

# Chạy server
npm start
# hoặc
node server.js
# hoặc nếu có nodemon
npm run dev
```

**Kiểm tra:**
- Mở trình duyệt và truy cập: `http://localhost:5000/api-docs`
- Nếu thấy Swagger UI → Backend đang chạy OK
- Nếu không thấy → Backend chưa chạy hoặc port sai

#### 2. Kiểm tra Port:

Mặc định backend chạy ở port `5000`. Nếu bạn đã đổi port, cập nhật:

**File `.env` trong `front-end/`:**
```env
VITE_API_URL=http://localhost:YOUR_PORT
```

**Hoặc trong `vite.config.js`:**
```js
proxy: {
  "/api": {
    target: "http://localhost:YOUR_PORT",
    changeOrigin: true,
  },
}
```

#### 3. Kiểm tra URL trong Browser:

URL phải là:
```
http://localhost:5000/api/auth/google
```

**KHÔNG phải:**
```
localhost//api/auth/google  ❌ (thiếu http:// và có dấu // thừa)
http://localhost:5000//api/auth/google  ❌ (có dấu // thừa)
```

#### 4. Test Backend trực tiếp:

```bash
# Test backend bằng curl
curl http://localhost:5000/api-docs

# Hoặc mở browser
# http://localhost:5000/api-docs
```

#### 5. Kiểm tra CORS:

Đảm bảo backend có cấu hình CORS đúng:

```js
// back-end/server.js
app.use(
  cors({
    origin: true, // hoặc ["http://localhost:3000"]
    credentials: true,
  })
);
```

#### 6. Kiểm tra Google OAuth Config:

Đảm bảo file `.env` trong `back-end/` có:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Lỗi khác thường gặp:

### 1. "Network Error" hoặc CORS Error

**Nguyên nhân:** Backend không cho phép CORS từ frontend

**Cách sửa:**
- Kiểm tra CORS config trong `back-end/server.js`
- Đảm bảo `origin: true` hoặc `origin: ["http://localhost:3000"]`

### 2. "Token invalid" sau khi login Google

**Nguyên nhân:** JWT_SECRET không khớp

**Cách sửa:**
- Kiểm tra `JWT_ACCESS_SECRET` trong `.env` của backend
- Đảm bảo token được verify bằng đúng secret

### 3. Google OAuth redirect không hoạt động

**Nguyên nhân:** 
- Callback URL không khớp với Google Cloud Console
- Google Client ID/Secret sai

**Cách sửa:**
1. Vào Google Cloud Console
2. Kiểm tra "Authorized redirect URIs" phải là:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
3. Kiểm tra Client ID và Secret trong `.env`

### 4. Frontend không nhận được token từ Google callback

**Nguyên nhân:** Frontend callback route chưa được setup

**Cách sửa:**
- Đảm bảo có route `/auth/callback` trong `App.jsx`
- Kiểm tra `AuthCallback.jsx` có xử lý đúng không

## Checklist Debug:

- [ ] Backend đang chạy ở port 5000
- [ ] Có thể truy cập `http://localhost:5000/api-docs`
- [ ] Frontend đang chạy ở port 3000
- [ ] File `.env` trong frontend có `VITE_API_URL=http://localhost:5000`
- [ ] Google OAuth credentials đã được config
- [ ] CORS được enable trong backend
- [ ] URL không có dấu `//` thừa

## Test nhanh:

```bash
# Terminal 1: Chạy Backend
cd back-end
npm start

# Terminal 2: Chạy Frontend
cd front-end
npm run dev

# Browser: Truy cập
# http://localhost:3000/login
```

