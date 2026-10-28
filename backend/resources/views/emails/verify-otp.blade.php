@extends('emails.layout')

@section('title', 'Verify your email')

@section('content')
    <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:#4d2a00;">Verify your email</h1>
    <p style="margin:0 0 12px; font-size:16px; line-height:1.5;">Hello {{ $name }},</p>
    <p style="margin:0 0 24px; font-size:16px; line-height:1.5;">
        Welcome to PAWmilya! Enter this code to finish creating your account:
    </p>
    <p style="margin:0 0 24px; text-align:center;">
        <span style="display:inline-block; padding:14px 24px; background-color:#fff8ec; border:2px dashed #f2a900; border-radius:12px; font-size:34px; font-weight:700; letter-spacing:10px; color:#4d2a00;">{{ $code }}</span>
    </p>
    <p style="margin:0 0 12px; font-size:16px; line-height:1.5;">This code expires in {{ $minutes }} minutes and can be used once.</p>
    <p style="margin:0; font-size:14px; line-height:1.5; color:#756b61;">If you did not sign up for PAWmilya, you can ignore this email.</p>
@endsection
