<?php

namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserApplicationApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly User $user) {}

    public function via(): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Registration Has Been Approved')
            ->greeting("Hello {$notifiable->name},")
            ->line('Great news! Your registration application has been approved.')
            ->line('You can now log in to your account using your registered email and password.')
            ->action('Log In Now', url('/login'))
            ->line('Welcome aboard!');
    }
}
