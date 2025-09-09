<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAspectRequest;
use App\Http\Requests\UpdateAspectRequest;
use App\Models\Aspect;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class AspectController extends Controller
{
    public function index()
    {
        $aspects = Aspect::with('latestAspectVersion','latestAspectVersion.questionVersions')->latest()->get();

        return Inertia::render('aspect/index', [
            'aspects' => $aspects
        ]);
    }

    public function create()
    {
        return Inertia::render('aspect/create');
    }

    public function store(StoreAspectRequest $request)
    {
        try {
            $validated = $request->validated();

            DB::transaction(function () use ($validated) {
                $aspect = Aspect::create(['code' => $validated['code']]);

                $aspectVersion = $aspect->aspectVersions()->create([
                    'version_number' => 1,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                foreach ($validated['questions'] as $q) {
                    $question = Question::create([]);

                    $questionVersion = $question->questionVersions()->create([
                        'aspect_version_id' => $aspectVersion->id,
                        'version_number' => 1,
                        'question_text' => $q['question_text'],
                        'weight' => $q['weight'],
                        'is_mandatory' => $q['is_mandatory'],
                    ]);

                    if (!empty($q['options'])) {
                        foreach ($q['options'] as $opt) {
                            $questionVersion->questionOptions()->create([
                                'option_text' => $opt['option_text'],
                                'score' => $opt['score'],
                            ]);
                        }
                    }

                    if (!empty($q['visibility_rules'])) {
                        $questionVersion->visibilityRules()->createMany($q['visibility_rules']);
                    }
                }
            });

            return redirect()->route('aspects.index')->with('success', 'Aspek berhasil dibuat.');
        } catch (Throwable $e) {
            Log::error('Error storing aspect', ['exception' => $e]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    public function show(Aspect $aspect)
    {
        $aspect->load(['latestAspectVersion','latestAspectVersion.questionVersions', 'latestAspectVersion.questionVersions.questionOptions', 'latestAspectVersion.questionVersions.visibilityRules']);

        return Inertia::render('aspect/show', [
            'aspect' => $aspect
        ]);
    }

    public function edit(Aspect $aspect)
    {
        $aspect->load(['latestAspectVersion','latestAspectVersion.questionVersions', 'latestAspectVersion.questionVersions.questionOptions', 'latestAspectVersion.questionVersions.visibilityRules']);

        return Inertia::render('aspect/edit', [
            'aspect' => $aspect
        ]);
    }

    public function update(UpdateAspectRequest $request, Aspect $aspect)
    {
        try {
            $validated = $request->validated();

            DB::transaction(function () use ($validated, $aspect) {
                $latestVersion = $aspect->aspectVersions()->latest('version_number')->first();
                $newVersionNumber = $latestVersion ? $latestVersion->version_number + 1 : 1;

                $aspectVersion = $aspect->aspectVersions()->create([
                    'version_number' => $newVersionNumber,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                foreach ($validated['questions'] as $q) {
                    $question = Question::create([]);

                    $questionVersion = $question->questionVersions()->create([
                        'aspect_version_id' => $aspectVersion->id,
                        'version_number' => 1,
                        'question_text' => $q['question_text'],
                        'weight' => $q['weight'],
                        'is_mandatory' => $q['is_mandatory'],
                    ]);

                    if (!empty($q['options'])) {
                        foreach ($q['options'] as $opt) {
                            $questionVersion->questionOptions()->create([
                                'option_text' => $opt['option_text'],
                                'score' => $opt['score'],
                            ]);
                        }
                    }

                    if (!empty($q['visibility_rules'])) {
                        $questionVersion->visibilityRules()->createMany($q['visibility_rules']);
                    }
                }
            });

            return redirect()->route('aspects.index')->with('success', 'Aspek berhasil diperbarui.');
        } catch (Throwable $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    public function destroy(Aspect $aspect)
    {
        $aspect->delete();

        return redirect()->route('aspects.index')->with('success', 'Aspek berhasil dihapus.');
    }
}