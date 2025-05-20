<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class LowStockAlert extends Notification
{
    use Queueable;

    protected $product;
    protected $threshold;

    public function __construct(Product $product, int $threshold = 10)
    {
        $this->product = $product;
        $this->threshold = $threshold;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Low Stock Alert - ' . $this->product->name)
            ->line('The following product is running low on stock:')
            ->line('Product: ' . $this->product->name)
            ->line('Current Stock: ' . $this->product->stock_quantity)
            ->line('Threshold: ' . $this->threshold)
            ->action('View Product', route('admin.products.edit', $this->product))
            ->line('Please restock this item soon.');
    }

    public function toArray($notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'current_stock' => $this->product->stock_quantity,
            'threshold' => $this->threshold,
        ];
    }
}
