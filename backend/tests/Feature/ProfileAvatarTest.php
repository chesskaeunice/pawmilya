<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Profile page: the logged-in user's profile photo
class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function makeUser(): User
    {
        $user = new User(['name' => 'Maria Santos', 'email' => 'maria@email.com', 'phone' => '09171234567', 'password' => 'Str0ng!Passw0rd']);
        $user->role = 'citizen';
        $user->save();

        return $user;
    }

    // Tiny real PNG (no GD needed)
    private function png(string $name = 'me.png', int $extraBytes = 0): UploadedFile
    {
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

        return UploadedFile::fake()->createWithContent($name, $bytes.str_repeat('0', $extraBytes));
    }

    // a new request for the next call (the test client keeps the previous token and guard otherwise)
    private function fresh(): void
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
    }

    private function upload(User $user, $file)
    {
        return $this->withToken($user->createToken('t')->plainTextToken)->post('/api/me/avatar', ['avatar' => $file], ['Accept' => 'application/json']);
    }

    public function test_a_valid_photo_is_stored_and_returned_as_an_absolute_url(): void
    {
        $user = $this->makeUser();

        $response = $this->upload($user, $this->png())->assertOk();

        $path = $user->fresh()->avatar_path;
        $this->assertStringStartsWith('avatars/', $path);
        Storage::disk('public')->assertExists($path);
        $this->assertStringStartsWith('http', $response->json('user.avatar_url'));
        $this->assertStringEndsWith("/storage/{$path}", $response->json('user.avatar_url'));

        // /api/me carries it too
        $this->fresh();
        $this->withToken($user->createToken('t2')->plainTextToken)->getJson('/api/me')
            ->assertOk()->assertJsonPath('user.avatar_url', $response->json('user.avatar_url'));
    }

    public function test_a_new_photo_replaces_and_deletes_the_old_file(): void
    {
        $user = $this->makeUser();

        $this->upload($user, $this->png('a.png'))->assertOk();
        $first = $user->fresh()->avatar_path;
        $this->fresh();

        $this->upload($user, $this->png('b.png', 10))->assertOk();
        $second = $user->fresh()->avatar_path;

        $this->assertNotSame($first, $second);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);
    }

    public function test_the_login_response_has_the_avatar_url(): void
    {
        $user = $this->makeUser();
        $this->upload($user, $this->png())->assertOk();
        $this->fresh();

        $url = $this->postJson('/api/login', ['email' => 'maria@email.com', 'password' => 'Str0ng!Passw0rd'])
            ->assertOk()->json('user.avatar_url');

        $this->assertStringContainsString('/storage/avatars/', $url);
    }

    public function test_wrong_types_and_too_large_files_are_rejected(): void
    {
        $user = $this->makeUser();

        $bad = [
            UploadedFile::fake()->create('x.pdf', 10, 'application/pdf'),
            UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>'),
            UploadedFile::fake()->createWithContent('x.php', '<?php echo 1;'),
            $this->png('big.png', 2 * 1024 * 1024 + 10),
        ];

        foreach ($bad as $file) {
            $this->upload($user, $file)->assertUnprocessable()->assertJsonValidationErrors(['avatar']);
            $this->fresh();
        }

        $this->withToken($user->createToken('t3')->plainTextToken)->postJson('/api/me/avatar', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['avatar']);

        $this->assertNull($user->fresh()->avatar_path);
        $this->assertSame([], Storage::disk('public')->allFiles('avatars'));
    }

    public function test_guests_get_401(): void
    {
        $this->post('/api/me/avatar', ['avatar' => $this->png()], ['Accept' => 'application/json'])->assertUnauthorized();
        $this->deleteJson('/api/me/avatar')->assertUnauthorized();
    }

    public function test_remove_deletes_the_file_and_clears_the_url(): void
    {
        $user = $this->makeUser();
        $this->upload($user, $this->png())->assertOk();
        $path = $user->fresh()->avatar_path;
        $this->fresh();

        $token = $user->createToken('t2')->plainTextToken;
        $this->withToken($token)->deleteJson('/api/me/avatar')->assertOk()->assertJsonPath('user.avatar_url', null);

        $this->assertNull($user->fresh()->avatar_path);
        Storage::disk('public')->assertMissing($path);

        // removing again is harmless
        $this->fresh();
        $this->withToken($token)->deleteJson('/api/me/avatar')->assertOk()->assertJsonPath('user.avatar_url', null);
    }
}
