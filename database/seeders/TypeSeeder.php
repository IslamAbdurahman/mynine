<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Type;

class TypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Listening',
            'Reading',
            'Writing',
            'Speaking',
        ];

        foreach ($types as $type) {
            Type::firstOrCreate(
                ['name' => $type], // Search condition
                [
                    'name' => $type,
                    'minute' => 60
                ]  // Attributes to insert if not found
            );
        }
    }
}
