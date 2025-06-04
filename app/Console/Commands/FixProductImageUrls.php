<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class FixProductImageUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:product-image-urls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix product image URLs that have incorrect /storage/public/ paths';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix product image URLs...');

        // First, let's see all products with image URLs
        $allProducts = Product::whereNotNull('image_url')->get();
        $this->info("Total products with image URLs: {$allProducts->count()}");

        foreach ($allProducts as $product) {
            $this->line("Product: {$product->name}, URL: {$product->image_url}");
        }

        $products = Product::whereNotNull('image_url')
            ->where('image_url', 'like', '%/storage/public/%')
            ->get();

        if ($products->isEmpty()) {
            $this->info('No products found with incorrect image URLs.');
            return 0;
        }

        $this->info("Found {$products->count()} products with incorrect image URLs.");

        $fixed = 0;
        foreach ($products as $product) {
            $oldUrl = $product->image_url;

            // Remove any timestamp parameters first
            $cleanUrl = preg_replace('/(\?|&)t=\d+(&|$)/', '$1', $oldUrl);
            $cleanUrl = rtrim($cleanUrl, '?&');

            // Fix the URL by removing the extra 'public/' part
            $newUrl = str_replace('/storage/public/', '/storage/', $cleanUrl);

            if ($oldUrl !== $newUrl) {
                $product->image_url = $newUrl;
                $product->save();

                $this->line("Fixed: {$product->name}");
                $this->line("  Old: {$oldUrl}");
                $this->line("  New: {$newUrl}");

                Log::info('Fixed product image URL', [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'old_url' => $oldUrl,
                    'new_url' => $newUrl
                ]);

                $fixed++;
            }
        }

        $this->info("Successfully fixed {$fixed} product image URLs.");
        return 0;
    }
}
