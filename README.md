# SeaBasket Web Frontend

A modern React web application for the SeaBasket Online Seafood Store, built with React, Inertia.js, and Tailwind CSS.

## 🚀 Overview

This is the dedicated web frontend for SeaBasket, designed to provide a seamless shopping experience for seafood products and recipes. It consumes the Laravel backend API to deliver a fast, responsive, and user-friendly interface.

## 📋 Features

### 🛒 **E-commerce Functionality**
- **Product Catalog** with search, filtering, and categories
- **Shopping Cart** with real-time updates
- **Secure Checkout** process
- **Order Management** and tracking
- **User Accounts** with order history

### 🍽️ **Recipe Platform**
- **Recipe Collection** with detailed instructions
- **Recipe Reviews** and ratings
- **Favorite Recipes** management
- **Recipe Search** and categorization

### 👤 **User Experience**
- **Responsive Design** for all devices
- **Dark/Light Mode** toggle
- **Google OAuth** authentication
- **Real-time Notifications**
- **Progressive Web App** capabilities

### 🎨 **Modern UI/UX**
- **Tailwind CSS** for styling
- **Headless UI** components
- **Hero Icons** for consistent iconography
- **Smooth Animations** and transitions

## 🛠 Tech Stack

- **Frontend Framework**: React 18.2+
- **Build Tool**: Vite 6.2+
- **Styling**: Tailwind CSS 3.2+
- **UI Components**: Headless UI 2.0+
- **Icons**: Hero Icons 2.2+
- **HTTP Client**: Axios 1.8+
- **Notifications**: React Hot Toast 2.5+
- **Laravel Integration**: Inertia.js 2.0+

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Running SeaBasket Backend API (see `laravel-backend-api` branch)

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd seabasket-web-frontend
git checkout seabasket-web-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.frontend .env
# Edit .env with your backend API URL
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.frontend`:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api/v1

# Application Settings
VITE_APP_NAME="SeaBasket Online Seafood Store"
VITE_APP_URL=http://localhost:3000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_WISHLIST=true
```

### Backend API Connection

The frontend is configured to connect to the Laravel backend API. Make sure:

1. **Backend API is running** on `http://localhost:8000`
2. **CORS is configured** in the backend for `localhost:3000`
3. **API endpoints** are accessible

## 📁 Project Structure

```
seabasket-web-frontend/
├── public/                 # Static assets
│   ├── images/            # Product and recipe images
│   └── fonts/             # Custom fonts
├── resources/
│   ├── js/                # React application
│   │   ├── Components/    # Reusable UI components
│   │   ├── Layouts/       # Page layouts
│   │   ├── Pages/         # Application pages
│   │   ├── Contexts/      # React contexts
│   │   ├── Utils/         # Utility functions
│   │   ├── config/        # Configuration files
│   │   ├── services/      # API services
│   │   └── app.jsx        # Main application entry
│   ├── css/               # Stylesheets
│   └── views/             # Blade templates
├── .env.frontend          # Environment template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests (when implemented)
```

## 🔗 API Integration

The frontend uses a centralized API service (`resources/js/services/apiService.js`) to communicate with the backend:

```javascript
import apiService from '@/services/apiService';

// Example usage
const products = await apiService.getProducts();
const user = await apiService.login(credentials);
```

### Key API Features:
- **Automatic token management**
- **Request/response interceptors**
- **Error handling**
- **Loading states**

## 🎨 Styling & Theming

### Tailwind CSS Configuration
- **Custom color palette** for SeaBasket branding
- **Responsive breakpoints** for all devices
- **Dark mode support** with system preference detection
- **Custom components** and utilities

### Component Library
- **Consistent design system**
- **Reusable components**
- **Accessibility-first approach**
- **Mobile-responsive design**

## 🔐 Authentication

### Supported Methods:
- **Email/Password** authentication
- **Google OAuth** integration
- **Remember me** functionality
- **Password reset** flow

### Token Management:
- **Automatic token storage**
- **Token refresh handling**
- **Secure logout**
- **Session persistence**

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1440px+

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Checklist
- [ ] Update environment variables for production
- [ ] Configure backend API URL
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Set up error monitoring
- [ ] Configure analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Branch**: `seabasket-web-frontend`
**Purpose**: React web frontend for SeaBasket
**Backend**: Consumes `laravel-backend-api`
**Status**: ✅ Ready for development
