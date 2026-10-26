<?php

use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureRole::class,
            'permission' => EnsurePermission::class,
            'password.changed' => EnsurePasswordChanged::class,
        ]);
        $middleware->api(append: [SecurityHeaders::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // The API always answers JSON (401 instead of a redirect to a login page)
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        // Server errors (500: a database error, any unexpected exception) never show the exception
        // message, SQL, file or trace to the user, not even when APP_DEBUG is on. The full exception is
        // still written to the log (with the URL and the user). Validation, auth, throttle, 404 and the
        // other client errors (below 500) keep their own responses.
        $exceptions->respond(function (SymfonyResponse $response, Throwable $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson()) || $response->getStatusCode() < 500) {
                return $response;
            }

            return response()->json(
                ['message' => 'Something went wrong on our side. Please try again later.'],
                $response->getStatusCode()
            );
        });

        $exceptions->context(fn (Throwable $e, array $context) => array_merge($context, [
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'user_id' => request()->user()?->id,
        ]));
    })->create();
