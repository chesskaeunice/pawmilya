@extends('emails.layout')

@section('title', 'You reported a pet')

@section('content')
    <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:#4d2a00;">You reported a pet</h1>
    <p style="margin:0 0 20px; font-size:16px; line-height:1.5;">
        Thank you. Our staff will review your report. Please keep your phone reachable.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8ec; border:1px solid #e6ded2; border-radius:12px; margin:0 0 20px;">
        @foreach ($details['rows'] as $label => $value)
            <tr>
                <td valign="top" style="padding:10px 14px; width:38%; font-size:14px; font-weight:700; color:#4d2a00; border-bottom:1px solid #f0e6d2;">{{ $label }}</td>
                <td valign="top" style="padding:10px 14px; font-size:16px; line-height:1.4; color:#2f271f; border-bottom:1px solid #f0e6d2;">{!! nl2br(e($value)) !!}</td>
            </tr>
        @endforeach
    </table>
    <p style="margin:0; font-size:14px; line-height:1.5; color:#756b61;">
        Need to reach us? The pound&rsquo;s contact details are below.
    </p>
@endsection
