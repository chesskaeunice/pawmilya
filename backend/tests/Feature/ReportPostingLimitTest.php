<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\MissingPetPhoto;
use App\Models\MissingPetReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// A logged-in citizen can file at most 3 reports per rolling 24 hours (config/missing_pets.php).
// Guests and staff accounts are not limited.
class ReportPostingLimitTest extends TestCase
{
    use RefreshDatabase;

    private Carbon $start;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
        $this->start = Carbon::create(2026, 11, 2, 9, 0, 0, 'Asia/Manila');
        Carbon::setTestNow($this->start);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function user(string $role, string $email): User
    {
        return User::where('email', $email)->first() ?? tap(
            new User(['name' => ucfirst($role), 'email' => $email, 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']),
            function ($u) use ($role) {
                $u->role = $role;
                $u->save();
            }
        );
    }

    private function png(string $name = 'p.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    // A different pet every call, so the "same pet already reported" check never gets in the way
    private function report(?User $as, string $type = 'Citizen')
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        if ($as) {
            $this->withToken($as->createToken('t')->plainTextToken);
        }

        $this->n++;

        return $this->post('/api/missing-pets', [
            'name' => "Pet {$this->n}", 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => "Katipunan {$this->n}", 'last_seen_at' => '2026-11-01 10:00:00',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'contact_email' => 'reporter@example.com', 'reporter_type' => $type,
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], ['Accept' => 'application/json']);
    }

    private function snapshot(): array
    {
        return [
            MissingPetReport::count(), MissingPetPhoto::count(), Animal::count(), AuditLog::count(),
            count(Storage::disk('s3')->allFiles()),
        ];
    }

    public function test_a_citizen_can_report_three_times_and_the_fourth_is_rejected_with_the_time_left(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');

        foreach (range(1, 3) as $i) {
            $this->report($maria)->assertCreated();
        }

        // 18 hours 48 minutes later, 5 hours 12 minutes are left
        Carbon::setTestNow($this->start->copy()->addHours(18)->addMinutes(48));

        $this->report($maria)
            ->assertStatus(429)
            ->assertJsonPath('message', 'You have reached the limit of 3 reports per 24 hours. You can report again in 5 hours 12 minutes.')
            ->assertJsonPath('limit_reached', true);

        $this->assertSame(3, MissingPetReport::count());
    }

    public function test_the_citizen_can_report_again_after_24_hours(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');

        foreach (range(1, 3) as $i) {
            $this->report($maria)->assertCreated();
        }

        Carbon::setTestNow($this->start->copy()->addHours(23)->addMinutes(59));
        $this->report($maria)->assertStatus(429);

        Carbon::setTestNow($this->start->copy()->addHours(24)->addMinute());
        $this->report($maria)->assertCreated();
        $this->assertSame(4, MissingPetReport::count());
    }

    public function test_the_window_rolls_the_wait_is_counted_from_the_report_that_blocks(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');

        $this->report($maria)->assertCreated();
        Carbon::setTestNow($this->start->copy()->addHours(10));
        $this->report($maria)->assertCreated();
        Carbon::setTestNow($this->start->copy()->addHours(20));
        $this->report($maria)->assertCreated();

        // the first report leaves the window at +24h: 3 hours from now
        Carbon::setTestNow($this->start->copy()->addHours(21));
        $this->report($maria)->assertStatus(429)
            ->assertJsonPath('message', 'You have reached the limit of 3 reports per 24 hours. You can report again in 3 hours.');

        // only 2 are left in the window once the first one is older than 24 hours
        Carbon::setTestNow($this->start->copy()->addHours(24)->addMinute());
        $this->report($maria)->assertCreated();
    }

    public function test_guests_are_never_limited(): void
    {
        foreach (range(1, 5) as $i) {
            $this->report(null, $i % 2 ? 'Owner' : 'Citizen')->assertCreated();
        }

        $this->assertSame(5, MissingPetReport::count());
    }

    public function test_staff_accounts_are_exempt(): void
    {
        $staff = $this->user('pound_staff', 'staff@test.com');

        foreach (range(1, 5) as $i) {
            $this->report($staff)->assertCreated();
        }

        $this->assertSame(5, MissingPetReport::count());
    }

    public function test_a_rejected_request_stores_nothing(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');

        foreach (range(1, 3) as $i) {
            $this->report($maria)->assertCreated();
        }

        $before = $this->snapshot();

        $this->report($maria)->assertStatus(429);
        $this->report($maria, 'Owner')->assertStatus(429);

        // no report, photo rows, animal, audit entry or file
        $this->assertSame($before, $this->snapshot());
    }

    // (each test stays under the route's 10 requests per minute throttle)
    public function test_it_applies_to_owner_reports(): void
    {
        $owner = $this->user('citizen', 'owner@test.com');
        foreach (range(1, 3) as $i) {
            $this->report($owner, 'Owner')->assertCreated()->assertJsonPath('data.status', 'Lost');
        }

        $this->report($owner, 'Owner')->assertStatus(429);
        // the limit counts both kinds together
        $this->report($owner, 'Citizen')->assertStatus(429);
    }

    public function test_it_applies_to_citizen_reports(): void
    {
        $finder = $this->user('citizen', 'finder@test.com');
        foreach (range(1, 3) as $i) {
            $this->report($finder, 'Citizen')->assertCreated()->assertJsonPath('data.status', 'Rescued');
        }

        $this->report($finder, 'Citizen')->assertStatus(429);
        $this->report($finder, 'Owner')->assertStatus(429);
    }

    public function test_owner_and_citizen_reports_count_together(): void
    {
        $mixed = $this->user('citizen', 'mixed@test.com');

        $this->report($mixed, 'Owner')->assertCreated();
        $this->report($mixed, 'Citizen')->assertCreated();
        $this->report($mixed, 'Owner')->assertCreated();
        $this->report($mixed, 'Citizen')->assertStatus(429);
    }

    public function test_one_users_reports_do_not_count_for_another_user(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');
        $juan = $this->user('citizen', 'juan@test.com');

        foreach (range(1, 3) as $i) {
            $this->report($maria)->assertCreated();
        }
        $this->report($maria)->assertStatus(429);

        // Juan has none yet; guest reports do not count for anybody either
        $this->report(null)->assertCreated();
        $this->report($juan)->assertCreated();
        $this->assertSame(1, MissingPetReport::where('reporter_id', $juan->id)->count());
    }

    public function test_the_limit_numbers_come_from_the_config(): void
    {
        config(['missing_pets.user_report_limit' => 1, 'missing_pets.window_hours' => 2]);
        $maria = $this->user('citizen', 'maria@test.com');

        $this->report($maria)->assertCreated();
        $this->report($maria)->assertStatus(429)
            ->assertJsonPath('message', 'You have reached the limit of 1 reports per 2 hours. You can report again in 2 hours.');
    }
}
