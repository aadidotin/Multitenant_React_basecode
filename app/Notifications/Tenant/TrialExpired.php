<?php

namespace App\Notifications\Tenant;

use App\Models\Central\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialExpired extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public readonly Tenant $tenant
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $billingUrl = 'https://' . $this->tenant->getPrimaryDomain() . '/billing';

        return (new MailMessage)
            ->subject('Your free trial has ended')
            ->greeting("Hi {$this->tenant->name},")
            ->line('Your 14-day free trial has ended and your workspace has been paused.')
            ->action('Choose a plan to restore access', $billingUrl)
            ->line('Your data is safe and will be waiting for you when you subscribe.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
