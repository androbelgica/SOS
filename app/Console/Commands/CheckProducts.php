<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;

class CheckProducts extends Command
{
    protected $signature = 'products:check {name?}';
    protected $description = 'Check products in the database';

    public function handle()
    {
        $name = $this->argument('name');
        
        if ($name) {
            $products = Product::where('name', 'like', "%{$name}%")->get();
        } else {
            $products = Product::all();
        }
        
        $this->info("Found " . $products->count() . " products");
        
        foreach ($products as $product) {
            $this->line("ID: {$product->id}, Name: {$product->name}, Unit Type: {$product->unit_type}");
        }
        
        return Command::SUCCESS;
    }
}
