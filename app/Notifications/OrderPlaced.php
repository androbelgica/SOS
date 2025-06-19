<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderPlaced extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }
    public function toArray($notifiable): array
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";
        return [
            'title' => "Order Placed Successfully",
            'order_id' => $this->order->id,
            'order_number' => $orderIdentifier,
            'status' => $this->order->status,
            'message' => "Your order has been placed successfully!",
            'action_url' => route('orders.show', $this->order),
            'total_amount' => $this->order->total_amount,
            'type' => 'order_placed',
            'created_at' => now(),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        $message = (new MailMessage)
            ->subject("Order {$orderIdentifier} Placed Successfully")
            ->greeting("Hello {$notifiable->name}")
            ->line("Thank you for your order! Your order has been placed successfully.");

        // Add order details
        $message->line('Order Details:');
        foreach ($this->order->items as $item) {
            $message->line("- {$item->product->name} x {$item->quantity} (₱{$item->price} each)");
        }

        $message->line("Total Amount: ₱{$this->order->total_amount}")
            ->action('View Order', route('orders.show', $this->order))
            ->line('We will notify you once your order status changes.')
            ->line('Thank you for shopping with us!');

        return $message;
    }

    public function toDatabase($notifiable)
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";
        $data = $this->toArray($notifiable);
        return [
            'title' => "Order Placed Successfully",
            'data' => $data
        ];
    }
}
