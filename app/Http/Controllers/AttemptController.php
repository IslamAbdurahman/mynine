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
        if ($request->per_page) {
            $per_page = $request->per_page;
        } else {
            $per_page = 10;
        }

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

        return Inertia::render('attempt/index', [
            'attempt' => $data
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

            $active = Attempt::where('user_id', Auth::id())
                ->where('finished_at', null)
                ->first();

            if ($active) {
                throw new \Exception('You have an active attempt. Please finish it before starting a new one. Check menu `My result`.');
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

        return Inertia::render('attempt/show', [
            'attempt' => $attempt
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function pdf(Attempt $attempt)
    {


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

        $filename = "Attempt_$attempt->id_$attempt->created_at";

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
            return back()->with('success', 'Attempt deleted successfully.');
        } catch (\Exception $e) {
            // Proper Inertia error response
            throw ValidationException::withMessages([
                'error' => [$e->getMessage()],
            ]);
        }
    }
}
