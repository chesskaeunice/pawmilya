<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

// Branded reset email. The link (the React reset page, see AppServiceProvider)
// and the expiry come from Laravel's password broker, as before.
class PawmilyaResetPassword extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $broker = config('auth.defaults.passwords');

        return (new MailMessage)
            ->subject('PAWmilya: Password Reset Request')
            ->view(
                ['emails.reset-password', 'emails.reset-password-text'],
                [
                    'name' => $notifiable->name,
                    'url' => $this->resetUrl($notifiable),
                    'minutes' => config("auth.passwords.{$broker}.expire"),
                ]
            );
    }
}
