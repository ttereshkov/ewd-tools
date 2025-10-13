<?php

namespace App\Providers;

use App\Models\Approval;
use App\Models\ReportSummary;
use App\Observers\ApprovalObserver;
use App\Observers\SummaryObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ReportSummary::observe(SummaryObserver::class);
        Approval::observe(ApprovalObserver::class);
    }
}
