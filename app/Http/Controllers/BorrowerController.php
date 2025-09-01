<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BorrowerController extends Controller
{
    public function index()
    {
        $borrowers = Borrower::latest()->get();

        return Inertia::render('borrower/index', [
            'borrowers' => $borrowers->load('division'),
        ]);
    }

    public function create()
    {
        $divisions = Division::latest()->get();

        return Inertia::render('borrower/create', [
            'divisions' => $divisions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        Borrower::create($validated);
    }

    public function show(Borrower $borrower)
    {
        return Inertia::render('borrower/show', [
            'borrower' => $borrower->load('division'),
        ]);
    }

    public function edit(Borrower $borrower)
    {
        $divisions = Division::latest()->get();

        return Inertia::render('borrower/edit', [
            'borrower' => $borrower->load('division'),
            'divisions' => $divisions
        ]);
    }

    public function update(Request $request, Borrower $borrower)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $borrower->update($validated);
    }

    public function destroy(Borrower $borrower)
    {
        $borrower->delete();
    }
}
