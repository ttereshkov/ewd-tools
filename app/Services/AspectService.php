<?php

namespace App\Services;

use App\Models\Aspect;
use App\Models\Question;
use App\Models\QuestionVersion;
use Illuminate\Support\Facades\DB;

class AspectService extends BaseService
{
    public function getAllAspects()
    {
        $this->authorize('view aspect');

        return Aspect::with('latestAspectVersion', 'latestAspectVersion.questionVersions')
            ->latest()
            ->get();
    }

    public function getAspectById(int $id): Aspect
    {
        $this->authorize('view aspect');

        return Aspect::with([
            'latestAspectVersion',
            'latestAspectVersion.questionVersions.questionOptions',
            'latestAspectVersion.questionVersions.visibilityRules'
        ])->findOrFail($id);
    }

    public function store(array $validated): void
    {
        $this->authorize('create aspect');

        DB::transaction(function () use ($validated) {
            $aspect = Aspect::create(['code' => $validated['code']]);

            $aspectVersion = $aspect->aspectVersions()->create([
                'version_number' => 1,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $indexToQuestionVersionIdMap = [];

            foreach ($validated['questions'] as $index => $q) {
                $question = Question::create([]);

                $questionVersion = $question->questionVersions()->create([
                    'aspect_version_id' => $aspectVersion->id,
                    'version_number' => 1,
                    'question_text' => $q['question_text'],
                    'weight' => $q['weight'],
                    'is_mandatory' => $q['is_mandatory'],
                ]);

                $indexToQuestionVersionIdMap[$index] = $questionVersion->id;

                if (!empty($q['options'])) {
                    foreach ($q['options'] as $opt) {
                        $questionVersion->questionOptions()->create([
                            'option_text' => $opt['option_text'],
                            'score' => $opt['score']
                        ]);
                    };
                }
            }

            foreach ($validated['questions'] as $index => $q) {
                if (!empty($q['visibility_rules'])) {
                    $questionVersionId = $indexToQuestionVersionIdMap[$index];
                    $questionVersion = QuestionVersion::find($questionVersionId);

                    $translatedRules = [];

                    foreach ($q['visibility_rules'] as $rule) {
                        if ($rule['source_type'] === 'answer') {
                            $sourceIndex = (int)$rule['source_field'];
                            $rule['source_field'] = $indexToQuestionVersionIdMap[$sourceIndex];
                        }
                        $translatedRules[] = $rule;
                    }
                    $questionVersion->visibilityRules()->createMany($translatedRules);
                }
            }
        });
    }

    public function update(array $validated, Aspect $aspect): void
    {
        $this->authorize('update aspect');

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
    }

    public function destroy(Aspect $aspect): void
    {
        $this->authorize('delete aspect');
        $aspect->delete();
    }
}