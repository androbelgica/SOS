<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderPaymentStatusChanged extends Notification
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
            'title' => "Payment Status Updated",
            'order_id' => $this->order->id,
            'order_number' => $orderIdentifier,
            'payment_status' => $this->order->payment_status,
            'message' => "Your order payment status has been updated to: " . ucfirst($this->order->payment_status),
            'action_url' => route('orders.show', $this->order),
            'total_amount' => $this->order->total_amount,
            'type' => 'order_payment_status_changed',
            'created_at' => now(),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        $message = (new MailMessage)
            ->subject("Order {$orderIdentifier} Payment Status Update")
            ->greeting("Hello {$notifiable->name}")
            ->line("Your order payment status has been updated to: " . ucfirst($this->order->payment_status));

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

    public function toDatabase($notifiable)
    {
        $data = $this->toArray($notifiable);
        return [
            'title' => "Payment Status Updated",
            'data' => $data
        ];
    }
}
