<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected $apiKey;
    protected $baseUrl = 'https://openrouter.ai/api/v1';
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
            $http = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://127.0.0.1', // Replace with your actual domain
            ]);

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
                        'content' => "Generate a detailed product description and nutritional facts for the seafood product: {$productName}. Format your response as JSON with two fields: 'description' and 'nutritional_facts'."
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object']
            ]);

            $data = $response->json();

            $content = $data['choices'][0]['message']['content'] ?? '';

            // Decode AI JSON string
            $parsed = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => false,
                    'message' => 'Invalid JSON returned by the AI model.'
                ];
            }

            // If nutritional_facts is an object, convert it to readable string
            $nutritionalFacts = $parsed['nutritional_facts'] ?? '';

            if (is_array($nutritionalFacts)) {
                $nutritionalFacts = $this->formatNutritionalFacts($nutritionalFacts);
            }

            return [
                'success' => true,
                'description' => $parsed['description'] ?? '',
                'nutritional_facts' => $nutritionalFacts
            ];
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
     * Converts an array of nutritional facts to a human-readable string
     */
    private function formatNutritionalFacts(array $facts): string
    {
        $map = [
            'calories' => 'Calories',
            'protein' => 'Protein',
            'total_fat' => 'Fat',
            'saturated_fat' => 'Saturated Fat',
            'cholesterol' => 'Cholesterol',
            'sodium' => 'Sodium',
            'carbohydrates' => 'Carbohydrates',
            'fiber' => 'Fiber',
            'sugars' => 'Sugars',
            'serving_size' => 'Serving Size',
        ];

        $units = [
            'calories' => 'kcal',
            'protein' => 'g',
            'total_fat' => 'g',
            'saturated_fat' => 'g',
            'cholesterol' => 'mg',
            'sodium' => 'mg',
            'carbohydrates' => 'g',
            'fiber' => 'g',
            'sugars' => 'g',
        ];

        $formatted = [];

        foreach ($map as $key => $label) {
            if (isset($facts[$key])) {
                $value = $facts[$key];
                $unit = $units[$key] ?? '';
                $formatted[] = "{$label}: {$value} {$unit}";
            }
        }

        return implode(', ', $formatted);
    }


    /**
     * Generate recipe description based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    public function generateRecipeDescription(string $recipeTitle): array
    {
        try {
            // For testing purposes, generate mock data based on recipe title
            $recipeData = $this->getRecipeData($recipeTitle);

            return [
                'success' => true,
                'description' => $recipeData['description']
            ];
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
     * Generate recipe ingredients based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    public function generateRecipeIngredients(string $recipeTitle): array
    {
        try {
            // For testing purposes, generate mock data based on recipe title
            $ingredients = $this->generateIngredientsFromRecipeType($recipeTitle);

            return [
                'success' => true,
                'ingredients' => $ingredients
            ];
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
     * Generate recipe instructions based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    public function generateRecipeInstructions(string $recipeTitle): array
    {
        try {
            // For testing purposes, generate mock data based on recipe title
            $instructions = $this->generateInstructionsFromRecipeType($recipeTitle);

            return [
                'success' => true,
                'instructions' => $instructions
            ];
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

    /**
     * Get recipe data based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    private function getRecipeData(string $recipeTitle): array
    {
        // Convert recipe title to lowercase for easier matching
        $lowerTitle = strtolower($recipeTitle);

        // Common recipe types and their characteristics
        $recipeTypes = [
            'fish' => [
                'cuisine' => 'seafood',
                'cooking_method' => 'baking, grilling, or pan-searing',
                'flavor_profile' => 'light and fresh',
                'key_ingredients' => 'fresh fish, lemon, herbs',
                'health_benefits' => 'high in protein and omega-3 fatty acids',
                'serving_suggestion' => 'with steamed vegetables or a light salad'
            ],
            'salmon' => [
                'cuisine' => 'seafood',
                'cooking_method' => 'baking, grilling, or pan-searing',
                'flavor_profile' => 'rich and buttery',
                'key_ingredients' => 'fresh salmon, lemon, dill, garlic',
                'health_benefits' => 'high in omega-3 fatty acids and protein',
                'serving_suggestion' => 'with asparagus, roasted potatoes, or a fresh salad'
            ],
            'tuna' => [
                'cuisine' => 'seafood',
                'cooking_method' => 'grilling, searing, or serving raw in sushi',
                'flavor_profile' => 'meaty and savory',
                'key_ingredients' => 'fresh tuna, soy sauce, sesame oil, ginger',
                'health_benefits' => 'high in protein and B vitamins',
                'serving_suggestion' => 'with Asian-inspired sides or in a salad'
            ],
            'shrimp' => [
                'cuisine' => 'seafood',
                'cooking_method' => 'sautéing, grilling, or boiling',
                'flavor_profile' => 'sweet and delicate',
                'key_ingredients' => 'fresh shrimp, garlic, butter, lemon',
                'health_benefits' => 'high in protein and low in calories',
                'serving_suggestion' => 'over pasta, rice, or in tacos'
            ],
            'pasta' => [
                'cuisine' => 'Italian',
                'cooking_method' => 'boiling and tossing with sauce',
                'flavor_profile' => 'comforting and satisfying',
                'key_ingredients' => 'pasta, olive oil, garlic, herbs',
                'health_benefits' => 'provides carbohydrates for energy',
                'serving_suggestion' => 'with a side salad and garlic bread'
            ],
            'curry' => [
                'cuisine' => 'Indian or Thai',
                'cooking_method' => 'simmering in a flavorful sauce',
                'flavor_profile' => 'aromatic and spicy',
                'key_ingredients' => 'curry paste or powder, coconut milk, vegetables, protein',
                'health_benefits' => 'anti-inflammatory properties from turmeric and other spices',
                'serving_suggestion' => 'with rice or naan bread'
            ],
            'stir fry' => [
                'cuisine' => 'Asian',
                'cooking_method' => 'quick cooking over high heat',
                'flavor_profile' => 'savory and umami-rich',
                'key_ingredients' => 'vegetables, protein, soy sauce, garlic, ginger',
                'health_benefits' => 'retains nutrients due to quick cooking method',
                'serving_suggestion' => 'over rice or noodles'
            ],
            'soup' => [
                'cuisine' => 'various',
                'cooking_method' => 'simmering ingredients in broth',
                'flavor_profile' => 'comforting and nourishing',
                'key_ingredients' => 'broth, vegetables, protein, herbs',
                'health_benefits' => 'hydrating and can be nutrient-dense',
                'serving_suggestion' => 'with crusty bread or a sandwich'
            ],
            'salad' => [
                'cuisine' => 'various',
                'cooking_method' => 'tossing fresh ingredients together',
                'flavor_profile' => 'fresh and vibrant',
                'key_ingredients' => 'fresh vegetables, greens, dressing',
                'health_benefits' => 'high in vitamins, minerals, and fiber',
                'serving_suggestion' => 'as a side dish or main course with protein'
            ],
            'grill' => [
                'cuisine' => 'various',
                'cooking_method' => 'cooking over direct heat',
                'flavor_profile' => 'smoky and caramelized',
                'key_ingredients' => 'meat, seafood, or vegetables, marinades',
                'health_benefits' => 'lower in fat as excess drips away',
                'serving_suggestion' => 'with grilled vegetables and a starch'
            ],
            'bake' => [
                'cuisine' => 'various',
                'cooking_method' => 'cooking in an oven',
                'flavor_profile' => 'rich and developed',
                'key_ingredients' => 'varies widely by recipe',
                'health_benefits' => 'can be a healthier cooking method using less oil',
                'serving_suggestion' => 'varies by dish'
            ],
            'dessert' => [
                'cuisine' => 'various',
                'cooking_method' => 'baking, chilling, or freezing',
                'flavor_profile' => 'sweet and indulgent',
                'key_ingredients' => 'sugar, flour, butter, eggs',
                'health_benefits' => 'provides pleasure and satisfaction in moderation',
                'serving_suggestion' => 'after a meal or as a special treat'
            ]
        ];

        // Default recipe data if no specific match is found
        $defaultRecipeData = [
            'cuisine' => 'international',
            'cooking_method' => 'various techniques',
            'flavor_profile' => 'delicious and satisfying',
            'key_ingredients' => 'fresh, quality ingredients',
            'health_benefits' => 'balanced nutrition when part of a varied diet',
            'serving_suggestion' => 'with complementary side dishes'
        ];

        // Find matching recipe type
        $matchedRecipeData = $defaultRecipeData;
        foreach ($recipeTypes as $recipeType => $data) {
            if (strpos($lowerTitle, $recipeType) !== false) {
                $matchedRecipeData = $data;
                break;
            }
        }

        // Determine cooking time based on recipe type
        $cookingTime = $this->determineCookingTime($lowerTitle);

        // Determine difficulty level based on recipe type
        $difficultyLevel = $this->determineDifficultyLevel($lowerTitle);

        // Generate description
        $description = "This {$recipeTitle} is a delightful {$matchedRecipeData['cuisine']} dish prepared by {$matchedRecipeData['cooking_method']}. It offers a {$matchedRecipeData['flavor_profile']} taste experience, featuring {$matchedRecipeData['key_ingredients']} as the star ingredients. Not only is this recipe delicious, but it also provides {$matchedRecipeData['health_benefits']}. This is a {$difficultyLevel} difficulty recipe that takes approximately {$cookingTime} minutes to prepare and cook. Serve it {$matchedRecipeData['serving_suggestion']} for a complete meal that will impress your family and friends.";

        return [
            'description' => $description,
            'cooking_time' => $cookingTime,
            'difficulty_level' => $difficultyLevel
        ];
    }

    /**
     * Generate ingredients based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    private function generateIngredientsFromRecipeType(string $recipeTitle): array
    {
        $lowerTitle = strtolower($recipeTitle);
        $ingredients = [];

        // Common base ingredients for most recipes
        $baseIngredients = [
            'salt' => 'to taste',
            'black pepper' => 'to taste',
        ];

        // Specific ingredients based on recipe type
        if (
            strpos($lowerTitle, 'fish') !== false || strpos($lowerTitle, 'salmon') !== false ||
            strpos($lowerTitle, 'tuna') !== false || strpos($lowerTitle, 'cod') !== false
        ) {
            $ingredients = [
                '1 lb fresh ' . (strpos($lowerTitle, 'salmon') !== false ? 'salmon fillet' : (strpos($lowerTitle, 'tuna') !== false ? 'tuna steak' : (strpos($lowerTitle, 'cod') !== false ? 'cod fillet' : 'fish fillet'))),
                '2 tablespoons olive oil',
                '1 lemon, juiced',
                '2 cloves garlic, minced',
                '1 tablespoon fresh dill, chopped',
                '1 teaspoon paprika'
            ];
        } elseif (strpos($lowerTitle, 'shrimp') !== false) {
            $ingredients = [
                '1 lb shrimp, peeled and deveined',
                '2 tablespoons butter',
                '3 cloves garlic, minced',
                '1/4 cup white wine',
                '1 lemon, juiced',
                '2 tablespoons fresh parsley, chopped',
                '1/4 teaspoon red pepper flakes'
            ];
        } elseif (strpos($lowerTitle, 'pasta') !== false) {
            $ingredients = [
                '8 oz pasta of your choice',
                '2 tablespoons olive oil',
                '3 cloves garlic, minced',
                '1 small onion, diced',
                '1 can (14 oz) diced tomatoes',
                '1/4 cup fresh basil, chopped',
                '1/4 cup grated Parmesan cheese'
            ];
        } elseif (strpos($lowerTitle, 'curry') !== false) {
            $ingredients = [
                '1 lb protein of choice (chicken, tofu, or chickpeas)',
                '1 onion, diced',
                '2 cloves garlic, minced',
                '1 tablespoon ginger, grated',
                '2 tablespoons curry powder or paste',
                '1 can (14 oz) coconut milk',
                '1 cup vegetables (bell peppers, carrots, peas)',
                '2 tablespoons vegetable oil',
                '1/4 cup fresh cilantro, chopped'
            ];
        } elseif (strpos($lowerTitle, 'stir fry') !== false) {
            $ingredients = [
                '1 lb protein of choice (chicken, beef, tofu)',
                '2 cups mixed vegetables (bell peppers, broccoli, carrots)',
                '2 tablespoons vegetable oil',
                '2 cloves garlic, minced',
                '1 tablespoon ginger, grated',
                '3 tablespoons soy sauce',
                '1 tablespoon sesame oil',
                '2 green onions, sliced'
            ];
        } elseif (strpos($lowerTitle, 'soup') !== false) {
            $ingredients = [
                '6 cups broth (chicken, vegetable, or beef)',
                '1 onion, diced',
                '2 carrots, diced',
                '2 celery stalks, diced',
                '2 cloves garlic, minced',
                '1 cup protein of choice (optional)',
                '1 cup additional vegetables',
                '1 bay leaf',
                '1 teaspoon dried thyme',
                '2 tablespoons fresh parsley, chopped'
            ];
        } elseif (strpos($lowerTitle, 'salad') !== false) {
            $ingredients = [
                '4 cups mixed greens',
                '1 cucumber, sliced',
                '1 bell pepper, diced',
                '1 cup cherry tomatoes, halved',
                '1/4 red onion, thinly sliced',
                '1/2 cup protein of choice (chicken, tofu, chickpeas)',
                '1/4 cup nuts or seeds',
                '1/4 cup dressing of choice'
            ];
        } else {
            // Default ingredients for any other recipe
            $ingredients = [
                '1 lb main ingredient (protein or vegetable)',
                '1 onion, diced',
                '2 cloves garlic, minced',
                '2 tablespoons cooking oil',
                '1 cup additional vegetables',
                '1 teaspoon herbs or spices',
                '1/4 cup fresh herbs for garnish'
            ];
        }

        // Add base ingredients
        foreach ($baseIngredients as $ingredient => $amount) {
            $ingredients[] = "$ingredient, $amount";
        }

        return $ingredients;
    }

    /**
     * Generate instructions based on recipe title and recipe data
     *
     * @param string $recipeTitle
     * @param array $recipeData
     * @return array
     */
    /**
     * Generate instructions based on recipe title
     *
     * @param string $recipeTitle
     * @return array
     */
    private function generateInstructionsFromRecipeType(string $recipeTitle): array
    {
        $lowerTitle = strtolower($recipeTitle);
        $instructions = [];

        // Common cooking methods
        if (
            strpos($lowerTitle, 'fish') !== false || strpos($lowerTitle, 'salmon') !== false ||
            strpos($lowerTitle, 'tuna') !== false || strpos($lowerTitle, 'cod') !== false
        ) {
            $instructions = [
                'Preheat oven to 375°F (190°C) or prepare a grill to medium-high heat.',
                'In a small bowl, mix olive oil, lemon juice, minced garlic, and herbs.',
                'Pat the fish dry with paper towels and season with salt and pepper.',
                'Place the fish on a baking sheet lined with parchment paper or in a baking dish.',
                'Pour the marinade over the fish, ensuring it\'s well coated.',
                'Bake for 12-15 minutes or grill for 4-5 minutes per side, until the fish flakes easily with a fork.',
                'Garnish with fresh herbs and serve with lemon wedges.'
            ];
        } elseif (strpos($lowerTitle, 'shrimp') !== false) {
            $instructions = [
                'Heat butter in a large skillet over medium-high heat.',
                'Add minced garlic and red pepper flakes, sauté for 30 seconds until fragrant.',
                'Add shrimp to the skillet in a single layer.',
                'Cook for 2 minutes, then flip and cook for another 1-2 minutes until pink and opaque.',
                'Pour in white wine and lemon juice, simmer for 1 minute.',
                'Season with salt and pepper to taste.',
                'Garnish with fresh parsley and serve immediately.'
            ];
        } elseif (strpos($lowerTitle, 'pasta') !== false) {
            $instructions = [
                'Bring a large pot of salted water to a boil.',
                'Cook pasta according to package instructions until al dente.',
                'Meanwhile, heat olive oil in a large skillet over medium heat.',
                'Add onion and sauté for 3-4 minutes until softened.',
                'Add garlic and cook for another 30 seconds until fragrant.',
                'Add diced tomatoes and simmer for 10 minutes.',
                'Drain pasta and add it to the sauce, tossing to coat.',
                'Stir in fresh basil and season with salt and pepper to taste.',
                'Serve topped with grated Parmesan cheese.'
            ];
        } elseif (strpos($lowerTitle, 'curry') !== false) {
            $instructions = [
                'Heat vegetable oil in a large pot or deep skillet over medium heat.',
                'Add onion and sauté for 3-4 minutes until softened.',
                'Add garlic and ginger, cook for another minute until fragrant.',
                'Add curry powder or paste and stir for 30 seconds to bloom the spices.',
                'Add your protein of choice and cook until browned on all sides.',
                'Pour in coconut milk and bring to a simmer.',
                'Add vegetables and cook until the protein is cooked through and vegetables are tender, about 15-20 minutes.',
                'Season with salt to taste.',
                'Garnish with fresh cilantro and serve with rice or naan bread.'
            ];
        } elseif (strpos($lowerTitle, 'stir fry') !== false) {
            $instructions = [
                'Prepare all ingredients before starting: cut protein into bite-sized pieces and slice vegetables.',
                'Heat vegetable oil in a wok or large skillet over high heat until shimmering.',
                'Add protein and cook until browned on all sides and nearly cooked through. Remove and set aside.',
                'Add a bit more oil if needed, then add garlic and ginger, stir for 30 seconds.',
                'Add vegetables, starting with the ones that take longest to cook.',
                'Stir-fry for 3-5 minutes until vegetables are crisp-tender.',
                'Return protein to the wok, add soy sauce and any other sauces.',
                'Toss everything together and cook for another 1-2 minutes until well combined and heated through.',
                'Drizzle with sesame oil, garnish with green onions, and serve immediately over rice or noodles.'
            ];
        } elseif (strpos($lowerTitle, 'soup') !== false) {
            $instructions = [
                'Heat oil in a large pot over medium heat.',
                'Add onion, carrots, and celery. Sauté for 5 minutes until softened.',
                'Add garlic and cook for another 30 seconds until fragrant.',
                'Add broth, bay leaf, and thyme. Bring to a boil.',
                'Add protein (if using) and additional vegetables.',
                'Reduce heat and simmer for 20-30 minutes until all ingredients are cooked through.',
                'Season with salt and pepper to taste.',
                'Remove bay leaf before serving.',
                'Garnish with fresh parsley and serve hot.'
            ];
        } elseif (strpos($lowerTitle, 'salad') !== false) {
            $instructions = [
                'Wash and dry all greens and vegetables thoroughly.',
                'Prepare your protein if needed (cook chicken, drain and rinse chickpeas, etc.).',
                'In a large bowl, combine mixed greens with all vegetables.',
                'Add protein and nuts or seeds.',
                'In a small bowl, prepare your dressing or use store-bought.',
                'Just before serving, drizzle dressing over the salad and toss gently to coat.',
                'Season with salt and pepper to taste.',
                'Serve immediately for maximum freshness.'
            ];
        } else {
            // Default instructions for any other recipe
            $instructions = [
                'Prepare all ingredients: wash, chop, and measure everything before starting.',
                'Heat cooking oil in a suitable pan or pot over medium heat.',
                'Add onion and sauté until translucent, about 3-4 minutes.',
                'Add garlic and cook for another 30 seconds until fragrant.',
                'Add main ingredients and cook according to their requirements.',
                'Add seasonings and adjust to taste.',
                'Cook until all ingredients are properly done.',
                'Garnish with fresh herbs before serving.'
            ];
        }

        return $instructions;
    }

    /**
     * Determine cooking time based on recipe title
     *
     * @param string $lowerTitle
     * @return int
     */
    private function determineCookingTime(string $lowerTitle): int
    {
        // Base cooking times for different recipe types (in minutes)
        $cookingTimes = [
            'fish' => 25,
            'salmon' => 20,
            'tuna' => 15,
            'cod' => 20,
            'shrimp' => 15,
            'pasta' => 30,
            'curry' => 45,
            'stir fry' => 20,
            'soup' => 60,
            'salad' => 15,
            'grill' => 30,
            'bake' => 45,
            'roast' => 60,
            'slow cook' => 240,
            'instant pot' => 30,
            'pressure cook' => 30,
            'dessert' => 40
        ];

        // Default cooking time
        $cookingTime = 30;

        // Find matching recipe type
        foreach ($cookingTimes as $type => $time) {
            if (strpos($lowerTitle, $type) !== false) {
                $cookingTime = $time;
                break;
            }
        }

        // Add some randomness to make it more realistic
        $cookingTime += rand(-5, 5);

        // Ensure cooking time is at least 10 minutes
        return max(10, $cookingTime);
    }

    /**
     * Determine difficulty level based on recipe title
     *
     * @param string $lowerTitle
     * @return string
     */
    private function determineDifficultyLevel(string $lowerTitle): string
    {
        // Recipe types and their difficulty levels
        $difficultyMap = [
            'easy' => ['salad', 'sandwich', 'toast', 'simple', 'quick', 'basic'],
            'hard' => ['soufflé', 'souffle', 'complex', 'advanced', 'gourmet', 'professional'],
        ];

        // Check for explicit difficulty mentions in the title
        foreach ($difficultyMap as $difficulty => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($lowerTitle, $keyword) !== false) {
                    return $difficulty;
                }
            }
        }

        // Recipe types with their default difficulty
        $recipeTypeDifficulty = [
            'fish' => 'medium',
            'salmon' => 'medium',
            'tuna' => 'medium',
            'cod' => 'easy',
            'shrimp' => 'easy',
            'pasta' => 'easy',
            'curry' => 'medium',
            'stir fry' => 'easy',
            'soup' => 'easy',
            'salad' => 'easy',
            'grill' => 'medium',
            'bake' => 'medium',
            'roast' => 'medium',
            'slow cook' => 'easy',
            'dessert' => 'medium',
            'cake' => 'hard',
            'pie' => 'medium',
            'bread' => 'medium',
            'risotto' => 'hard',
            'sushi' => 'hard'
        ];

        // Find matching recipe type
        foreach ($recipeTypeDifficulty as $type => $difficulty) {
            if (strpos($lowerTitle, $type) !== false) {
                return $difficulty;
            }
        }

        // Default to medium difficulty
        return 'medium';
    }
}
