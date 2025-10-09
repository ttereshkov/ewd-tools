<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Http\Requests\BorrowerRequest;
use App\Services\BorrowerService;
use App\Services\DivisionService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Exception;

class BorrowerController extends Controller
{
    protected BorrowerService $borrowerService;
    protected DivisionService $divisionService;

    public function __construct(
        BorrowerService $borrowerService,
        DivisionService $divisionService,
    ) {
        $this->borrowerService = $borrowerService;
        $this->divisionService = $divisionService;
    }

    public function index()
    {
        try {
            $borrowers = $this->borrowerService->getAllBorrowers();
            return Inertia::render('borrower/index', [
                'borrowers' => $borrowers
            ]);
        } catch (Exception $e) {
            Log::error('Gagal memuat borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat borrower.');
        }
    }

    public function create()
    {
        try {
            $divisions = $this->divisionService->getAllDivisions();
            return Inertia::render('borrower/create', [
                'divisions' => $divisions
            ]);
        } catch (Exception $e) {
            Log::error('Gagal memuat form borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat form.');
        }
    }

    public function store(BorrowerRequest $request)
    {
        try {
            $this->borrowerService->store($request->validated());
            return redirect()->route('borrower.index')->with('success', 'Borrower berhasil ditambahkan.');
        } catch (Exception $e) {
            Log::error('Gagal menyimpan borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menyimpan borrower.');
        }
    }

    public function show(Borrower $borrower)
    {
        try {
            $data = $this->borrowerService->getBorrowerById($borrower->id);
            return Inertia::render('borrower/show', [
                'borrower' => $data,
            ]);
        } catch (Exception $e) {
            Log::error('Gagal menampilkan borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat borrower.');
        }
    }

    public function edit(Borrower $borrower)
    {
        try {
            $divisions = $this->divisionService->getAllDivisions();
            return Inertia::render('borrower/edit', [
                'borrower' => $borrower->load('division'),
                'divisions' => $divisions,
            ]);
        } catch (Exception $e) {
            Log::error('Gagal memuat form edit borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memuat form edit borrower.');
        };
    }

    public function update(BorrowerRequest $request, Borrower $borrower)
    {
        try {
            $this->borrowerService->update($borrower, $request->validated());
            return redirect()->route('borrowers.index')->with('success', 'Borrower berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Gagal memperbarui borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat memperbarui borrower.');
        }
    }

    public function destroy(Borrower $borrower)
    {
        try {
            $this->borrowerService->destroy($borrower);
            return redirect()->route('borrowers.index')->with('success', 'Borrower berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Gagal menghapus borrower: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat menghapus borrower.');
        }
    }
}
