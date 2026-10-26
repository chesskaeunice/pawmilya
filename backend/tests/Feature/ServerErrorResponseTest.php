<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use PDOException;
use Tests\TestCase;

// A server failure must never show SQL, table names or a trace to the user
class ServerErrorResponseTest extends TestCase
{
    use RefreshDatabase;

    private const FRIENDLY = 'Something went wrong on our side. Please try again later.';

    private function failingRoutes(): void
    {
        Route::get('/api/_test/query-error', function () {
            throw new QueryException(
                'mysql',
                'insert into `personal_access_tokens` (`name`, `token`) values (?, ?)',
                ['device', 'secret'],
                new PDOException('SQLSTATE[HY000]: General error: 1364 Field \'abilities\' doesn\'t have a default value')
            );
        });

        Route::get('/api/_test/boom', fn () => throw new \RuntimeException('Secret internal detail in App\\Support\\Thing'));
        Route::get('/api/_test/unavailable', fn () => abort(503, 'Down for maintenance of table users'));
    }

    public function test_a_database_error_returns_a_friendly_500_even_with_debug_on(): void
    {
        config(['app.debug' => true]);
        $this->failingRoutes();
        Log::spy();

        $response = $this->getJson('/api/_test/query-error')->assertStatus(500)->assertExactJson(['message' => self::FRIENDLY]);

        $body = $response->getContent();
        foreach (['SQLSTATE', 'personal_access_tokens', 'insert into', 'abilities', 'exception', 'trace', 'file', 'secret'] as $leak) {
            $this->assertStringNotContainsStringIgnoringCase($leak, $body);
        }

        // the full exception is still logged, now with the URL and the method
        Log::shouldHaveReceived('error')->withArgs(
            fn ($message, $context = []) => str_contains((string) $message, 'SQLSTATE')
                && str_contains($context['url'] ?? '', '/api/_test/query-error')
                && array_key_exists('user_id', $context)
        )->atLeast()->once();
    }

    public function test_any_unexpected_exception_and_5xx_are_friendly_too(): void
    {
        config(['app.debug' => true]);
        $this->failingRoutes();

        $this->getJson('/api/_test/boom')->assertStatus(500)->assertExactJson(['message' => self::FRIENDLY]);
        $this->getJson('/api/_test/unavailable')->assertStatus(503)->assertExactJson(['message' => self::FRIENDLY]);
    }

    public function test_client_errors_keep_their_own_responses(): void
    {
        config(['app.debug' => true]);

        // 422: the validation errors are unchanged
        $this->postJson('/api/login', [])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);

        // 401 and 404
        $this->getJson('/api/me')->assertStatus(401)->assertJsonPath('message', 'Unauthenticated.');
        $this->getJson('/api/animals/999999')->assertStatus(401);
        $this->getJson('/api/pets/999999')->assertStatus(404);
    }
}
