<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Period;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index(Request $request)
    {
        $borrowers = Borrower::all();
        $period = Period::getActivePeriod();

        $borrowerData = session('borrower_data', $request->input('borrower_data', []));
        $facilityData = session('facility_data', $request->input('facility_data', []));

        $finalTemplateId = Template::getApplicableTemplateId($borrowerData, $facilityData);
        $aspectGroups = [];

        if ($finalTemplateId) {
            $template = Template::with([
                'latestTemplateVersion.aspectVersions.questionVersions.questionOptions',
                'latestTemplateVersion.aspectVersions.questionVersions.visibilityRules',
                'latestTemplateVersion.aspectVersions.visibilityRules',
                'latestTemplateVersion.visibilityRules'
            ])->find($finalTemplateId);

            if ($template && $template->latestTemplateVersion) {
                $aspectGroups = $template->latestTemplateVersion->getVisibleAspectGroups($borrowerData, $facilityData);
            }
        }

        return Inertia::render('form/index', [
            'borrowers' => $borrowers,
            'period' => $period,
            'template_id' => $finalTemplateId,
            'aspect_groups' => $aspectGroups,
            'borrower_data' => $borrowerData,
            'facility_data' => $facilityData,
        ]);
    }
}
