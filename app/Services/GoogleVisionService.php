<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;

class GoogleVisionService
{
    protected $apiKey;
    protected $baseUrl = 'https://vision.googleapis.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.google.vision_api_key', env('GOOGLE_VISION_API_KEY'));
    }

    /**
     * Analyze image using Google Vision API
     *
     * @param string $imagePath Path to the image file
     * @return array
     */
    public function analyzeImage(string $imagePath): array
    {
        try {
            // Check if API key is configured
            if (!$this->apiKey) {
                return $this->getMockAnalysis($imagePath);
            }

            // Read and encode the image
            $imageContent = Storage::get($imagePath);
            $base64Image = base64_encode($imageContent);

            // Prepare the request payload
            $payload = [
                'requests' => [
                    [
                        'image' => [
                            'content' => $base64Image
                        ],
                        'features' => [
                            [
                                'type' => 'LABEL_DETECTION',
                                'maxResults' => 10
                            ],
                            [
                                'type' => 'OBJECT_LOCALIZATION',
                                'maxResults' => 10
                            ],
                            [
                                'type' => 'TEXT_DETECTION',
                                'maxResults' => 5
                            ]
                        ]
                    ]
                ]
            ];

            // Make the API request
            $response = Http::timeout(30)
                ->post($this->baseUrl . '/images:annotate?key=' . $this->apiKey, $payload);

            if ($response->successful()) {
                $data = $response->json();
                return $this->processVisionResponse($data);
            } else {
                Log::error('Google Vision API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return $this->getMockAnalysis($imagePath);
            }

        } catch (\Exception $e) {
            Log::error('Google Vision Service Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->getMockAnalysis($imagePath);
        }
    }

    /**
     * Process Google Vision API response
     *
     * @param array $data
     * @return array
     */
    protected function processVisionResponse(array $data): array
    {
        $result = [
            'success' => true,
            'labels' => [],
            'objects' => [],
            'text' => [],
            'seafood_detected' => false,
            'suggested_products' => []
        ];

        if (isset($data['responses'][0])) {
            $response = $data['responses'][0];

            // Process labels
            if (isset($response['labelAnnotations'])) {
                foreach ($response['labelAnnotations'] as $label) {
                    $result['labels'][] = [
                        'description' => $label['description'],
                        'score' => $label['score'],
                        'confidence' => round($label['score'] * 100, 2)
                    ];
                }
            }

            // Process objects
            if (isset($response['localizedObjectAnnotations'])) {
                foreach ($response['localizedObjectAnnotations'] as $object) {
                    $result['objects'][] = [
                        'name' => $object['name'],
                        'score' => $object['score'],
                        'confidence' => round($object['score'] * 100, 2)
                    ];
                }
            }

            // Process text
            if (isset($response['textAnnotations'])) {
                foreach ($response['textAnnotations'] as $text) {
                    $result['text'][] = $text['description'];
                }
            }

            // Check for seafood-related content
            $result['seafood_detected'] = $this->detectSeafood($result['labels'], $result['objects']);
            
            // Get suggested products based on detected content
            $result['suggested_products'] = $this->getSuggestedProducts($result['labels'], $result['objects']);
        }

        return $result;
    }

    /**
     * Detect if the image contains seafood
     *
     * @param array $labels
     * @param array $objects
     * @return bool
     */
    protected function detectSeafood(array $labels, array $objects): bool
    {
        $seafoodKeywords = [
            'fish', 'seafood', 'salmon', 'tuna', 'cod', 'mackerel', 'sardine',
            'shrimp', 'prawn', 'lobster', 'crab', 'oyster', 'mussel', 'clam',
            'scallop', 'squid', 'octopus', 'cuttlefish', 'sea bass', 'snapper',
            'grouper', 'halibut', 'flounder', 'sole', 'anchovy', 'herring',
            'trout', 'catfish', 'tilapia', 'mahi mahi', 'swordfish', 'shark'
        ];

        // Check labels
        foreach ($labels as $label) {
            foreach ($seafoodKeywords as $keyword) {
                if (stripos($label['description'], $keyword) !== false) {
                    return true;
                }
            }
        }

        // Check objects
        foreach ($objects as $object) {
            foreach ($seafoodKeywords as $keyword) {
                if (stripos($object['name'], $keyword) !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get suggested products based on detected content
     *
     * @param array $labels
     * @param array $objects
     * @return array
     */
    protected function getSuggestedProducts(array $labels, array $objects): array
    {
        $detectedTerms = [];
        
        // Collect all detected terms
        foreach ($labels as $label) {
            if ($label['confidence'] > 50) { // Only consider high-confidence labels
                $detectedTerms[] = strtolower($label['description']);
            }
        }
        
        foreach ($objects as $object) {
            if ($object['confidence'] > 50) { // Only consider high-confidence objects
                $detectedTerms[] = strtolower($object['name']);
            }
        }

        // Search for matching products
        $suggestedProducts = [];
        if (!empty($detectedTerms)) {
            $products = Product::where('is_available', true)->get();
            
            foreach ($products as $product) {
                $productName = strtolower($product->name);
                $productDescription = strtolower($product->description ?? '');
                
                foreach ($detectedTerms as $term) {
                    if (stripos($productName, $term) !== false || 
                        stripos($productDescription, $term) !== false) {
                        $suggestedProducts[] = [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price' => $product->price,
                            'image_url' => $product->image_url,
                            'match_term' => $term,
                            'confidence' => 75 // Base confidence for name/description matches
                        ];
                        break; // Avoid duplicate entries for the same product
                    }
                }
            }
        }

        return array_slice($suggestedProducts, 0, 5); // Return top 5 suggestions
    }

    /**
     * Get mock analysis for testing when API key is not configured
     *
     * @param string $imagePath
     * @return array
     */
    protected function getMockAnalysis(string $imagePath): array
    {
        // Generate mock data based on common seafood types
        $mockSeafoodData = [
            [
                'labels' => [
                    ['description' => 'Fish', 'score' => 0.95, 'confidence' => 95],
                    ['description' => 'Seafood', 'score' => 0.89, 'confidence' => 89],
                    ['description' => 'Food', 'score' => 0.87, 'confidence' => 87],
                    ['description' => 'Fresh', 'score' => 0.82, 'confidence' => 82]
                ],
                'objects' => [
                    ['name' => 'Fish', 'score' => 0.91, 'confidence' => 91]
                ],
                'text' => [],
                'type' => 'fish'
            ],
            [
                'labels' => [
                    ['description' => 'Shrimp', 'score' => 0.93, 'confidence' => 93],
                    ['description' => 'Seafood', 'score' => 0.88, 'confidence' => 88],
                    ['description' => 'Crustacean', 'score' => 0.85, 'confidence' => 85]
                ],
                'objects' => [
                    ['name' => 'Shrimp', 'score' => 0.90, 'confidence' => 90]
                ],
                'text' => [],
                'type' => 'shrimp'
            ],
            [
                'labels' => [
                    ['description' => 'Crab', 'score' => 0.92, 'confidence' => 92],
                    ['description' => 'Seafood', 'score' => 0.86, 'confidence' => 86],
                    ['description' => 'Shellfish', 'score' => 0.84, 'confidence' => 84]
                ],
                'objects' => [
                    ['name' => 'Crab', 'score' => 0.89, 'confidence' => 89]
                ],
                'text' => [],
                'type' => 'crab'
            ]
        ];

        // Randomly select one of the mock data sets
        $selectedMock = $mockSeafoodData[array_rand($mockSeafoodData)];
        
        return [
            'success' => true,
            'labels' => $selectedMock['labels'],
            'objects' => $selectedMock['objects'],
            'text' => $selectedMock['text'],
            'seafood_detected' => true,
            'suggested_products' => $this->getSuggestedProducts($selectedMock['labels'], $selectedMock['objects']),
            'mock_data' => true
        ];
    }
}
