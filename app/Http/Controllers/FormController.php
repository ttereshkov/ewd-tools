<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Borrower;
use App\Models\BorrowerDetail;
use App\Models\BorrowerFacility;
use App\Models\Period;
use App\Models\Report;
use App\Models\Template;
use App\ReportStatus;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'informationBorrower.borrowerId' => 'required|exists:borrowers,id',
            'informationBorrower.borrowerGroup' => 'nullable|string',
            'informationBorrower.purpose' => 'required|in:both,kie,kmke',
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
            'reportMeta.period_id' => 'required|exists:periods,id'
        ]);

        DB::beginTransaction();
        try {
            $borrowerId = $validated['informationBorrower']['borrowerId'];
            $informationData = $validated['informationBorrower'];

            BorrowerDetail::updateOrCreate(
                ['borrower_id' => $borrowerId],
                [
                    'borrower_group' => $informationData['borrowerGroup'],
                    'purpose' => $informationData['purpose'],
                    'economic_sector' => $informationData['economicSector'],
                    'business_field' => $informationData['businessField'],
                    'borrower_business' => $informationData['borrowerBusiness'],
                    'collectibility' => $informationData['collectibility'],
                    'restructuring' => $informationData['restructuring'],
                ]
            );

            BorrowerFacility::where('borrower_id', $borrowerId)->delete();
            foreach ($validated['facilitiesBorrower'] as $facility) {
                BorrowerFacility::create([
                    'borrower_id' => $borrowerId,
                    'facility_name' => $facility['name'],
                    'limit' => $facility['limit'],
                    'outstanding' => $facility['outstanding'],
                    'interest_rate' => $facility['interestRate'],
                    'principal_arrears' => $facility['principalArrears'],
                    'interest_arrears' => $facility['interestArrears'],
                    'pdo_days' => $facility['pdo'],
                    'maturity_date' => $facility['maturityDate'],
                ]);
            }

            $report = Report::create([
                'borrower_id' => $borrowerId,
                'template_id' => $validated['reportMeta']['template_id'],
                'period_id' => $validated['reportMeta']['period_id'],
                'status' => ReportStatus::SUBMITTED->value,
                'created_by' => Auth::id(),
            ]);

            foreach ($validated['aspectsBorrower'] as $aspectAnswer) {
                Answer::create([
                    'report_id' => $report->id,
                    'question_version_id' => $aspectAnswer['questionId'],
                    'question_option_id' => $aspectAnswer['selectedOptionId'],
                    'notes' => $aspectAnswer['notes'] ?? null
                ]);
            }

            $report->calculateAndStoreSummary();
            $report->submitted_at = now();
            $report->created_by = Auth::id();
            $report->save();

            DB::commit();

            Session::forget(['borrower_data', 'facility_data']);

            return Inertia::location(route('summary.show', ['report' => $report->id]));
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan data form: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
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
