<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Models\Period;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodController extends Controller
{
    public function index()
    {
        $periods = Period::getAllPeriods();

        return Inertia::render('period/index', [
            'periods' => $periods,
        ]);
    }

    public function create()
    {
        return Inertia::render('period/create');
    }

    public function store(StorePeriodRequest $request)
    {
        $validated = $request->validated();

        $period = new Period();
        $period->createPeriod($validated);

        return redirect()->route('periods.index')->with('success', 'Periode berhasil dibuat.');
    }

    public function show(Period $period)
    {
        $period->load('createdBy');

        return Inertia::render('period/show', [
            'period' => $period,
            'is_active' => $period->isActive(),
            'remaining_time' =>$period->getRemainingTime()
        ]);
    }

    public function edit(Period $period)
    {
        $period->load('createdBy');

        return Inertia::render('period/edit', [
            'period' => $period
        ]);
    }

    public function update(UpdatePeriodRequest $request, Period $period)
    {
        $validated = $request->validated();
        
        $period->updatePeriod($validated);

        return redirect()->route('periods.index')->with('success', 'Periode berhasil diperbarui.');
    }

    public function destroy(Period $period)
    {
        $period->deletePeriod();

        return redirect()->route('periods.index')->with('success', 'Periode berhasil dihapus.');
    }

    public function start(Period $period)
    {
        try {
            $period->markAsActive();
            return redirect()->back()->with('success', 'Periode berhasil dimulai.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function stop(Period $period)
    {
        try {
            $period->markAsEnded();
            return redirect()->back()->with('success', 'Periode berhasil diakhiri.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengakhiri periode.');
        }
    }
}
