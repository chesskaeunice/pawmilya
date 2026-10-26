<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Profile page: the logged-in user's home address, saved in parts
class ProfileAddressTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        $user = new User(['name' => 'Maria Santos', 'email' => 'maria@email.com', 'phone' => '09171234567', 'password' => 'Str0ng!Passw0rd']);
        $user->role = 'citizen';
        $user->save();

        return $user;
    }

    private function save(User $user, array $address)
    {
        return $this->withToken($user->createToken('t')->plainTextToken)->patchJson('/api/profile/address', $address);
    }

    private function full(array $override = []): array
    {
        return array_merge([
            'province' => 'Bulacan',
            'city' => 'City of Malolos',
            'barangay' => 'Bulihan',
            'street' => '  12 Rizal Street ',
        ], $override);
    }

    public function test_the_address_is_saved_in_parts_trimmed_and_returned(): void
    {
        $user = $this->makeUser();

        $this->save($user, $this->full())->assertOk()
            ->assertJsonPath('user.address.province', 'Bulacan')
            ->assertJsonPath('user.address.city', 'City of Malolos')
            ->assertJsonPath('user.address.barangay', 'Bulihan')
            ->assertJsonPath('user.address.street', '12 Rizal Street');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'province' => 'Bulacan', 'city' => 'City of Malolos', 'barangay' => 'Bulihan', 'street' => '12 Rizal Street']);

        // /api/me carries it too
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('t2')->plainTextToken)->getJson('/api/me')
            ->assertOk()->assertJsonPath('user.address.barangay', 'Bulihan');

        $this->assertSame(1, AuditLog::where('action', 'profile.address_changed')->where('user_id', $user->id)->count());
    }

    public function test_a_new_user_has_an_empty_address(): void
    {
        $user = $this->makeUser();

        $this->withToken($user->createToken('t')->plainTextToken)->getJson('/api/me')
            ->assertOk()->assertJsonPath('user.address', ['province' => null, 'city' => null, 'barangay' => null, 'street' => null]);
    }

    public function test_saving_the_same_address_again_writes_no_second_audit_entry(): void
    {
        $user = $this->makeUser();

        $this->save($user, $this->full())->assertOk();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->save($user, $this->full())->assertOk();

        $this->assertSame(1, AuditLog::where('action', 'profile.address_changed')->count());
    }

    public function test_an_old_single_line_address_can_be_kept_in_the_street_alone(): void
    {
        $user = $this->makeUser();

        $this->save($user, ['street' => 'Blk 4 Lot 2, Sampaguita St., Quezon City'])->assertOk()
            ->assertJsonPath('user.address.street', 'Blk 4 Lot 2, Sampaguita St., Quezon City')
            ->assertJsonPath('user.address.province', null);
    }

    public function test_province_city_and_barangay_go_together(): void
    {
        $user = $this->makeUser();

        $this->save($user, $this->full(['barangay' => '']))->assertUnprocessable()
            ->assertJsonValidationErrors(['barangay'])
            ->assertJsonPath('errors.barangay.0', 'Please choose your barangay.');
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        $this->save($user, ['province' => 'Bulacan'])->assertUnprocessable()->assertJsonValidationErrors(['city', 'barangay']);

        $this->assertNull($user->fresh()->province);
    }

    public function test_too_long_parts_are_refused(): void
    {
        $user = $this->makeUser();

        $this->save($user, $this->full(['province' => str_repeat('a', 121), 'street' => str_repeat('b', 256)]))
            ->assertUnprocessable()->assertJsonValidationErrors(['province', 'street']);
    }

    public function test_sending_every_part_empty_clears_the_address(): void
    {
        $user = $this->makeUser();
        $this->save($user, $this->full())->assertOk();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        $this->save($user, ['province' => '', 'city' => '', 'barangay' => '', 'street' => ''])->assertOk()
            ->assertJsonPath('user.address', ['province' => null, 'city' => null, 'barangay' => null, 'street' => null]);

        $this->assertNull($user->fresh()->street);
    }

    public function test_guests_get_401(): void
    {
        $this->patchJson('/api/profile/address', $this->full())->assertUnauthorized();
    }
}
