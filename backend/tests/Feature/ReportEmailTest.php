<?php

namespace Tests\Feature;

use App\Mail\ReportSubmitted;
use App\Models\MissingPetReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportEmailTest extends TestCase
{
    use RefreshDatabase;

    private function png(string $name = 'p.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function report(array $override = [])
    {
        return $this->post('/api/missing-pets', array_merge([
            'name' => 'Bruno', 'species' => 'Dog', 'breed' => 'Aspin', 'color' => 'Brown', 'markings' => 'White chest',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-18 01:15:00', 'details' => 'Wears a red collar.',
            'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'contact_email' => '  Liza@Example.com ',
            'reporter_type' => 'Citizen',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
        ], $override), ['Accept' => 'application/json']);
    }

    public function test_a_report_without_an_email_is_rejected_and_nothing_is_sent(): void
    {
        Storage::fake('public');
        Mail::fake();

        $this->report(['contact_email' => ''])->assertUnprocessable()->assertJsonValidationErrors('contact_email');
        $this->report(['contact_email' => 'not-an-email'])->assertUnprocessable()->assertJsonValidationErrors('contact_email');

        $this->assertSame(0, MissingPetReport::count());
        Mail::assertNothingSent();
    }

    public function test_a_report_with_an_email_is_saved_lowercased_and_confirmed_by_email(): void
    {
        Storage::fake('public');
        Mail::fake();

        $this->report()->assertCreated();

        $this->assertSame('liza@example.com', MissingPetReport::firstOrFail()->contact_email);

        Mail::assertSent(ReportSubmitted::class, function (ReportSubmitted $mail) {
            $this->assertTrue($mail->hasTo('liza@example.com'));
            $this->assertSame('You reported a pet: Bruno', $mail->envelope()->subject);

            $html = $mail->render();
            foreach (['Bruno', 'Aspin', 'Brown', 'White chest', 'Katipunan, Quezon City', 'Wears a red collar.', 'Liza Ramos', '0919 555 0166', 'liza@example.com', 'MPR-'] as $text) {
                $this->assertStringContainsString($text, $html);
            }
            $this->assertStringContainsString('Our staff will review your report', $html);
            $this->assertSame(2, $mail->details['rows']['Photos attached']);

            return true;
        });
        Mail::assertSent(ReportSubmitted::class, 1);
    }

    public function test_the_summary_leaves_out_empty_fields(): void
    {
        Storage::fake('public');
        Mail::fake();

        $this->report(['markings' => '', 'details' => '', 'breed' => ''])->assertCreated();

        Mail::assertSent(ReportSubmitted::class, function (ReportSubmitted $mail) {
            $this->assertArrayNotHasKey('Markings', $mail->details['rows']);
            $this->assertArrayNotHasKey('Additional details', $mail->details['rows']);
            $this->assertSame('Dog', $mail->details['rows']['Type']);

            return true;
        });
    }

    public function test_a_broken_mail_server_does_not_fail_the_report(): void
    {
        Storage::fake('public');
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 1,
        ]);

        $this->report()->assertCreated();

        $this->assertSame(1, MissingPetReport::count());
    }
}
