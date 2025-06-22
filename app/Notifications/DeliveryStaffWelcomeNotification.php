<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\User;

class DeliveryStaffWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $password;

    public function __construct(User $user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Welcome to Cart & Cook Delivery Staff')
            ->greeting('Hello ' . $this->user->name . ',')
            ->line('You have been registered as a delivery staff member.')
            ->line('You can log in with the following credentials:')
            ->line('Email: ' . $this->user->email)
            ->line('Password: ' . $this->password)
            ->action('Login', url('/login'))
            ->line('Please change your password after logging in for the first time.')
            ->line('Thank you for joining Cart & Cook!');
    }
}
