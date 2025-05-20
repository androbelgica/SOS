<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderStatusChanged extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        $message = (new MailMessage)
            ->subject("Order {$orderIdentifier} Status Update")
            ->greeting("Hello {$notifiable->name}")
            ->line("Your order status has been updated to: " . ucfirst($this->order->status));

        // Add order details
        $message->line('Order Details:');
        foreach ($this->order->items as $item) {
            $message->line("- {$item->product->name} x {$item->quantity} (₱{$item->price} each)");
        }

        $message->line("Total Amount: ₱{$this->order->total_amount}")
            ->action('View Order', route('orders.show', $this->order))
            ->line('Thank you for shopping with us!');

        return $message;
    }

    public function toArray($notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->order->status,
        ];
    }
}
