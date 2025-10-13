<?php

namespace Database\Seeders;

use App\Models\Aspect;
use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aspects = Aspect::all()->keyBy('code');

        $questions = [
            // Aspek A - Hukum
            [
                'aspect_code' => 'A',
                'code' => 'A.1',
                'text' => 'Apakah legalitas dan perijinan nasabah masih berlaku?',
                'weight' => 0.15,
                'type' => 'mandatory'
            ],
            [
                'aspect_code' => 'A',
                'code' => 'A.2',
                'text' => 'Apakah ada tuntutan atau masalah hukum terhadap nasabah?',
                'weight' => 0.20,
                'type' => 'mandatory'
            ],
            [
                'aspect_code' => 'A',
                'code' => 'A.3',
                'text' => 'Apakah terdapat permasalahan tenaga kerja di perusahaan nasabah?',
                'weight' => 0.15,
                'type' => 'optional'
            ],
            [
                'aspect_code' => 'A',
                'code' => 'A.4',
                'text' => 'Apakah debitur memulai usaha baru tanpa persetujuan bank?',
                'weight' => 0.10,
                'type' => 'optional'
            ],

            // Aspek B - Manajemen
            [
                'aspect_code' => 'B',
                'code' => 'B.1',
                'text' => 'Apakah struktur organisasi perusahaan telah sesuai dengan kebutuhan?',
                'weight' => 0.15,
                'type' => 'mandatory'
            ],
            [
                'aspect_code' => 'B',
                'code' => 'B.2',
                'text' => 'Apakah pengalaman dan kompetensi manajemen memadai?',
                'weight' => 0.20,
                'type' => 'mandatory'
            ],

            // Aspek C - Keuangan
            [
                'aspect_code' => 'C',
                'code' => 'C.1',
                'text' => 'Apakah profitabilitas perusahaan menunjukkan tren positif?',
                'weight' => 0.25,
                'type' => 'mandatory'
            ],
            [
                'aspect_code' => 'C',
                'code' => 'C.2',
                'text' => 'Apakah arus kas operasional positif dan stabil?',
                'weight' => 0.25,
                'type' => 'mandatory'
            ],

            // Aspek D - Usaha
            [
                'aspect_code' => 'D',
                'code' => 'D.1',
                'text' => 'Apakah prospek usaha debitur masih menjanjikan?',
                'weight' => 0.25,
                'type' => 'mandatory'
            ],

            // Aspek E - Agunan
            [
                'aspect_code' => 'E',
                'code' => 'E.1',
                'text' => 'Apakah nilai agunan mencukupi terhadap outstanding pembiayaan?',
                'weight' => 0.30,
                'type' => 'mandatory'
            ],

            // Aspek F - Covenant
            [
                'aspect_code' => 'F',
                'code' => 'F.1',
                'text' => 'Apakah debitur memenuhi seluruh covenant pembiayaan?',
                'weight' => 0.20,
                'type' => 'mandatory'
            ],
        ];

        foreach ($questions as $q) {
            if (!isset($aspects[$q['aspect_code']])) continue;

            Question::updateOrCreate(
                ['code' => $q['code']],
                [
                    'aspect_id' => $aspects[$q['aspect_code']]->id,
                    'text' => $q['text'],
                    'weight' => $q['weight'],
                    'type' => $q['type'],
                ]
            );
        }
    }
}
