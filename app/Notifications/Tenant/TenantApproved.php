<?php

namespace App\Notifications\Tenant;

use App\Models\Central\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenantApproved extends Notification implements ShouldQueue
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
        $domain = $this->tenant->getPrimaryDomain();
        $url    = "https://{$domain}";

        return (new MailMessage)
            ->subject('Your workspace is ready!')
            ->greeting("Great news, {$this->tenant->name}!")
            ->line('Your workspace has been approved and is ready to use.')
            ->line("Your workspace URL: **{$url}**")
            ->action('Go to your workspace', $url)
            ->line('Your free trial is active until ' . $this->tenant->trial_ends_at?->format('F j, Y') . '.');
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
