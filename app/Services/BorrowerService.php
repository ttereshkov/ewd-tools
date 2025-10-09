<?php

namespace App\Services;

use App\Models\Borrower;

class BorrowerService extends BaseService
{
    public function getAllBorrowers()
    {
        $this->authorize('view borrower');

        return Borrower::with('division')
            ->latest()
            ->get();
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
        $this->audit('borrower', $borrower->id, 'created', $data);

        return $borrower;
    }

    public function update(Borrower $borrower, array $data): Borrower
    {
        $this->authorize('update borrower');

        $borrower->update($data);
        $this->audit('borrower', $borrower->id, 'updated', $data);

        return $borrower;
    }

    public function destroy(Borrower $borrower): void
    {
        $this->authorize('delete borrower');

        $borrower->delete();
        $this->audit('borrower', $borrower->id, 'deleted');
    }
}