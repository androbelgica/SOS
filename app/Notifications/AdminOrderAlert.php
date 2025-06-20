<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AdminOrderAlert extends Notification
{
    use Queueable;

    protected $order;
    protected $type;
    protected $message;

    public function __construct(Order $order, string $type, string $message)
    {
        $this->order = $order;
        $this->type = $type;
        $this->message = $message;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }
    public function toArray($notifiable): array
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";
        return [
            'title' => "[Admin Alert] {$this->type}",
            'order_id' => $this->order->id,
            'order_number' => $orderIdentifier,
            'alert_type' => $this->type,
            'message' => $this->message,
            'action_url' => route('admin.orders.show', $this->order->id),
            'total_amount' => $this->order->total_amount,
            'type' => 'admin_order_alert',
            'created_at' => now(),
            'priority' => $this->getPriority(),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $orderIdentifier = $this->order->order_number ?? "#{$this->order->id}";

        $mail = (new MailMessage)
            ->subject("[Admin Alert] Order {$orderIdentifier}: {$this->type}")
            ->greeting("Hello Admin")
            ->line($this->message);

        if ($this->type === 'high_value_order') {
            $mail->line("Order Value: ₱{$this->order->total_amount}")
                ->line("Customer: {$this->order->user->name}");
        } elseif ($this->type === 'potential_fraud') {
            $mail->line("Please review this order immediately.")
                ->line("Warning Signs: Multiple failed payment attempts");
        }

        return $mail->action('View Order Details', route('admin.orders.show', $this->order->id))
            ->line('Please take appropriate action.');
    }

    public function toDatabase($notifiable)
    {
        $data = $this->toArray($notifiable);
        return [
            'title' => "[Admin Alert] {$this->type}",
            'data' => $data
        ];
    }

    protected function getPriority(): string
    {
        return match ($this->type) {
            'potential_fraud' => 'high',
            'high_value_order' => 'medium',
            default => 'normal'
        };
    }
}
