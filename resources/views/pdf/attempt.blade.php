<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ __('Attempt Report') }}</title>
    <style>
        @page {
            margin: 30px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #2d3748;
        }

        .header {
            text-align: center;
            margin-bottom: 10px;
        }

        .header h1 {
            font-size: 22px;
            color: #1a202c;
            margin: 0;
        }

        .card {
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            padding: 5px;
            margin-bottom: 25px;
            background: #f9fafb;
        }

        .card h2 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #2d3748;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 25px;
            border-radius: 6px;
            overflow: hidden;
        }

        th, td {
            padding: 3px 4px;
        }

        th {
            background: #2b6cb0;
            color: #fff;
            font-weight: bold;
            text-align: center;
        }

        td {
            border: 1px solid #cbd5e0;
        }

        tr:nth-child(even) td {
            background: #edf2f7;
        }

        .total-row {
            background: #e2e8f0 !important;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: #fff;
        }

        .badge-writing {
            background: #805ad5;
        }

        .badge-speaking {
            background: #d53f8c;
        }

        .badge-listening {
            background: #2b6cb0;
        }

        .badge-reading {
            background: #38a169;
        }

        .footer {
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #718096;
        }
    </style>
</head>
<body>

<div class="header">
    <h1>{{ __('Exam Report') }}</h1>
    <p>{{ $attempt->user->name }} | {{ $attempt->mock->name ?? '' }}</p>
</div>

<div class="card">
    <h2>{{ __('Attempt Details') }}</h2>
    <p><strong>{{ __('ID') }}:</strong> {{ $attempt->id }}</p>
    <p><strong>{{ __('User') }}:</strong> {{ $attempt->user->name }}
        ({{ $attempt->user->phone ?? $attempt->user->email }})</p>
    <p><strong>{{ __('Mock') }}:</strong> {{ $attempt->mock->name ?? '-' }}</p>
    <p><strong>{{ __('Test') }}:</strong> {{ $attempt->test->folder->name ." ".$attempt->test->name }}</p>
    <p><strong>{{ __('Started at') }}:</strong> {{ $attempt->started_at }}</p>
    <p><strong>{{ __('Finished at') }}:</strong> {{ $attempt->finished_at }}</p>
</div>

{{-- Attempt Summary --}}
<div class="card">
    <h2>{{ __('Attempt Summary') }}</h2>
    <table>
        <tr>
            <th>{{ __('Type') }}</th>
            <th>{{ __('Score / Correct') }}</th>
            <th>{{ __('Comment') }}</th>
        </tr>
        @foreach($attempt->attempt_types as $type)
            <tr>
                <td>
                    <span class="badge
                        @if($type->type->name === 'Writing') badge-writing
                        @elseif($type->type->name === 'Speaking') badge-speaking
                        @elseif($type->type->name === 'Listening') badge-listening
                        @else badge-reading @endif">
                        {{ $type->type->name }}
                    </span>
                </td>
                <td>
                    @if($type->type->name === 'Writing')
                        {{ number_format($type->is_correct_count ?? 0) / 2 }}
                    @elseif($type->type->name === 'Speaking')
                        {{ $type->score }}
                    @else
                        {{ $type->is_correct_count }}
                    @endif
                </td>
                <td>{{ $type->comment }}</td>
            </tr>
        @endforeach
    </table>
</div>

@foreach($attempt->attempt_types as $attempt_type)
    @if($attempt_type->type->name !== 'Speaking')

        <h3>{{ $attempt_type->type->name }}</h3>
        <table>
            <thead>
            <tr>
                <th>{{ __('№') }}</th>
                @if($attempt_type->type->name === 'Writing')
                    <th>{{ __('Question') }}</th>
                @endif
                <th>{{ __('Answer') }}</th>
                @if($attempt_type->type->name !== 'Writing')
                    <th>{{ __('Correct') }}</th>
                @endif
                @if($attempt_type->type->name === 'Writing')
                    <th>{{ __('Review Note AI') }}</th>
                    <th>{{ __('Score') }}</th>
                @endif
            </tr>
            </thead>
            <tbody>
            @php
                $totalScore = 0;
                $sumCorrect = 0;

                if (!function_exists('normalizeText')) {
                    function normalizeText($text) {
                        return trim(mb_strtolower($text ?? ''));
                    }
                }

            @endphp

            @foreach($attempt_type->attempt_parts ?? [] as $attemptPart)
                @php $order = (int) ($attemptPart->part->order ?? 0); @endphp

                @foreach($attemptPart->part->sections as $section)
                    @foreach($section->questions as $question)
                        @php
                            $count = (int) ($question->is_correct_count ?? 1);
                            $order += $count;
                            $globalIndex = $order;
                            $displayIndex = $count > 1 ? (($globalIndex - $count + 1) . '-' . $globalIndex) : (string) $globalIndex;
                        @endphp

                        <tr>
                            <td>{{ $displayIndex }}</td>

                            @if($attempt_type->type->name === 'Writing')
                                <td>{{ $question->textarea }}</td>
                            @endif

                            <td>
                                @if(optional($question->attempt_answer)->answer_text)
                                    <div class="whitespace-pre-wrap">{{ $question->attempt_answer->answer_text }}</div>
                                @endif

                                @if(optional($question->attempt_answer)->attempt_answer_options)
                                    @if(count($question->attempt_answer->attempt_answer_options) > 0)
                                        @foreach($question->attempt_answer->attempt_answer_options as $opt)
                                            <div>- {{ $opt->option->textarea }}</div>
                                        @endforeach
                                    @endif
                                @endif
                            </td>

                            @if($attempt_type->type->name !== 'Writing')
                                <td>
                                    @if(($question->options->count() ?? 0) === 0)
                                        @php
                                            $userAns = normalizeText(optional($question->attempt_answer)->answer_text ?? '');
                                            $correctAns = normalizeText($question->answer_text ?? '');
                                        @endphp

                                        @if($userAns === $correctAns)
                                            + @php $sumCorrect++ @endphp
                                        @else
                                            -
                                        @endif
                                    @else
                                        @foreach(optional($question->attempt_answer)->attempt_answer_options ?? [] as $opt)
                                            @if(optional($opt->option)->is_correct == 1)
                                                + @php $sumCorrect++ @endphp
                                            @else
                                                -
                                            @endif
                                        @endforeach
                                    @endif
                                </td>
                            @endif

                            @if($attempt_type->type->name === 'Writing')
                                <td style="page-break-inside:auto; white-space:normal; word-wrap:break-word;">
                                    {{ optional($question->attempt_answer)->review_note_ai }}
                                </td>
                                <td>
                                    {{ optional($question->attempt_answer)->score ?? 0 }}
                                    @php $totalScore += optional($question->attempt_answer)->score ?? 0; @endphp
                                </td>
                            @endif
                        </tr>
                    @endforeach
                @endforeach
            @endforeach

            <tr class="total-row">
                <td colspan="{{ $attempt_type->type->name === 'Writing' ? 4 : 2 }}">
                    {{ __('Total Score') }}
                </td>
                <td>
                    {{ $attempt_type->type->name === 'Writing' ? $totalScore : $sumCorrect }}
                </td>
            </tr>
            </tbody>
        </table>
    @endif
@endforeach

<div class="footer">
    {{ __('Generated on') }} {{ now()->format('Y-m-d H:i') }}
</div>

</body>
</html>
