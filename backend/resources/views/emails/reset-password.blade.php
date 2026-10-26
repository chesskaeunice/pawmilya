<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset Request</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f4ec; font-family:Arial, Helvetica, sans-serif; color:#2f271f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f4ec; padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border:1px solid #e6ded2; border-radius:16px; overflow:hidden;">
                    <tr>
                        <td style="background-color:#4d2a00; padding:22px 28px; border-bottom:4px solid #f2a900;">
                            <span style="font-size:24px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">PAWmilya</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 28px 8px;">
                            <h1 style="margin:0 0 16px; font-size:22px; line-height:1.3; color:#4d2a00;">Password Reset Request</h1>
                            <p style="margin:0 0 12px; font-size:16px; line-height:1.5;">Hello {{ $name }},</p>
                            <p style="margin:0 0 24px; font-size:16px; line-height:1.5;">
                                Click the button below to reset your password.
                                This link is valid for {{ $minutes }} minutes.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 28px 28px;">
                            <a href="{{ $url }}" style="display:inline-block; padding:14px 32px; background-color:#4d2a00; color:#ffffff; font-size:16px; font-weight:700; text-decoration:none; border-radius:999px;">Reset Password</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 28px 28px;">
                            <p style="margin:0 0 8px; font-size:14px; line-height:1.5; color:#756b61;">
                                If the button does not work, copy this link into your browser:
                            </p>
                            <p style="margin:0 0 20px; font-size:13px; line-height:1.5; word-break:break-all;">
                                <a href="{{ $url }}" style="color:#cc6f00;">{{ $url }}</a>
                            </p>
                            <p style="margin:0; font-size:14px; line-height:1.5; color:#756b61;">
                                If you did not ask for this, you can ignore this email. Your password will not change.
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin:16px 0 0; font-size:13px; color:#756b61;">PAWmilya &middot; Animal pound management and pet adoption</p>
            </td>
        </tr>
    </table>
</body>
</html>
