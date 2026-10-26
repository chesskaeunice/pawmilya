<?php

namespace App\Console\Commands;

use App\Support\ReleaseUnclaimedReports;
use Illuminate\Console\Command;

class ReleaseUnclaimedReportsCommand extends Command
{
    protected $signature = 'reports:release-unclaimed';

    protected $description = 'Move Rescued reports whose 7-day claim period has ended to For Adoption';

    public function handle(ReleaseUnclaimedReports $service): int
    {
        $count = $service->run();

        $this->info("{$count} report(s) moved to For Adoption.");

        return self::SUCCESS;
    }
}
