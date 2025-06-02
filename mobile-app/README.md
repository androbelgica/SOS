# SeaBasket Mobile App

A modern React Native/Expo mobile application for the SeaBasket Online Seafood Store, providing a seamless shopping experience for iOS and Android devices.

## 📱 Overview

This is the dedicated mobile application for SeaBasket, built with React Native and Expo. It provides a native mobile experience for browsing seafood products, managing orders, and accessing recipes on both iOS and Android platforms.

## 🚀 Features

### 🛒 **E-commerce Functionality**
- **Product Catalog** with search, filtering, and categories
- **Shopping Cart** with real-time updates and persistence
- **Secure Checkout** process with multiple payment options
- **Order Management** and real-time tracking
- **QR Code Scanner** for order verification
- **Push Notifications** for order updates

### 🍽️ **Recipe Platform**
- **Recipe Collection** with detailed instructions and videos
- **Recipe Reviews** and ratings system
- **Favorite Recipes** management
- **Recipe Search** and categorization
- **Cooking Timer** and step-by-step guidance

### 👤 **User Experience**
- **Native Navigation** with smooth transitions
- **Biometric Authentication** (Face ID/Touch ID)
- **Google OAuth** integration
- **Offline Mode** for browsing cached content
- **Dark/Light Mode** with system preference detection
- **Multi-language Support** (English/Filipino)

### 📍 **Location Services**
- **Store Locator** with GPS integration
- **Delivery Tracking** with real-time updates
- **Location-based Recommendations**

## 🛠 Tech Stack

- **Framework**: React Native 0.74.5
- **Platform**: Expo SDK 51
- **Navigation**: React Navigation 6
- **UI Library**: React Native Paper 5
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Storage**: AsyncStorage + Expo SecureStore
- **Authentication**: Expo AuthSession
- **Camera**: Expo Camera (QR Scanner)
- **Notifications**: Expo Notifications
- **Maps**: Expo Location

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Running SeaBasket Backend API

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd seabasket-mobile-app
git checkout seabasket-mobile-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
# or
expo start
```

4. **Run on device/simulator**
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical device (scan QR code with Expo Go app)
npm run start
```

## 📱 Development Workflow

### **Development Server**
```bash
expo start              # Start Metro bundler
expo start --tunnel     # Start with tunnel (for physical devices)
expo start --dev-client # Start with development build
```

### **Platform-Specific Development**
```bash
expo start --ios       # iOS only
expo start --android   # Android only
expo start --web       # Web version
```

### **Building & Deployment**
```bash
# Build for app stores
eas build --platform ios
eas build --platform android
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🔧 Configuration

### Environment Setup

The app automatically detects the environment:
- **Development**: Uses `localhost:8000` for API
- **Production**: Uses production API URL

### API Configuration

Edit `src/config/api.js` to configure:
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://api.seabasket.com/api/v1',
    timeout: 15000,
  }
};
```

### Google OAuth Setup

Update `src/config/api.js` with your Google OAuth credentials:
```javascript
export const APP_CONFIG = {
  GOOGLE_CLIENT_ID: 'your_google_client_id',
  // ... other config
};
```

## 📁 Project Structure

```
seabasket-mobile-app/
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/             # Application screens
│   │   ├── auth/           # Authentication screens
│   │   ├── products/       # Product-related screens
│   │   ├── recipes/        # Recipe-related screens
│   │   └── orders/         # Order management screens
│   ├── navigation/          # Navigation configuration
│   ├── contexts/           # React contexts (Auth, Cart, Theme)
│   ├── services/           # API services and utilities
│   ├── config/             # App configuration
│   ├── utils/              # Helper functions
│   ├── hooks/              # Custom React hooks
│   └── theme/              # Theme and styling
├── assets/                 # Images, fonts, and static assets
├── app.json               # Expo configuration
├── App.js                 # Main application entry point
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🎯 Key Features Implementation

### **Authentication Flow**
- JWT token-based authentication
- Secure token storage with Expo SecureStore
- Automatic token refresh
- Biometric authentication support

### **Shopping Cart**
- Persistent cart across app sessions
- Real-time cart updates
- Optimistic UI updates
- Offline cart management

### **QR Code Scanner**
- Order verification via QR codes
- Product information scanning
- Camera permission handling
- Barcode format support

### **Push Notifications**
- Order status updates
- Promotional notifications
- Local notifications for reminders
- Background notification handling

## 🔐 Security Features

- **Secure Storage**: Sensitive data stored with encryption
- **API Security**: Bearer token authentication
- **Biometric Auth**: Face ID/Touch ID support
- **Certificate Pinning**: SSL certificate validation
- **Data Validation**: Input sanitization and validation

## 📱 Platform-Specific Features

### **iOS**
- Face ID/Touch ID authentication
- iOS-specific UI components
- App Store compliance
- iOS push notification certificates

### **Android**
- Fingerprint authentication
- Android-specific UI components
- Google Play Store compliance
- Firebase Cloud Messaging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### **Development Build**
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### **Production Build**
```bash
eas build --profile production --platform all
```

### **App Store Submission**
```bash
eas submit --platform ios
eas submit --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Branch**: `seabasket-mobile-app`
**Purpose**: React Native/Expo mobile app for SeaBasket
**Backend**: Consumes `laravel-backend-api`
**Platforms**: iOS, Android
**Status**: ✅ Ready for development
