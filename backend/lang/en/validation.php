<?php

// Friendly wording for validation messages. Only what we change is listed here:
// Laravel's own validation file supplies every other message. The rules themselves
// live in the Form Requests and are not touched.
return [
    'required' => 'Please enter :attribute.',
    'accepted' => 'Please agree to :attribute.',
    'email' => 'Please enter a valid email address.',
    'confirmed' => 'Passwords do not match.',
    'different' => 'Your new password must be different from your current password.',
    'current_password' => 'Your current password is not correct.',

    'min' => ['string' => 'Please use at least :min characters.'],
    'max' => ['string' => 'That is too long. Please use at most :max characters.'],

    // Password policy (App\Support\PasswordRules)
    'password' => [
        'letters' => 'Please include at least one letter.',
        'mixed' => 'Please use both upper and lower case letters.',
        'numbers' => 'Please include at least one number.',
        'symbols' => 'Please include at least one symbol.',
        'uncompromised' => 'This password appeared in a data leak. Please choose a different one.',
    ],

    'custom' => [
        'email' => ['unique' => 'This email is already registered.'],
    ],

    // How a field is named inside "Please enter :attribute."
    'attributes' => [
        'first_name' => 'your first name',
        'last_name' => 'your last name',
        'email' => 'your email address',
        'phone' => 'your phone number',
        'password' => 'a password',
        'password_confirmation' => 'the password confirmation',
        'current_password' => 'your current password',
        'terms' => 'the Terms of Use and Privacy Policy',
    ],
];
