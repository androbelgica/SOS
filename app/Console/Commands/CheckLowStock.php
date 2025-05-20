<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\User;
use App\Notifications\LowStockAlert;
use Illuminate\Console\Command;

class CheckLowStock extends Command
{
    protected $signature = 'stock:check';
    protected $description = 'Check for products with low stock and notify admins';

    public function handle()
    {
        $threshold = config('store.low_stock_threshold', 10);
        
        $lowStockProducts = Product::where('stock_quantity', '<=', $threshold)
            ->where('is_available', true)
            ->get();

        if ($lowStockProducts->isNotEmpty()) {
            // Notify all admin users
            $admins = User::where('role', 'admin')->get();
            
            foreach ($lowStockProducts as $product) {
                foreach ($admins as $admin) {
                    $admin->notify(new LowStockAlert($product, $threshold));
                }
            }

            $this->info("{$lowStockProducts->count()} products with low stock found. Notifications sent.");
        } else {
            $this->info('No products with low stock found.');
        }
    }
}
