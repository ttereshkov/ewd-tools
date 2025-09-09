<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTemplateRequest;
use App\Models\Aspect;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class TemplateController extends Controller
{
    public function index() 
    {
        $templates = Template::with('latestTemplateVersion.aspects')->latest()->get();

        return Inertia::render('template/index', [
            'templates' => $templates,
        ]);
    }

    public function create() 
    {
        $aspects = Aspect::with('latestAspectVersion')->get();

        return Inertia::render('template/create', [
            'aspects' => $aspects,
        ]);
    }

    public function store(StoreTemplateRequest $request)
    {
        try {
            $validated = $request->validated();

            DB::transaction(function () use ($validated) {
                $template = Template::create([]);

                $templateVersion = $template->templateVersions()->create([
                    'version_number' => 1,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                if (!empty($validated['selected_aspects'])) {
                    foreach ($validated['selected_aspects'] as $aspectData) {
                        $templateVersion->aspects()->attach($aspectData['id'], ['weight' => $aspectData['weight']]);
                    }
                }

                if (!empty($validated['visibility_rules'])) {
                    $templateVersion->visibilityRules()->createMany($validated['visibility_rules']);
                }
            });

            return redirect()->route('templates.index')->with('success', "Template berhasil dibuat.");
        } catch (Throwable $e) {
            Log::error('Error storing template', ['exception' => $e]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    public function show(Template $template)
    {
        $template->load(['latestTemplateVersion.aspects', 'latestTemplateVersion.visibilityRules']);

        return Inertia::render('template/show', [
            'template' => $template
        ]);
    }
}
