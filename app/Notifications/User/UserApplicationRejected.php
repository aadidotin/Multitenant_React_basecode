<?php

namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserApplicationRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly User $user) {}

    public function via(): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Your Registration Application Status')
            ->greeting("Hello {$notifiable->name},")
            ->line('We regret to inform you that your registration application has not been approved at this time.');

        if ($notifiable->review_notes) {
            $mail->line("**Reason:** {$notifiable->review_notes}");
        }

        return $mail->line('If you believe this is a mistake, please contact the workspace administrator.');
    }
}
