<?php

namespace App\Services;

use App\Models\User;

class UserService extends BaseService
{
    public function getAllUsers()
    {
        $this->authorize('view user');

        return User::with(['division','role'])->latest()->get();
    }

    public function getUserById(int $id): User
    {
        $this->authorize('view user');

        return User::findOrFail($id);
    }

    public function store(array $data): User
    {
        $this->authorize('create user');

        $user = User::create($data);

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $this->authorize('update user');

        $user->update($data);

        return $user;
    }

    public function destroy(User $user): void
    {
        $this->authorize('delete user');

        $user->delete();
    }
}