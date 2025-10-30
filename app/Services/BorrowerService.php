<?php

namespace App\Services;

use App\Models\Borrower;

class BorrowerService extends BaseService
{
    public function getAllBorrowers($perPage = 15)
    {
        $this->authorize('view borrower');

        return Borrower::with('division')
            ->latest()
            ->paginate($perPage);
    }

    public function getBorrowerById(int $id): Borrower
    {
        $this->authorize('view borrower');

        return Borrower::with('division')->findOrFail($id);
    }

    public function store(array $data): Borrower
    {
        $this->authorize('create borrower');

        $borrower = Borrower::create($data);

        return $borrower;
    }

    public function update(Borrower $borrower, array $data): Borrower
    {
        $this->authorize('update borrower');

        $borrower->update($data);

        return $borrower;
    }

    public function destroy(Borrower $borrower): void
    {
        $this->authorize('delete borrower');

        $borrower->delete();
    }
}