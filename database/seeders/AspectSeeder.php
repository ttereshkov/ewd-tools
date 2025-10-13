<?php

namespace Database\Seeders;

use App\Models\Aspect;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AspectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aspects = [
            [
                'code' => 'A',
                'name' => 'Aspek Hukum',
                'description' => 'Menilai kepatuhan hukum, perizinan, dan masalah legalitas nasabah.'
            ],
            [
                'code' => 'B',
                'name' => 'Aspek Manajemen',
                'description' => 'Menilai struktur organisasi, kompetensi, dan pengalaman manajemen.'
            ],
            [
                'code' => 'C',
                'name' => 'Aspek Keuangan',
                'description' => 'Menilai kinerja keuangan, profitabilitas, leverage, dan likuiditas.'
            ],
            [
                'code' => 'D',
                'name' => 'Aspek Usaha',
                'description' => 'Menilai prospek usaha dan kondisi pasar debitur.'
            ],
            [
                'code' => 'E',
                'name' => 'Aspek Agunan',
                'description' => 'Menilai kondisi, nilai, dan kecukupan agunan yang dimiliki.'
            ],
            [
                'code' => 'F',
                'name' => 'Aspek Covenant',
                'description' => 'Menilai kepatuhan debitur terhadap covenant pembiayaan.'
            ],
        ];

        foreach ($aspects as $aspect) {
            Aspect::updateOrCreate(
                ['code' => $aspect['code']],
                $aspect
            );
        }
    }
}
