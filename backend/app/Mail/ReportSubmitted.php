<?php

namespace App\Mail;

use App\Models\MissingPetReport;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

// "You reported a pet": a summary of what the reporter submitted (nothing internal)
class ReportSubmitted extends Mailable
{
    public array $details;

    public function __construct(MissingPetReport $report)
    {
        $this->details = self::detailsOf($report);
    }

    // Only fields that have a value; the same rows are used by the preview
    public static function detailsOf(MissingPetReport $report): array
    {
        $report->loadMissing('photos');

        return [
            'petName' => $report->name,
            'rows' => array_filter([
                'Report number' => 'MPR-'.str_pad((string) $report->id, 3, '0', STR_PAD_LEFT),
                'Pet name' => $report->name,
                'Type' => trim(($report->species === 'Other' ? $report->other_species : $report->species).($report->breed ? ' / '.$report->breed : ''), ' /'),
                'Color' => $report->color,
                'Markings' => $report->markings,
                'Date last seen' => $report->last_seen_at?->format('F j, Y'),
                'Last known location' => $report->location,
                'Additional details' => $report->details,
                'Contact name' => $report->contact_name,
                'Contact number' => $report->contact_number,
                'Contact email' => $report->contact_email,
                'Photos attached' => $report->photos->count() ?: null,
            ], fn ($value) => filled($value)),
        ];
    }

    public function envelope(): Envelope
    {
        $name = $this->details['petName'];

        return new Envelope(subject: $name ? "You reported a pet: {$name}" : 'You reported a pet');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.report-submitted');
    }
}
