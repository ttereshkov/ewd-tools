<?php

namespace App\Services;

use App\Models\ReportAudit;
use App\Models\User;
use Closure;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BaseService
{
    /**
     * Menjalankan sebuah closure di dalam database transaction.
     * 
     * @param Closure $callback Logika yang akan dijalankan.
     * @param int $attempts Jumlah retry jika terjadi deadlock.
     * @return mixed
     * @throws Throwable
     */
    protected function tx(Closure $callback, int $attempts = 1)
    {
        return DB::transaction($callback, $attempts);
    }

    /**
     * Otorisasi dengan dukungan overloading untuk fleksibilitas pemanggilan.
     * 
     * @param User|string|null $actorOrPermission Pengguna yang melakukan aksi atau permission string.
     * @param string|null $permission Izin yang dibutuhkan (jika parameter pertama adalah User).
     * @throws AuthorizationException Jika otorisasi gagal.
     */
    protected function authorize($actorOrPermission, ?string $permission = null): void
    {
        // Jika hanya satu parameter (permission string), gunakan Auth::user()
        if (is_string($actorOrPermission) && $permission === null) {
            $actor = Auth::user();
            $permission = $actorOrPermission;
        }
        // Jika dua parameter (user, permission)
        elseif ($actorOrPermission instanceof User && is_string($permission)) {
            $actor = $actorOrPermission;
        }
        // Parameter tidak valid
        else {
            throw new AuthorizationException('Parameter authorize tidak valid.');
        }

        if (!$actor) {
            throw new AuthorizationException('Aksi ini membutuhkan pengguna yang terautentikasi.');
        }

        if (!$actor->can($permission)) {
            $message = "Akses ditolak. Dibutuhkan izin: ${permission}";
            throw new AuthorizationException($message);
        }
    }

    /**
     * Mencatat audit log.
     * 
     * @param User|null $actor Pengguna yang melakukan aksi.
     * @param array $data Data audit yang akan dicatat.
     */
    protected function audit(?User $actor, array $data): void
    {
        try {
            $auditData = array_merge([
                'user_id' => $actor?->id,
                'source' => app()->runningInConsole() ? 'CLI' : 'HTTP',
            ], $data);

            ReportAudit::create($auditData);
        } catch (Exception $e) {
            Log::error('Gagal mencatat audit: ' . $e->getMessage(), [
                'data' => $data,
                'user_id' => $actor?->id,
            ]);
        }
    }
}