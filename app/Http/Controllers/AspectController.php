<?php

namespace App\Http\Controllers;

use App\Models\Aspect;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.weight' => 'required|numeric|min:1',
            'questions.*.is_mandatory' => 'required|boolean',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.option_text' => 'required_with:questions.*.options|string|max:255',
            'questions.*.options.*.score' => 'required_with:questions.*.options|numeric',
            'questions.*.visibility_rules' => 'nullable|array',
            'questions.*.visibility_rules.*.description' => 'nullable|string',
            'questions.*.visibility_rules.*.source_type' => 'required_with:questions.*.visibility_rules|in:borrower_detail,borrower_facility,answer',
            'questions.*.visibility_rules.*.source_field' => 'required_with:questions.*.visibility_rules|string',
            'questions.*.visibility_rules.*.operator' => 'required_with:questions.*.visibility_rules|string',
            'questions.*.visibility_rules.*.value' => 'required_with:questions.*.visibility_rules|string',
        ]);

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
    }

    public function show(Aspect $aspect)
    {
        $aspect->load(['aspectVersions.questionVersions.questionOptions', 'aspectVersions.questionVersions.visibilityRules']);

        return Inertia::render('aspect/show', [
            'aspect' => $aspect
        ]);
    }

    public function edit(Aspect $aspect)
    {
        $aspect->load(['aspectVersions.questionVersions.questionOptions', 'aspectVersions.questionVersions.visibilityRules']);

        return Inertia::render('aspect/edit', [
            'aspect' => $aspect
        ]);
    }

    public function update(Request $request, Aspect $aspect)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.weight' => 'required|numeric|min:1',
            'questions.*.is_mandatory' => 'required|boolean',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.option_text' => 'required_with:questions.*.options|string|max:255',
            'questions.*.options.*.score' => 'required_with:questions.*.options|numeric',
            'questions.*.visibility_rules' => 'nullable|array',
            'questions.*.visibility_rules.*.description' => 'nullable|string',
            'questions.*.visibility_rules.*.source_type' => 'required_with:questions.*.visibility_rules|in:borrower_detail,borrower_facility,answer',
            'questions.*.visibility_rules.*.source_field' => 'required_with:questions.*.visibility_rules|string',
            'questions.*.visibility_rules.*.operator' => 'required_with:questions.*.visibility_rules|string',
            'questions.*.visibility_rules.*.value' => 'required_with:questions.*.visibility_rules|string',
        ]);

        DB::transaction(function () use ($validated, $aspect) {
            $lastVersion = $aspect->aspectVersions()->latest('version_number')->first();
            $newVersionNumber = $lastVersion ? $lastVersion->version_number + 1 : 1;

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
    }

    public function destroy(Aspect $aspect)
    {
        $aspect->delete();

        return redirect()->route('aspects.index')->with('success', 'Aspek berhasil dihapus.');
    }
}
