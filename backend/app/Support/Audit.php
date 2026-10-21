<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

// One place to write audit log entries: Audit::record($request, 'animal.created', $animal)
// $actor is for requests that are not authenticated yet (login, reset)
class Audit
{
    public static function record(Request $request, string $action, ?Model $entity = null, array $details = [], ?User $actor = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => ($actor ?? $request->user())?->id,
            'action' => $action,
            'entity_type' => $entity ? class_basename($entity) : null,
            'entity_id' => $entity?->getKey(),
            'details' => $details ?: null,
            'ip_address' => $request->ip(),
        ]);
    }
}
