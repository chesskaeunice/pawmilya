<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Short, friendly validation messages (the rules themselves are tested elsewhere)
class ValidationWordingTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_sign_up_gets_friendly_messages(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable()->assertJsonValidationErrors([
            'first_name' => 'Please enter your first name.',
            'last_name' => 'Please enter your last name.',
            'email' => 'Please enter your email address.',
            'phone' => 'Please enter your phone number.',
            'password' => 'Please enter a password.',
            'terms' => 'Please agree to the Terms of Use and Privacy Policy.',
        ]);
    }

    public function test_sign_up_format_and_duplicate_messages(): void
    {
        $user = new User(['name' => 'Maria Santos', 'email' => 'taken@test.com', 'password' => 'Str0ng!Passw0rd']);
        $user->role = 'citizen';
        $user->save();

        $base = [
            'first_name' => 'Ana', 'last_name' => 'Cruz', 'phone' => '09171234567', 'terms' => true,
            'password' => 'Str0ng!Passw0rd', 'password_confirmation' => 'Str0ng!Passw0rd',
        ];

        $this->postJson('/api/register', [...$base, 'email' => 'not-an-email'])
            ->assertJsonValidationErrors(['email' => 'Please enter a valid email address.']);
        $this->postJson('/api/register', [...$base, 'email' => 'taken@test.com'])
            ->assertJsonValidationErrors(['email' => 'This email is already registered.']);
        $this->postJson('/api/register', [...$base, 'email' => 'ana@test.com', 'phone' => '123'])
            ->assertJsonValidationErrors(['phone' => 'Please enter a valid mobile number, for example 0917 123 4567.']);
        $this->postJson('/api/register', [...$base, 'email' => 'ana@test.com', 'password_confirmation' => 'Different!Passw0rd'])
            ->assertJsonValidationErrors(['password' => 'Passwords do not match.']);
    }

    public function test_weak_password_messages_are_short(): void
    {
        $body = [
            'first_name' => 'Ana', 'last_name' => 'Cruz', 'email' => 'ana@test.com', 'phone' => '09171234567',
            'terms' => true, 'password' => 'abc', 'password_confirmation' => 'abc',
        ];

        $errors = $this->postJson('/api/register', $body)->assertUnprocessable()->json('errors.password');

        $this->assertContains('Please use at least 10 characters.', $errors);
        $this->assertContains('Please use both upper and lower case letters.', $errors);
        $this->assertContains('Please include at least one number.', $errors);
        $this->assertContains('Please include at least one symbol.', $errors);
    }

    public function test_login_and_forgot_password_messages(): void
    {
        $this->postJson('/api/login', [])->assertJsonValidationErrors([
            'email' => 'Please enter your email address.',
            'password' => 'Please enter your password.',
        ]);

        $this->postJson('/api/forgot-password', [])
            ->assertJsonValidationErrors(['email' => 'Please enter your email address.']);
        $this->postJson('/api/forgot-password', ['email' => 'nope'])
            ->assertJsonValidationErrors(['email' => 'Please enter a valid email address.']);
    }
}
