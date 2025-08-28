<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        $divisions = Division::latest()->get();

        return Inertia::render('division/index', [
            'divisions' => $divisions,
        ]);
    }

    public function create()
    {
        return Inertia::render('division/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:3|unique:divisions,code',
            'name' => 'required|string|max:255',
        ]);

        Division::create($validated);
    }

    public function show(Division $division)
    {
        return Inertia::render('division/show', [
            'division' => $division,        
        ]);
    }

    public function edit(Division $division)
    {
        return Inertia::render('division/edit', [
            'division' => $division,
        ]);
    }

    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:divisions,code,' . $division->id,
            'name' => 'required|string|max:100',
        ]);

        $division->update($validated);
    }

    public function destroy(Division $division)
    {
        $division->delete();
    }

}
