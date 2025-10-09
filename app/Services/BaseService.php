<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BaseService
{
    protected function tx(Closure $callback)
    {
        return DB::transaction($callback);
    }

    protected function authorize(string $permission): void
    {
        if (!Auth::check()) {
            abort(401, 'Anda belum melakukan login.');
        }

        if (!Auth::user()->can($permission)) {
            abort(403, `Akses ditolak. Dibutuhkan izin: {$permission}`);
        }
    }

    protected function audit(string $subjectType, int|string $subjectId, string $action, array $meta = []): void
    {
        $user = Auth::user();
        
        logger()->info('[AUDIT]', [
            'subject' => "{$subjectType}#{$subjectId}",
            'action' => $action,
            'user_id' => $user->id,
            'meta' => $meta,
        ]);
    }
}