# SeaBasket Backend API

A dedicated Laravel backend API for the SeaBasket Online Seafood Store, designed to serve both web and mobile frontends.

## 🚀 Overview

This is a clean, API-focused Laravel backend that provides all the necessary endpoints for:
- **Web Frontend** (React/Next.js - separate repository)
- **Mobile App** (React Native/Flutter - separate repository)

## 📋 Features

### Core API Functionality
- **Authentication & Authorization** (Laravel Sanctum)
- **Product Management** (CRUD operations, categories, search)
- **Recipe Management** (CRUD operations, reviews, favorites)
- **Order Management** (cart, checkout, order tracking)
- **User Management** (profiles, addresses, preferences)
- **Admin Panel APIs** (dashboard stats, management endpoints)

### Advanced Features
- **AI-Powered Content Generation** (product descriptions, recipe details)
- **QR Code Label Generation** (for order verification)
- **Google OAuth Integration**
- **File Management** (image uploads, browsing)
- **Order Verification System**

## 🛠 Tech Stack

- **Framework**: Laravel 11.x
- **Database**: SQLite (development) / MySQL (production)
- **Authentication**: Laravel Sanctum
- **File Storage**: Laravel Storage
- **PDF Generation**: DomPDF
- **QR Codes**: SimpleSoftwareIO/simple-qrcode

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Quick Start Endpoints
- **Health Check**: `GET /api/v1/health`
- **API Documentation**: `GET /api/docs`
- **Products**: `GET /api/v1/products`
- **Recipes**: `GET /api/v1/recipes`

### Authentication
```bash
# Register
POST /api/v1/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}

# Login
POST /api/v1/login
{
  "email": "john@example.com",
  "password": "password"
}

# Google OAuth
POST /api/v1/auth/google
{
  "token": "google_oauth_token"
}
```

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- SQLite or MySQL

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd seabasket-backend-api
```

2. **Install dependencies**
```bash
composer install
```

3. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Database setup**
```bash
php artisan migrate
php artisan db:seed
```

5. **Storage setup**
```bash
php artisan storage:link
```

6. **Start the server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## 🔧 Configuration

### Environment Variables
```env
# App Configuration
APP_NAME="SeaBasket Backend API"
APP_ENV=local
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database.sqlite

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# CORS (for frontend apps)
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:19006
```

## 📱 Frontend Integration

### Web Frontend
- **Technology**: React/Next.js
- **Authentication**: Sanctum tokens
- **Base URL**: Configure in frontend environment

### Mobile App
- **Technology**: React Native/Flutter
- **Authentication**: Sanctum tokens
- **Base URL**: Configure in mobile app environment

## 🔐 Authentication Flow

1. **Registration/Login** → Receive Sanctum token
2. **Include token** in Authorization header: `Bearer {token}`
3. **Access protected endpoints** with valid token

## 📊 Admin Features

### Admin API Endpoints
- **Dashboard Stats**: `GET /admin/dashboard/stats`
- **Order Management**: `PUT /admin/orders/{id}/status`
- **Product Management**: Full CRUD via API
- **Label Generation**: `POST /admin/orders/{id}/labels`

## 🧪 Testing

```bash
# Run tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## 📦 Deployment

### Production Checklist
- [ ] Set `APP_ENV=production`
- [ ] Configure production database
- [ ] Set up proper CORS domains
- [ ] Configure file storage (S3, etc.)
- [ ] Set up SSL certificates
- [ ] Configure caching (Redis)
- [ ] Set up queue workers

## 🤝 Contributing

This is a dedicated backend API branch. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Branch**: `laravel-backend-api`
**Purpose**: Dedicated Laravel backend API for SeaBasket
**Serves**: Web frontend + Mobile app
**Status**: ✅ Ready for development
