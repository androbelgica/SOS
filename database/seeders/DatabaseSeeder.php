<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // Create regular user
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer'
        ]);

        // Create delivery staff users
        $delivery1 = User::create([
            'name' => 'Delivery Staff 1',
            'email' => 'delivery1@example.com',
            'password' => Hash::make('password'),
            'role' => 'delivery'
        ]);
        $delivery2 = User::create([
            'name' => 'Delivery Staff 2',
            'email' => 'delivery2@example.com',
            'password' => Hash::make('password'),
            'role' => 'delivery'
        ]);

        // Create a customer for orders
        $customer = User::where('role', 'customer')->first();
        // Create products if none exist
        if (Product::count() < 3) {
            Product::factory()->count(3)->create();
        }
        $products = Product::inRandomOrder()->take(3)->get();

        // Seed sample orders for delivery1
        foreach (['for_delivery', 'out_for_delivery'] as $status) {
            $order = Order::create([
                'user_id' => $customer->id,
                'order_number' => Order::generateOrderNumber(),
                'total_amount' => 0,
                'status' => 'processing',
                'shipping_address' => '123 Test St',
                'billing_address' => '123 Test St',
                'payment_status' => $status === 'out_for_delivery' ? 'paid' : 'pending',
                'payment_method' => 'cod',
                'assigned_to' => $delivery1->id,
                'delivery_status' => $status,
            ]);
            $total = 0;
            foreach ($products as $product) {
                $qty = rand(1, 3);
                $price = $product->price;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price' => $price,
                ]);
                $total += $qty * $price;
            }
            $order->total_amount = $total;
            $order->save();
        }
        // Seed sample orders for delivery2
        foreach (['for_delivery', 'out_for_delivery'] as $status) {
            $order = Order::create([
                'user_id' => $customer->id,
                'order_number' => Order::generateOrderNumber(),
                'total_amount' => 0,
                'status' => 'processing',
                'shipping_address' => '456 Test Ave',
                'billing_address' => '456 Test Ave',
                'payment_status' => $status === 'out_for_delivery' ? 'paid' : 'pending',
                'payment_method' => 'cod',
                'assigned_to' => $delivery2->id,
                'delivery_status' => $status,
            ]);
            $total = 0;
            foreach ($products as $product) {
                $qty = rand(1, 2);
                $price = $product->price;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price' => $price,
                ]);
                $total += $qty * $price;
            }
            $order->total_amount = $total;
            $order->save();
        }

        // Run other seeders
        $this->call([
            ProductCategorySeeder::class, // New comprehensive category seeder
            // ProductSeeder::class,         // Remove this
            // RecipeSeeder::class,          // Remove this
            // Any Order-related seeders should also be removed
        ]);
    }
}
