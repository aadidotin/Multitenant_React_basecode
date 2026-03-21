<?php

namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserApplicationSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly User $applicant) {}

    public function via(): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New User Registration Application')
            ->greeting("Hello {$notifiable->name},")
            ->line("A new user has applied to join your workspace.")
            ->line("**Name:** {$this->applicant->name}")
            ->line("**Email:** {$this->applicant->email}")
            ->line($this->applicant->designation ? "**Designation:** {$this->applicant->designation}" : '')
            ->action('Review Application', url('/users?status=pending'))
            ->line('Please review and approve or reject the application.');
    }
}
