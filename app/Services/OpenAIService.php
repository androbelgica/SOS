<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openai.com/v1';
    protected $model = 'gpt-3.5-turbo';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    /**
     * Generate product description and nutritional facts based on product name
     *
     * @param string $productName
     * @return array
     */
    public function generateProductInfo(string $productName): array
    {
        try {
            // For testing purposes, generate enhanced mock data based on product name
            $fishData = $this->getFishData($productName);

            return [
                'success' => true,
                'description' => $fishData['description'],
                'nutritional_facts' => $fishData['nutritional_facts']
            ];

            /*
            // Disable SSL verification in local environment to avoid certificate issues
            $http = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ]);

            // Disable SSL verification in development environments
            if (app()->environment('local')) {
                $http->withoutVerifying();
            }

            $response = $http->post($this->baseUrl . '/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful assistant that generates detailed product descriptions and nutritional facts for seafood products. Provide accurate and appealing information.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Generate a detailed product description and nutritional facts for the seafood product: {$productName}.
                        Format your response as JSON with two fields: 'description' and 'nutritional_facts'.
                        The description should be 2-3 sentences highlighting the product's qualities, taste, and potential uses.
                        The nutritional facts should include calories, protein, fats, and other relevant nutritional information per 100g serving."
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object']
            ]);
            */
        } catch (\Exception $e) {
            Log::error('OpenAI Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get detailed fish data based on product name
     *
     * @param string $productName
     * @return array
     */
    private function getFishData(string $productName): array
    {
        // Convert product name to lowercase for easier matching
        $lowerName = strtolower($productName);

        // Common fish types and their characteristics
        $fishTypes = [
            'salmon' => [
                'habitat' => 'saltwater and freshwater (anadromous)',
                'family' => 'Salmonidae',
                'origin' => 'North Atlantic and Pacific Oceans',
                'texture' => 'firm, fatty',
                'flavor' => 'rich, buttery',
                'cooking' => 'grilling, baking, smoking, raw (sushi)',
                'nutrition' => [
                    'calories' => 208,
                    'protein' => 20,
                    'fat' => 13,
                    'omega3' => 'high (2.3g)',
                    'vitamin_d' => 'high',
                    'vitamin_b12' => 'high'
                ]
            ],
            'tuna' => [
                'habitat' => 'saltwater (pelagic)',
                'family' => 'Scombridae',
                'origin' => 'worldwide tropical and subtropical oceans',
                'texture' => 'firm, meaty',
                'flavor' => 'mild to strong, depending on variety',
                'cooking' => 'grilling, searing, raw (sushi/sashimi)',
                'nutrition' => [
                    'calories' => 144,
                    'protein' => 30,
                    'fat' => 1,
                    'omega3' => 'moderate (0.7g)',
                    'vitamin_d' => 'moderate',
                    'vitamin_b12' => 'very high'
                ]
            ],
            'cod' => [
                'habitat' => 'saltwater (demersal)',
                'family' => 'Gadidae',
                'origin' => 'North Atlantic and Arctic Oceans',
                'texture' => 'flaky, lean',
                'flavor' => 'mild, slightly sweet',
                'cooking' => 'baking, frying, poaching',
                'nutrition' => [
                    'calories' => 82,
                    'protein' => 18,
                    'fat' => 0.7,
                    'omega3' => 'low (0.2g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'high'
                ]
            ],
            'tilapia' => [
                'habitat' => 'freshwater',
                'family' => 'Cichlidae',
                'origin' => 'Africa and Middle East (now farmed worldwide)',
                'texture' => 'firm, lean',
                'flavor' => 'mild, slightly sweet',
                'cooking' => 'baking, frying, grilling',
                'nutrition' => [
                    'calories' => 96,
                    'protein' => 20,
                    'fat' => 1.7,
                    'omega3' => 'very low (0.1g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'moderate'
                ]
            ],
            'bass' => [
                'habitat' => 'freshwater or saltwater (depending on species)',
                'family' => 'Moronidae (sea bass) or Centrarchidae (freshwater bass)',
                'origin' => 'varies by species, found in many regions worldwide',
                'texture' => 'firm, medium flake',
                'flavor' => 'mild to medium, slightly sweet',
                'cooking' => 'grilling, baking, pan-searing',
                'nutrition' => [
                    'calories' => 124,
                    'protein' => 24,
                    'fat' => 2.5,
                    'omega3' => 'moderate (0.8g)',
                    'vitamin_d' => 'moderate',
                    'vitamin_b12' => 'high'
                ]
            ],
            'trout' => [
                'habitat' => 'freshwater (some species are anadromous)',
                'family' => 'Salmonidae',
                'origin' => 'North America, Europe, and Asia',
                'texture' => 'medium-firm, flaky',
                'flavor' => 'mild, slightly nutty',
                'cooking' => 'grilling, baking, smoking, pan-frying',
                'nutrition' => [
                    'calories' => 141,
                    'protein' => 20,
                    'fat' => 6,
                    'omega3' => 'high (1.0g)',
                    'vitamin_d' => 'moderate',
                    'vitamin_b12' => 'high'
                ]
            ],
            'shrimp' => [
                'habitat' => 'saltwater or freshwater',
                'family' => 'Penaeidae (most commercial shrimp)',
                'origin' => 'worldwide tropical and temperate waters',
                'texture' => 'firm, tender',
                'flavor' => 'mild, slightly sweet',
                'cooking' => 'grilling, boiling, frying, steaming',
                'nutrition' => [
                    'calories' => 99,
                    'protein' => 24,
                    'fat' => 0.3,
                    'omega3' => 'low (0.3g)',
                    'vitamin_d' => 'very low',
                    'vitamin_b12' => 'moderate'
                ]
            ],
            'crab' => [
                'habitat' => 'saltwater or brackish water',
                'family' => 'varies by species (commonly Portunidae for blue crab)',
                'origin' => 'worldwide coastal waters',
                'texture' => 'firm, flaky',
                'flavor' => 'sweet, delicate',
                'cooking' => 'steaming, boiling, grilling',
                'nutrition' => [
                    'calories' => 83,
                    'protein' => 17,
                    'fat' => 1.5,
                    'omega3' => 'moderate (0.4g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'very high'
                ]
            ],
            'lobster' => [
                'habitat' => 'saltwater',
                'family' => 'Nephropidae',
                'origin' => 'cold waters of the North Atlantic and Pacific',
                'texture' => 'firm, tender',
                'flavor' => 'sweet, rich',
                'cooking' => 'steaming, boiling, grilling',
                'nutrition' => [
                    'calories' => 89,
                    'protein' => 19,
                    'fat' => 0.9,
                    'omega3' => 'low (0.2g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'high'
                ]
            ],
            'oyster' => [
                'habitat' => 'saltwater or brackish water',
                'family' => 'Ostreidae',
                'origin' => 'worldwide coastal waters',
                'texture' => 'soft, tender',
                'flavor' => 'briny, mineral-rich',
                'cooking' => 'raw, grilling, frying, steaming',
                'nutrition' => [
                    'calories' => 68,
                    'protein' => 8,
                    'fat' => 3,
                    'omega3' => 'moderate (0.5g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'extremely high'
                ]
            ],
            'scallop' => [
                'habitat' => 'saltwater',
                'family' => 'Pectinidae',
                'origin' => 'worldwide temperate and tropical waters',
                'texture' => 'firm, tender',
                'flavor' => 'sweet, delicate',
                'cooking' => 'searing, grilling, baking',
                'nutrition' => [
                    'calories' => 88,
                    'protein' => 16,
                    'fat' => 0.8,
                    'omega3' => 'low (0.3g)',
                    'vitamin_d' => 'low',
                    'vitamin_b12' => 'high'
                ]
            ]
        ];

        // Default fish data if no specific match is found
        $defaultFishData = [
            'habitat' => 'saltwater',
            'family' => 'varies by species',
            'origin' => 'worldwide oceans and seas',
            'texture' => 'firm, flaky',
            'flavor' => 'mild to medium, slightly sweet',
            'cooking' => 'grilling, baking, frying',
            'nutrition' => [
                'calories' => 120,
                'protein' => 20,
                'fat' => 4,
                'omega3' => 'moderate (0.5g)',
                'vitamin_d' => 'moderate',
                'vitamin_b12' => 'high'
            ]
        ];

        // Find matching fish type
        $matchedFishData = $defaultFishData;
        foreach ($fishTypes as $fishType => $data) {
            if (strpos($lowerName, $fishType) !== false) {
                $matchedFishData = $data;
                break;
            }
        }

        // Generate description
        $description = "The {$productName} is a premium {$matchedFishData['habitat']} species from the {$matchedFishData['family']} family, primarily found in {$matchedFishData['origin']}. It features a {$matchedFishData['texture']} texture with a {$matchedFishData['flavor']} flavor profile. This seafood delicacy is excellent for {$matchedFishData['cooking']} and pairs wonderfully with complementary herbs and seasonings.";

        // Generate nutritional facts
        $nutrition = $matchedFishData['nutrition'];
        $nutritionalFacts = "Nutritional Facts (per 100g serving):\n";
        $nutritionalFacts .= "Calories: {$nutrition['calories']}\n";
        $nutritionalFacts .= "Protein: {$nutrition['protein']}g\n";
        $nutritionalFacts .= "Total Fat: {$nutrition['fat']}g\n";
        $nutritionalFacts .= "- Omega-3 Fatty Acids: {$nutrition['omega3']}\n";
        $nutritionalFacts .= "Cholesterol: " . ($nutrition['fat'] * 15) . "mg\n";
        $nutritionalFacts .= "Sodium: " . (50 + rand(0, 50)) . "mg\n";
        $nutritionalFacts .= "Potassium: " . (200 + rand(0, 200)) . "mg\n";
        $nutritionalFacts .= "Vitamin D: " . ($nutrition['vitamin_d'] === 'high' ? '15%' : ($nutrition['vitamin_d'] === 'moderate' ? '10%' : '5%')) . " DV\n";
        $nutritionalFacts .= "Vitamin B12: " . ($nutrition['vitamin_b12'] === 'very high' ? '80%' : ($nutrition['vitamin_b12'] === 'high' ? '50%' : '25%')) . " DV\n";

        return [
            'description' => $description,
            'nutritional_facts' => $nutritionalFacts
        ];
    }
}
