<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MoveProductImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'move:product-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move product images from public/products to products directory';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to move product images...');

        // Check if the wrong directory exists
        $wrongDirectory = 'public/public/products';
        $correctDirectory = 'products';

        if (!Storage::exists($wrongDirectory)) {
            $this->info('No images found in the wrong directory.');
            return 0;
        }

        // Get all files from the wrong directory
        $files = Storage::files($wrongDirectory);

        if (empty($files)) {
            $this->info('No files found to move.');
            return 0;
        }

        $this->info("Found " . count($files) . " files to move.");

        // Ensure the correct directory exists
        if (!Storage::exists($correctDirectory)) {
            Storage::makeDirectory($correctDirectory);
            $this->info("Created directory: {$correctDirectory}");
        }

        $moved = 0;
        foreach ($files as $file) {
            $filename = basename($file);
            $newPath = $correctDirectory . '/' . $filename;

            try {
                // Copy the file to the new location
                if (Storage::copy($file, $newPath)) {
                    $this->line("Moved: {$filename}");

                    // Delete the old file
                    Storage::delete($file);

                    Log::info('Moved product image', [
                        'from' => $file,
                        'to' => $newPath,
                        'filename' => $filename
                    ]);

                    $moved++;
                } else {
                    $this->error("Failed to move: {$filename}");
                }
            } catch (\Exception $e) {
                $this->error("Error moving {$filename}: " . $e->getMessage());
                Log::error('Failed to move product image', [
                    'file' => $file,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("Successfully moved {$moved} product images.");

        // Try to remove the empty directories
        try {
            if (Storage::exists('public/public/products') && empty(Storage::files('public/public/products'))) {
                Storage::deleteDirectory('public/public/products');
                $this->info('Removed empty directory: public/public/products');
            }

            if (Storage::exists('public/public') && empty(Storage::allFiles('public/public'))) {
                Storage::deleteDirectory('public/public');
                $this->info('Removed empty directory: public/public');
            }
        } catch (\Exception $e) {
            $this->warn('Could not remove empty directories: ' . $e->getMessage());
        }

        return 0;
    }
}
