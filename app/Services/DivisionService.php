<?php

namespace App\Services;

use App\Models\Division;

class DivisionService extends BaseService
{
    public function getAllDivisions()
    {
        $this->authorize('view division');

        return Division::latest()->get();
    }

    public function getDivisionById(int $id): Division
    {
        $this->authorize('view division');

        return Division::findOrFail($id);
    }

    public function store(array $data): Division
    {
        $this->authorize('create division');

        $division = Division::create($data);

        $this->audit('division', $division->id, 'created', $data);

        return $division;
    }

    public function update(Division $division, array $data): Division
    {
        $this->authorize('update division');

        $division->update($data);

        $this->audit('division', $division->id, 'updated', $data);

        return $division;
    }

    public function destroy(Division $division): void
    {
        $this->authorize('delete division');

        $division->delete();

        $this->audit('division', $division->id, 'deleted');
    }
}