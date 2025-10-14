<?php

namespace App\Http\Controllers;

use App\Enums\FacilityType;
use App\Models\Answer;
use App\Models\Borrower;
use App\Models\BorrowerDetail;
use App\Models\BorrowerFacility;
use App\Models\Period;
use App\Models\Report;
use App\Models\Template;
use App\ReportStatus;
use App\Services\FormService;
use App\Services\PeriodService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FormController extends Controller
{
    protected FormService $formService;
    protected PeriodService $periodService;

    public function __construct(
        FormService $formService,
        PeriodService $periodService
    ) {
        $this->formService = $formService;
        $this->periodService = $periodService;
    }

    public function index(Request $request)
    {
        if ($request->has('borrower_id')) {
            Session::forget(['borrower_data', 'facility_data']);
        }

        $borrowers = Borrower::all();
        $period = $this->periodService->getActivePeriod();

        $borrowerData = session('borrower_data', $request->input('borrower_data', []));
        $facilityData = session('facility_data', $request->input('facility_data', []));

        $finalTemplateId = Template::getApplicableTemplateId($borrowerData, $facilityData);
        $aspectGroups = [];

        if ($finalTemplateId) {
            $template = Template::with([
                'latestTemplateVersion.aspectVersions.questionVersions.questionOptions',
                'latestTemplateVersion.aspectVersions.questionVersions.visibilityRules',
                'latestTemplateVersion.aspectVersions.visibilityRules',
                'latestTemplateVersion.visibilityRules',
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
            'purpose_options' => FacilityType::options(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'informationBorrower.borrowerId' => 'required|exists:borrowers,id',
            'informationBorrower.borrowerGroup' => 'nullable|string',
            'informationBorrower.purpose' => ['required', Rule::in(FacilityType::values())],
            'informationBorrower.economicSector' => 'required|string',
            'informationBorrower.businessField' => 'required|string',
            'informationBorrower.borrowerBusiness' => 'required|string',
            'informationBorrower.collectibility' => 'required|integer|min:1|max:5',
            'informationBorrower.restructuring' => 'required|boolean',

            'facilitiesBorrower' => 'required|array|min:1',
            'facilitiesBorrower.*.name' => 'required|string',
            'facilitiesBorrower.*.limit' => 'required|numeric|min:0',
            'facilitiesBorrower.*.outstanding' => 'required|numeric|min:0',
            'facilitiesBorrower.*.interestRate' => 'required|numeric|min:0',
            'facilitiesBorrower.*.principalArrears' => 'required|numeric|min:0',
            'facilitiesBorrower.*.interestArrears' => 'required|numeric|min:0',
            'facilitiesBorrower.*.pdo' => 'required|integer|min:0',
            'facilitiesBorrower.*.maturityDate' => 'required|date',

            'aspectsBorrower' => 'required|array|min:1',
            'aspectsBorrower.*.questionId' => 'required|exists:question_versions,id',
            'aspectsBorrower.*.selectedOptionId' => 'required|exists:question_options,id',

            'reportMeta.template_id' => 'required|exists:templates,id',
            'reportMeta.period_id' => 'required|exists:periods,id',
        ]);

        try {
            $report = $this->formService->submit($validated);

            session()->forget(['borrower_data', 'facility_data']);

            return Inertia::location(route('summary.show', ['report' => $report->id]));
        } catch (Exception $e) {
            report($e);
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data.');
        }
    }

    /**
     * Melakukan
     */
    public function saveStepData(Request $request)
    {
        $borrowerData = $request->input('informationBorrower', []);
        $facilityData = $request->input('facilitiesBorrower', []);

        Session::put('borrower_data', $borrowerData);
        Session::put('facility_data', $facilityData);

        $finalTemplateId = Template::getApplicableTemplateId($borrowerData, $facilityData);
        $aspectGroups = [];

        if ($finalTemplateId) {
            $template = Template::with(['latestTemplateVersion.aspectVersions.questionVersions.questionOptions'])->find($finalTemplateId);

            if ($template && $template->latestTemplateVersion) {
                $aspectGroups = $template->latestTemplateVersion->getVisibleAspectGroups($borrowerData, $facilityData);
            }
        }

        return response()->json([
            'success' => true,
            'template_id' => $finalTemplateId,
            'aspect_groups' => $aspectGroups,
        ]);
    }
}
