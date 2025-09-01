<?php
namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('division')->latest()->get();

        return Inertia::render('user/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $divisions = Division::latest()->get();

        return Inertia::render('user/create', [
            'divisions' => $divisions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        User::create($validated);
    }

    public function show(User $user)
    {
        return Inertia::render('user/show', [
            'user' => $user->load('division'),        
        ]);
    }

    public function edit(User $user)
    {
        $divisions = Division::latest()->get();

        return Inertia::render('user/edit', [
            'user' => $user->load('division'),
            'divisions' => $divisions,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        };

        $user->update($validated);
    }

    public function destroy(User $user)
    {
        $user->delete();
    }
}
