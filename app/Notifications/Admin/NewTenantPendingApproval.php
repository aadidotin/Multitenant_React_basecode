<?php

namespace App\Notifications\Admin;

use App\Models\Central\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTenantPendingApproval extends Notification implements ShouldQueue
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = route('central.tenants.show', $this->tenant->id);

        return (new MailMessage)
            ->subject("New tenant pending approval: {$this->tenant->name}")
            ->greeting('New Tenant Registration')
            ->line("**{$this->tenant->name}** ({$this->tenant->email}) has verified their email and is awaiting approval.")
            ->action('Review & Approve', $url);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'tenant_id'   => $this->tenant->id,
            'tenant_name' => $this->tenant->name,
            'email'       => $this->tenant->email,
            'message'     => "{$this->tenant->name} is pending approval.",
            'url'         => route('central.tenants.show', $this->tenant->id),
        ];
    }
}
