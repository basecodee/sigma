# Payment Dashboard System

Sistem dashboard untuk monitoring dan tracking pembayaran bulanan dengan struktur full-stack menggunakan React frontend dan PHP backend.

## 🚀 Fitur Utama

- **Dashboard Interaktif**: Interface modern dengan React + Vite + TailwindCSS
- **Tracking Pembayaran**: Monitoring pembayaran bulanan Unit Kerja dan EDC & CCTV
- **Visualisasi Data**: Grafik interaktif menggunakan Chart.js
- **Dark Mode**: Dukungan tema gelap untuk kenyamanan pengguna
- **Responsive Design**: Optimized untuk desktop dan mobile
- **REST API**: Backend PHP dengan MySQL database

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite untuk build tool
- TailwindCSS untuk styling
- Chart.js untuk visualisasi data
- React Router untuk navigasi
- Lucide React untuk icons

### Backend
- **Supabase** - PostgreSQL database & Authentication
- **Edge Functions** - User registration & management
- **Row Level Security** - Data protection
- PHP 8+ (Reference legacy backend)
- REST API architecture

## 📁 Struktur Project

```
/
├── src/
│   ├── components/          # Reusable components
│   │   ├── PaymentTable.tsx
│   │   ├── MonthlySummary.tsx
│   │   ├── ChartSummary.tsx
│   │   ├── AddDataModal.tsx
│   │   └── SearchFilter.tsx
│   ├── pages/              # Page components
│   │   ├── UnitKerjaPage.tsx
│   │   ├── EdcPage.tsx
│   │   └── RekapPage.tsx
│   ├── data/               # Mock data & types
│   │   └── mockData.ts
│   └── App.tsx
├── backend/                # PHP Backend (Reference)
│   ├── config/
│   │   └── db.php
│   ├── api/
│   │   ├── unitkerja.php
│   │   ├── edc.php
│   │   └── monthly.php
│   └── index.php
└── database/
    └── schema.sql
```

## 💡 Komponen Utama

### PaymentTable
- Tabel interaktif dengan checkbox untuk setiap bulan
- Auto-calculation untuk total pembayaran
- Support untuk kedua jenis data (Unit Kerja & EDC)

### MonthlySummary
- Ringkasan pendapatan per bulan
- Total gabungan dari semua sumber pendapatan
- Display dalam format mata uang Indonesia

### ChartSummary
- Visualisasi data dengan Chart.js
- Pilihan tampilan Bar Chart atau Line Chart
- Insights pendapatan per kategori

## 🗄️ Database Schema

### Tabel `unit_kerja`
```sql
- id (Primary Key)
- nama_lokasi (VARCHAR)
- jan, feb, mar, ... des (BOOLEAN)
- tarif (INT, default: 100000)
- total (INT, calculated)
```

### Tabel `edc_cctv`
```sql
- id (Primary Key)
- nama_lokasi (VARCHAR)
- jenis (ENUM: 'EDC', 'EDC + CCTV')
- tagihan (INT)
- jan, feb, mar, ... des (BOOLEAN)
- total (INT, calculated)
```

## 🔄 API Endpoints

- `GET/POST/PUT/DELETE /api/unitkerja` - CRUD untuk Unit Kerja
- `GET/POST/PUT/DELETE /api/edc` - CRUD untuk EDC & CCTV
- `GET /api/monthly` - Rekap bulanan gabungan

## 🎨 Design Features

- Modern card-based layout
- Smooth animations dan hover effects
- Consistent color scheme dengan dark mode support
- Professional Indonesian currency formatting
- Interactive tooltips dan notifications

## 📱 Responsive Design

- Mobile-first approach
- Adaptive navigation untuk layar kecil
- Optimized table scrolling
- Touch-friendly interface elements

## 🚀 Getting Started

1. Clone repository ini
2. Setup environment variables:
   - Copy `.env.example` to `.env` dan sesuaikan konfigurasi Supabase
   - Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_SUPABASE_ANON_KEY` sudah diisi
3. Install dependencies: `npm install`
4. Setup database:
   - Database schema sudah otomatis dibuat di Supabase
   - Lihat migrations di Supabase Dashboard
5. Buat initial users:
   - Jalankan: `node scripts/setup-users.js`
6. Jalankan development server: `npm run dev`
7. Login dengan credentials: username `admin`, password `admin123`

## ⚙️ Environment Configuration

### Frontend (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_anon_key

# Legacy API Configuration (Optional)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_BACKEND_URL=http://localhost:8080
VITE_ENABLE_MOCK_DATA=true
```

### Backend (backend/.env)
```env
DB_HOST=localhost
DB_NAME=payment_dashboard
DB_USER=root
DB_PASS=
CORS_ORIGIN=http://localhost:5173
```

## 🔄 Development vs Production

### **Production Ready**:
- Connects to real PHP backend
- Full database integration
- Real-time data persistence
- Complete inventory management
- User authentication system

## 📁 **Configuration Files**
- `.env` & `.env.example`: Frontend configuration

## 🔄 API Integration

- **Development Mode**: Uses mock data when `VITE_ENABLE_MOCK_DATA=true`
- **Production Mode**: Connects to PHP backend API
- **Auto-switching**: Seamlessly switches between mock and real data
- **Error Handling**: Comprehensive error handling and loading states
## 📱 Mobile App Development

### Build APK Android
```bash
# Build dan sync ke Android
npm run android

# Atau step by step:
npm run build
npx cap sync android
npx cap open android
```

### Build iOS App
```bash
# Build dan sync ke iOS
npm run ios

# Atau step by step:
npm run build
npx cap sync ios
npx cap open ios
```

### Mobile Commands
- `npm run mobile:build` - Build web dan sync ke mobile platforms
- `npm run mobile:run:android` - Run di Android device/emulator
- `npm run mobile:run:ios` - Run di iOS device/simulator

## 🔐 Authentication

Sistem menggunakan **Supabase Authentication** dengan role-based access control (RBAC):

### Setup Autentikasi

1. **Buat Initial Users**:
   ```bash
   node scripts/setup-users.js
   ```

2. **Login Credentials Default**:
   - **Admin**: username=`admin`, password=`admin123`
   - **User1**: username=`user`, password=`user123`
   - **User2**: username=`john`, password=`password123`

### Fitur Authentication

- Role-based access (Admin & User)
- Secure session management dengan Supabase
- Row Level Security (RLS) untuk data protection
- Username-based login dengan email internal mapping
- Auto-logout dan session persistence

Untuk dokumentasi lengkap, lihat [AUTH_SETUP.md](./AUTH_SETUP.md)

## 📱 Mobile Features

- **Splash Screen**: Logo dan branding saat app startup
- **Status Bar**: Styling konsisten dengan tema app
- **Responsive Design**: Optimized untuk mobile dan tablet
- **Native Performance**: Menggunakan Capacitor untuk performa native
- **Cross Platform**: Support Android dan iOS

## 📊 Logika Perhitungan

- **Unit Kerja**: Total = Jumlah bulan tercentang × Rp 100.000
- **EDC Only**: Total = Jumlah bulan tercentang × Rp 35.000
- **EDC + CCTV**: Total = Jumlah bulan tercentang × Rp 135.000

## 🔧 Development Notes

- Menggunakan mock data untuk demo frontend
- PHP backend tersedia sebagai reference implementation
- Database schema sudah termasuk sample data
- Semua API endpoint mendukung CORS

---

**Note**: Frontend ini menggunakan mock data untuk demonstration. Untuk production, ganti dengan API calls yang sebenarnya ke PHP backend.