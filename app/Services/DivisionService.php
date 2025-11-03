<?php

namespace App\Services;

use App\Models\Division;

class DivisionService extends BaseService
{
    public function paginateDivisions(array $filters = [], int $perPage = 15)
    {
        $this->authorize('view division');

        $query = Division::query()->latest();

        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        return $query->paginate($perPage);
    }

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

        return $division;
    }

    public function update(Division $division, array $data): Division
    {
        $this->authorize('update division');

        $division->update($data);


        return $division;
    }

    public function destroy(Division $division): void
    {
        $this->authorize('delete division');

        $division->delete();

    }
}