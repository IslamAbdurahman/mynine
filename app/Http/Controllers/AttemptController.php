<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptRequest;
use App\Http\Requests\UpdateAttemptRequest;
use App\Models\Attempt;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttemptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->per_page === 'all' ? 99999 : ($request->per_page ?? 10);

        $data = Attempt::with([

        ])->orderBy('id', 'desc');

        if (!Auth::user()->hasRole('Admin')) {
            $data = $data->where(function ($query) {
                $query->where('user_id', Auth::id())
                    ->orWhereHas('mock', function ($q) {
                        $q->where('user_id', Auth::id());
                    });
            });
        }

        if ($request->from && $request->to) {
            $data->whereBetween('created_at', [$request->from, $request->to]);
        }

        if ($request->user_id) {
            $data->where(function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            });
        }

        if ($request->mock_id) {
            $data->where(function ($query) use ($request) {
                $query->where('mock_id', $request->mock_id);
            });
        }

        if ($request->test_id) {
            $data->where(function ($query) use ($request) {
                $query->where('test_id', $request->test_id);
            });
        }

        if ($request->search) {
            $data = $data->where(function ($query) use ($request) {
                $query->whereHas('test', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                })
                    ->orWhereHas('mock', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%')
                            ->orWhere('email', 'like', '%' . $request->search . '%');
                    });
            });
        }

        $data = $data->paginate($per_page);

        // Filter dropdown options for search
        $users_query = \App\Models\User\User::select('id', 'name');
        $mocks_query = \App\Models\Mock::select('id', 'name');
        $tests_query = \App\Models\Test::select('id', 'name');

        if (Auth::user()->hasRole('Teacher')) {
            $users_query->where('user_id', Auth::id())
                ->orWhere('ref_telegram_id', Auth::user()->telegram_id)
                ->orWhere('id', Auth::id());
            $mocks_query->where('user_id', Auth::id());
            $tests_query->whereHas('folder', function ($q) {
                $q->where('user_id', Auth::id());
            });
        } elseif (!Auth::user()->hasRole('Admin')) {
            $users_query->where('id', Auth::id());
            $mocks_query->where('active', 1);
            $tests_query->where('active', 1)->where('open', 1);
        }

        return Inertia::render('attempt/index', [
            'attempt' => $data,
            'users' => $users_query->get(),
            'mocks' => $mocks_query->get(),
            'tests' => $tests_query->get(),
            'isAdmin' => Auth::user()->hasRole('Admin'),
            'filters' => $request->only(['search', 'user_id', 'mock_id', 'test_id', 'from', 'to', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttemptRequest $request)
    {
        try {

            if (!$request->mock_id) {
                $active = Attempt::where('user_id', Auth::id())
                    ->where('finished_at', null)
                    ->first();

                if ($active) {
                    throw new \Exception('You have an active attempt. Please finish it before starting a new one. Check menu `My result`.');
                }
            }

            $data = $request->validated();
            $data['user_id'] = Auth::id();
            $data['started_at'] = date("Y-m-d H:i:s");
            $data['status'] = 1;

            $attempt = Attempt::create($data);

            return redirect()->route('practice.index', ['attempt_id' => $attempt->id]);

        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Attempt $attempt)
    {
        // Append attempt_parts only for detail view
        $attempt->attempt_types->each(function ($attemptType) {
            $attemptType->append('attempt_parts');
        });

        return Inertia::render('attempt/show', [
            'attempt' => $attempt
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function pdf(Attempt $attempt)
    {
        ini_set('memory_limit', '1024M');
        ini_set('max_execution_time', '300');


//        return Inertia::render('attempt/show', [
//            'attempt' => $attempt
//        ]);

        $attempt = $attempt->load([
            'attempt_types' => function ($query) {
                $query->whereHas('type', function ($q) {
//                    $q->whereNot('name', 'Speaking');
                });
            }
        ]);

        // Append attempt_parts for PDF view
        $attempt->attempt_types->each(function ($attemptType) {
            $attemptType->append('attempt_parts');
        });

//        dd($attempt->attempt_types[0]->attempt_parts);


//        return view('pdf.attempt', compact('attempt'));

        $options = [
            'isPhpEnabled' => true,
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
            'isFontSubsettingEnabled' => true,
            'isUnicodeEnabled' => true,
            'defaultFont' => 'DejaVu Sans',
        ];


        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(view('pdf.attempt', compact('attempt'))->render());
        $dompdf->setPaper('A4');
        $dompdf->render();


        // Add page numbers to the footer
        $canvas = $dompdf->getCanvas();
        $canvas->page_text(520, 800, "{PAGE_NUM} / {PAGE_COUNT}", null, 12, array(0, 0, 0));

        $filename = "Attempt_{$attempt->id}_" . $attempt->created_at->format('Y-m-d_H-i');

        $dompdf->stream($filename . '.pdf');

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attempt $attempt)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttemptRequest $request, Attempt $attempt)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attempt $attempt)
    {
        try {
            $attempt->delete();
            return back()->with('success', __('deleted_successfully'));
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
