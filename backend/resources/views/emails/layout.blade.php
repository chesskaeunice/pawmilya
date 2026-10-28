@php
    // Embedded (cid) so the logo shows in Gmail; the browser preview uses a plain URL
    $logoSrc = (isset($message) && empty($previewing))
        ? $message->embed(public_path('images/website-logo.png'))
        : url('images/website-logo.png');
    $pound = \App\Support\SiteContent::publicPayload()['pound'] ?? [];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'PAWmilya')</title>
</head>
<body style="margin:0; padding:0; background-color:#fff8ec; font-family:Arial, Helvetica, sans-serif; color:#2f271f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8ec; padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
                    <tr>
                        <td align="center" style="padding:0 0 20px;">
                            <img src="{{ $logoSrc }}" alt="PAWmilya" width="220" style="display:block; width:220px; max-width:70%; height:auto; border:0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ffffff; border:1px solid #e6ded2; border-top:4px solid #f2a900; border-radius:16px; padding:32px 28px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:20px 12px 0;">
                            <p style="margin:0 0 6px; font-size:14px; font-weight:700; color:#4d2a00;">PAWmilya - Rescue - Reunite - Rehome</p>
                            @if (! empty($pound['name']) || ! empty($pound['phone']) || ! empty($pound['email']))
                                <p style="margin:0; font-size:13px; line-height:1.6; color:#756b61;">
                                    {{ $pound['name'] ?? '' }}
                                    @if (! empty($pound['address']))<br>{{ $pound['address'] }}@endif
                                    @if (! empty($pound['phone']))<br>{{ $pound['phone'] }}@endif
                                    @if (! empty($pound['email']))<br>{{ $pound['email'] }}@endif
                                </p>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
