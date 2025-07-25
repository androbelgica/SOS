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
        return ['mail', 'database'];
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
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";
        return [
            'title' => "Order Status Updated",
            'order_id' => $this->order->id,
            'order_number' => $orderIdentifier,
            'status' => $this->order->status,
            'message' => "Your order status has been updated to: " . ucfirst($this->order->status),
            'action_url' => route('orders.show', $this->order),
            'total_amount' => $this->order->total_amount,
            'type' => 'order_status_changed',
            'created_at' => now(),
        ];
    }

    public function toDatabase($notifiable)
    {
        $data = $this->toArray($notifiable);
        return [
            'title' => "Order Status Updated",
            'data' => $data
        ];
    }
}
