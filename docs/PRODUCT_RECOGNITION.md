# Product Recognition Feature

## Overview

The Product Recognition feature uses Google Vision API to analyze images of seafood products and provide intelligent suggestions for product creation and identification. This feature helps users identify seafood products and automatically suggests matching products from the store catalog.

## Features

### 🔍 **Image Analysis**
- **Label Detection**: Identifies objects, animals, and food items in images
- **Object Localization**: Detects and locates specific objects within images
- **Text Detection**: Extracts any text visible in the image
- **Seafood Detection**: Specifically identifies seafood-related content

### 🐟 **Seafood Recognition**
- Recognizes various types of fish (salmon, tuna, cod, etc.)
- Identifies shellfish (oysters, mussels, clams, scallops)
- Detects crustaceans (shrimp, crab, lobster)
- Categorizes other seafood products

### 🛒 **Product Suggestions**
- Matches detected items with existing products in the catalog
- Provides confidence scores for each suggestion
- Shows product details including name, price, and description
- Allows direct navigation to product pages

## How to Use

### For Customers

1. **Access Recognition Feature**
   - Navigate to the main menu
   - Click on "🔍 Recognize" in the navigation bar
   - Or visit `/recognize-product` directly

2. **Capture or Upload Image**
   - Click "Start Recognition" on the main page
   - Choose "Take Photo" to use your camera
   - Or click "Upload Image" to select from your device

3. **View Results**
   - Wait for the AI analysis to complete
   - Review detected labels and confidence scores
   - Browse suggested products
   - Click "View Product" to see product details

4. **View History**
   - Access "My Recognitions" to see past analyses
   - Review previous results and suggestions

### For Administrators

1. **Product Creation with Recognition**
   - Go to Admin Dashboard → Products → Create New Product
   - Click "🔍 Scan Product" button next to the Name field
   - Capture or upload an image of the product
   - The system will auto-fill form fields based on recognition results

2. **Recognition Management**
   - Access Admin Dashboard → Product Recognition
   - View all user recognition records
   - Monitor recognition accuracy and usage
   - Delete inappropriate or test records

## Configuration

### Google Vision API Setup

1. **Get API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Vision API
   - Create credentials (API Key)

2. **Configure Environment**
   ```bash
   # Add to your .env file
   GOOGLE_VISION_API_KEY=your_api_key_here
   ```

3. **Alternative: Service Account (Recommended for Production)**
   ```bash
   # For service account authentication
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
   ```

### Demo Mode

If no API key is configured, the system will use mock data for demonstration purposes. This allows you to test the feature without setting up Google Vision API.

## Technical Details

### Database Schema

The `product_recognitions` table stores:
- User ID (who performed the recognition)
- Image path (stored image location)
- Detected labels (JSON array)
- Detected objects (JSON array)
- Detected text (JSON array)
- Seafood detection flag
- Suggested products (JSON array)
- Confidence score
- Mock data flag
- Creation timestamp

### API Endpoints

- `GET /recognize-product` - Recognition form page
- `POST /recognize-product` - Process image recognition
- `GET /my-recognitions` - User's recognition history
- `GET /admin/product-recognition` - Admin management (admin only)
- `GET /admin/product-recognition/{id}` - View recognition details
- `DELETE /admin/product-recognition/{id}` - Delete recognition record

### File Storage

Images are stored in the `storage/app/public/recognitions/` directory and are accessible via the `/storage/recognitions/` URL path.

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Maximum file size: 5MB

## Recognition Accuracy

The system provides confidence scores for all detections:
- **80%+ confidence**: High accuracy (green indicators)
- **60-79% confidence**: Medium accuracy (yellow indicators)
- **Below 60%**: Low accuracy (red indicators)

## Privacy and Data

- Images are stored locally on your server
- Recognition data is associated with user accounts
- Users can only view their own recognition history
- Administrators can view all recognition records
- Images and data can be deleted by users or administrators

## Troubleshooting

### Common Issues

1. **"No API key configured" message**
   - Add `GOOGLE_VISION_API_KEY` to your `.env` file
   - Restart your application server

2. **"Failed to analyze image" error**
   - Check your internet connection
   - Verify API key is valid and has Vision API enabled
   - Ensure image file is not corrupted

3. **No seafood detected for fish images**
   - Try images with better lighting
   - Ensure the seafood is clearly visible
   - Avoid cluttered backgrounds

4. **Camera not working**
   - Ensure you're using HTTPS (required for camera access)
   - Grant camera permissions in your browser
   - Try a different browser if issues persist

### Performance Tips

- Use well-lit, clear images for better recognition
- Avoid images with multiple different items
- Ensure seafood products are the main focus of the image
- Use images with minimal background clutter

## Future Enhancements

- Integration with inventory management
- Batch image processing
- Custom model training for specific seafood types
- Mobile app integration
- Real-time camera recognition
- Nutritional information extraction
- Price estimation based on market data

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
