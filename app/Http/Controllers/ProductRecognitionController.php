<?php

namespace App\Http\Controllers;

use App\Models\ProductRecognition;
use App\Services\GoogleVisionService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductRecognitionController extends Controller
{
    protected $visionService;
    protected $fileUploadService;

    public function __construct(GoogleVisionService $visionService, FileUploadService $fileUploadService)
    {
        $this->visionService = $visionService;
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Display the product recognition page
     */
    public function index()
    {
        $recognitions = ProductRecognition::with('user')
            ->when(Auth::user()->role !== 'admin', function ($query) {
                return $query->where('user_id', Auth::id());
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('ProductRecognition/Index', [
            'recognitions' => $recognitions,
            'canViewAll' => Auth::user()->role === 'admin'
        ]);
    }

    /**
     * Show the recognition form
     */
    public function create()
    {
        return Inertia::render('ProductRecognition/Create');
    }

    /**
     * Process image recognition
     */
    public function recognize(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
        ]);

        try {
            // Upload the image
            $file = $request->file('image');
            $imagePath = $this->fileUploadService->uploadImage($file, 'recognitions', 'recognition_' . time());

            Log::info('Image uploaded for recognition', ['path' => $imagePath]);

            // Analyze the image
            $analysis = $this->visionService->analyzeImage($imagePath);

            Log::info('Image analysis completed', ['analysis' => $analysis]);

            // Calculate overall confidence score
            $confidenceScore = $this->calculateOverallConfidence($analysis);

            // Save recognition record
            $recognition = ProductRecognition::create([
                'user_id' => Auth::id(),
                'image_path' => $imagePath,
                'detected_labels' => $analysis['labels'] ?? [],
                'detected_objects' => $analysis['objects'] ?? [],
                'detected_text' => $analysis['text'] ?? [],
                'seafood_detected' => $analysis['seafood_detected'] ?? false,
                'suggested_products' => $analysis['suggested_products'] ?? [],
                'confidence_score' => $confidenceScore,
                'is_mock_data' => $analysis['mock_data'] ?? false
            ]);

            // Return with recognition result for Inertia
            return back()->with('recognition_result', [
                'success' => true,
                'recognition' => $recognition->load('user'),
                'analysis' => $analysis,
                'message' => 'Image analyzed successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('Product recognition error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to analyze image: ' . $e->getMessage()]);
        }
    }

    /**
     * Show a specific recognition
     */
    public function show(ProductRecognition $recognition)
    {
        // Check if user can view this recognition
        if (Auth::user()->role !== 'admin' && $recognition->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to recognition record.');
        }

        $recognition->load('user');

        return Inertia::render('ProductRecognition/Show', [
            'recognition' => $recognition
        ]);
    }

    /**
     * Delete a recognition record
     */
    public function destroy(ProductRecognition $recognition)
    {
        // Check if user can delete this recognition
        if (Auth::user()->role !== 'admin' && $recognition->user_id !== Auth::id()) {
            abort(403, 'Unauthorized to delete this recognition record.');
        }

        try {
            // Delete the image file if it exists
            if ($recognition->image_path) {
                $this->fileUploadService->deleteFile($recognition->image_path);
            }

            $recognition->delete();

            return redirect()->route(Auth::user()->role === 'admin' ? 'admin.product-recognition.index' : 'my-recognitions.index')
                ->with('success', 'Recognition record deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to delete recognition', [
                'recognition_id' => $recognition->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to delete recognition record.']);
        }
    }

    /**
     * Calculate overall confidence score from analysis results
     */
    protected function calculateOverallConfidence(array $analysis): float
    {
        $scores = [];

        // Collect confidence scores from labels
        if (!empty($analysis['labels'])) {
            foreach ($analysis['labels'] as $label) {
                $scores[] = $label['confidence'] ?? 0;
            }
        }

        // Collect confidence scores from objects
        if (!empty($analysis['objects'])) {
            foreach ($analysis['objects'] as $object) {
                $scores[] = $object['confidence'] ?? 0;
            }
        }

        // Return average confidence or 0 if no scores
        return !empty($scores) ? round(array_sum($scores) / count($scores), 2) : 0.0;
    }
}
