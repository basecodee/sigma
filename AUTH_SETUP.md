# Authentication Setup - Payment Dashboard

Sistem autentikasi untuk Payment Dashboard menggunakan Supabase dengan role-based access control (admin dan user).

## Arsitektur

### Database Schema

Sistem menggunakan dua komponen utama:
1. **Supabase Auth** - Menangani autentikasi dan manajemen session
2. **user_profiles table** - Menyimpan informasi profil dan role pengguna

#### Struktur Table `user_profiles`

```sql
- id (uuid, primary key) - References auth.users(id)
- username (text, unique) - Username untuk login
- full_name (text) - Nama lengkap user
- role (text) - Role: 'admin' atau 'user'
- is_active (boolean) - Status aktif akun
- created_at (timestamptz) - Waktu pembuatan
- updated_at (timestamptz) - Waktu update terakhir
```

### Row Level Security (RLS)

Table `user_profiles` dilindungi dengan RLS policies:
- Users dapat membaca dan update profil mereka sendiri
- Admin dapat membaca, insert, update, dan delete semua profil
- Users tidak dapat mengubah role mereka sendiri

## Cara Membuat User Baru

### Metode 1: Menggunakan Edge Function (Recommended)

Edge function `register-user` tersedia untuk membuat user baru:

```bash
curl -X POST "YOUR_SUPABASE_URL/functions/v1/register-user" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "full_name": "Administrator",
    "role": "admin"
  }'
```

### Metode 2: Menggunakan Script Setup

Jalankan script yang tersedia untuk membuat initial users:

```bash
cd scripts
node setup-users.js
```

Script ini akan membuat 3 user default:
- **Admin**: username=`admin`, password=`admin123`
- **User1**: username=`user`, password=`user123`
- **User2**: username=`john`, password=`password123`

## Login

### Format Username

Sistem mendukung login dengan username. Secara internal, email akan di-generate dengan format:
```
{username}@payment-dashboard.local
```

Contoh:
- Username: `admin`
- Email internal: `admin@payment-dashboard.local`

### Login Flow

1. User memasukkan username dan password
2. Sistem mencari profil di table `user_profiles`
3. Jika ditemukan, sistem melakukan autentikasi dengan Supabase Auth
4. Session disimpan dan user diarahkan ke dashboard

## Role-Based Access

### Admin Role
- Akses penuh ke semua fitur
- Dapat mengelola user lain
- Dapat membaca dan update semua data

### User Role
- Akses terbatas ke fitur-fitur user
- Hanya dapat membaca dan update profil sendiri

## File Struktur

```
src/
├── config/
│   └── supabase.ts          # Supabase client configuration
├── services/
│   └── authService.ts       # Authentication service
├── contexts/
│   └── AuthContext.tsx      # Auth context provider
└── components/
    └── LoginForm.tsx        # Login form component

scripts/
└── setup-users.js          # Script untuk setup initial users

supabase/
└── functions/
    └── register-user/       # Edge function untuk registrasi user
        └── index.ts
```

## Environment Variables

Pastikan file `.env` memiliki konfigurasi berikut:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_anon_key
```

## Security Notes

1. Password minimal 6 karakter
2. Username harus unique
3. Session dikelola otomatis oleh Supabase
4. RLS policies memastikan data isolation
5. Email confirmation diset ke `true` secara default untuk edge function

## Testing

Untuk test login:
1. Jalankan setup script untuk membuat users
2. Buka aplikasi di browser
3. Login dengan credentials:
   - Username: `admin`
   - Password: `admin123`

## Troubleshooting

### "Username atau password salah"
- Pastikan user sudah dibuat dengan setup script
- Cek username dan password benar
- Pastikan user aktif (is_active = true)

### "Profil pengguna tidak ditemukan"
- User mungkin ada di auth.users tapi tidak di user_profiles
- Jalankan ulang setup script

### Session tidak persist
- Cek browser storage (localStorage)
- Pastikan cookies tidak diblock
- Cek Supabase auth configuration
