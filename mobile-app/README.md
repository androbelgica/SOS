# Seafood Store Mobile App

A React Native mobile application for a seafood online store that connects to a Laravel 12 backend API.

## Features

- User authentication (login, register, forgot password)
- Product browsing and search
- Shopping cart functionality
- Order management
- Recipe browsing and interaction
- Offline support
- Push notifications (coming soon)

## Tech Stack

- **React Native**: Cross-platform mobile framework
- **Redux Toolkit**: State management
- **React Navigation**: Navigation library
- **Axios**: API requests
- **React Native Paper**: UI components
- **AsyncStorage**: Local storage
- **React Hook Form**: Form handling
- **React Native Fast Image**: Optimized image loading

## Project Structure

```
src/
├── api/                  # API service layer
│   ├── apiClient.js      # Axios instance with interceptors
│   ├── authService.js    # Authentication API calls
│   ├── productService.js # Product-related API calls
│   └── ...
├── assets/               # Images, fonts, etc.
├── components/           # Reusable UI components
│   ├── common/           # Buttons, inputs, loaders, etc.
│   ├── products/         # Product-specific components
│   └── ...
├── navigation/           # Navigation configuration
│   ├── AppNavigator.js   # Main navigation container
├── screens/              # App screens
│   ├── auth/             # Login, Register, etc.
│   ├── products/         # Product listing, details
│   ├── cart/             # Cart and checkout
│   └── ...
├── store/                # Redux store
│   ├── slices/           # Redux slices
│   └── index.js          # Store configuration
├── utils/                # Helper functions
└── App.js                # Root component
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
2. Navigate to the mobile directory:
   ```
   cd mobile
   ```
3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```
4. Update the API URL in `src/api/apiClient.js` to point to your Laravel backend

### Running the App

#### Android

```
npm run android
# or
yarn android
```

#### iOS

```
npm run ios
# or
yarn ios
```

## API Integration

The app connects to a Laravel 12 backend API using Sanctum for authentication. The API services are organized in the `src/api` directory:

- `apiClient.js`: Base Axios configuration with interceptors
- `authService.js`: Authentication-related API calls
- `productService.js`: Product-related API calls
- `cartService.js`: Shopping cart API calls
- `recipeService.js`: Recipe-related API calls
- `orderService.js`: Order management API calls

## State Management

Redux Toolkit is used for state management. The store is organized into slices:

- `authSlice.js`: Authentication state
- `productSlice.js`: Products state
- `cartSlice.js`: Shopping cart state
- `recipeSlice.js`: Recipes state
- `orderSlice.js`: Orders state

## Offline Support

The app includes offline support through:

- Local caching of products and recipes
- Offline cart management
- Automatic synchronization when back online

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
