<?php

namespace Database\Factories\Firm;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Firm\Firm>
 */
class FirmFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            'address' => $this->faker->address,
            'branch_limit' =>5,
            'branch_price'=>5,
            'valid_date'=>date('Y-m-d'),
            'status' => 1,
        ];
    }
}
