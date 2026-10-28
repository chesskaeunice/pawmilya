@extends('emails.layout')

@section('title', 'Password Reset Request')

@section('content')
    <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:#4d2a00;">Password Reset Request</h1>
    <p style="margin:0 0 12px; font-size:16px; line-height:1.5;">Hello {{ $name }},</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.5;">
        Click the button below to reset your password.
        This link is valid for {{ $minutes }} minutes.
    </p>
    <p style="margin:0 0 24px; text-align:center;">
        <a href="{{ $url }}" style="display:inline-block; padding:14px 32px; background-color:#f2a900; color:#4d2a00; font-size:16px; font-weight:700; text-decoration:none; border-radius:999px;">Reset Password</a>
    </p>
    <p style="margin:0 0 8px; font-size:14px; line-height:1.5; color:#756b61;">If the button does not work, copy this link into your browser:</p>
    <p style="margin:0 0 20px; font-size:13px; line-height:1.5; word-break:break-all;">
        <a href="{{ $url }}" style="color:#cc6f00;">{{ $url }}</a>
    </p>
    <p style="margin:0; font-size:14px; line-height:1.5; color:#756b61;">
        If you did not ask for this, you can ignore this email. Your password will not change.
    </p>
@endsection
