<?php

namespace Database\Seeders;

use App\Models\Day;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FunctionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Replace 'mydb' with your actual database name

        $databaseName = env('DB_DATABASE');

// Get all function names in the database
        $functions = DB::select("SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA = ?", [$databaseName]);

// Drop each function
        foreach ($functions as $function) {
            $functionName = $function->ROUTINE_NAME;
            DB::statement("DROP FUNCTION IF EXISTS $functionName");
        }

//        DB::select("
//            create
//                definer = " . env('DB_USERNAME') . "@localhost function getBalance(worker_id_ int) returns double
//            BEGIN
//
//                declare balance double;
//
//                select sum(`history`.`amount`)
//                into balance
//                from (select s.id,
//                             s.amount,
//                             s.comment,
//                             s.created_at,
//                             s.worker_id,
//                             s.id as salary_id,
//                             null as salary_payment_id
//                      from salaries s
//                      where worker_id = worker_id_
//
//                      union all
//
//                      select sp.id,
//                             -1 * sp.amount amount,
//                             sp.comment,
//                             sp.created_at,
//                             sp.worker_id,
//                             null  as       salary_id,
//                             sp.id as       salary_payment_id
//                      from salary_payments sp
//
//                      where worker_id = worker_id_) history
//                order by history.created_at desc;
//
//
//                return coalesce(balance, 0);
//
//            end;
//        ");


    }

}
