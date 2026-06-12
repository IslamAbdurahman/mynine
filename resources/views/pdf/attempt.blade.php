<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>IELTS Practice Test Report Form</title>
    <style>
        @page {
            margin: 40px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #2d3748;
            line-height: 1.5;
        }

        /* Certificate border and styling */
        .certificate-container {
            border: 4px double #1a365d;
            padding: 25px;
            background: #fff;
            position: relative;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 10px;
        }

        .header-logo {
            font-size: 26px;
            font-weight: bold;
            color: #1a365d;
            letter-spacing: 1px;
        }

        .header-title {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1a365d;
            background: #edf2f7;
            padding: 6px 10px;
            margin-top: 15px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Candidate Details Table */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .details-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .details-label {
            font-weight: bold;
            color: #4a5568;
            width: 20%;
        }

        .details-val {
            color: #1a202c;
            width: 30%;
        }

        /* Scores Table */
        .scores-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            text-align: center;
        }

        .scores-table th {
            background: #1a365d;
            color: #ffffff;
            font-weight: bold;
            padding: 8px;
            font-size: 11px;
            text-transform: uppercase;
        }

        .scores-table td {
            padding: 8px;
            border: 1px solid #cbd5e0;
            font-size: 12px;
        }

        .scores-table tr:nth-child(even) td {
            background: #f7fafc;
        }

        .band-badge {
            font-weight: bold;
            color: #2b6cb0;
        }

        /* Overall score box */
        .overall-box {
            background: #ebf8ff;
            border: 2px solid #3182ce;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            margin-bottom: 25px;
        }

        .overall-title {
            font-size: 14px;
            font-weight: bold;
            color: #2b6cb0;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }

        .overall-score {
            font-size: 32px;
            font-weight: bold;
            color: #1a365d;
            margin: 0;
        }

        /* Essay details */
        .essay-container {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #e2e8f0;
            background: #f7fafc;
            border-radius: 4px;
        }

        .essay-feedback {
            font-style: italic;
            color: #4a5568;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        /* Footer Table (QR Code + Verification) */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }

        .footer-text {
            color: #718096;
            font-size: 9px;
            vertical-align: middle;
        }

        .qr-code-cell {
            text-align: right;
            width: 120px;
            vertical-align: middle;
        }

        .qr-image {
            width: 90px;
            height: 90px;
            border: 1px solid #cbd5e0;
            padding: 3px;
            background: #fff;
        }

        /* Watermark styling */
        .watermark {
            position: fixed;
            top: 35%;
            left: 5%;
            width: 90%;
            text-align: center;
            opacity: 0.04;
            transform: rotate(-30deg);
            font-size: 75px;
            font-weight: bold;
            color: #1a365d;
            z-index: -1000;
            letter-spacing: 5px;
        }
    </style>
</head>
<body>

@php
    $listeningCorrect = 0;
    $readingCorrect = 0;
    
    $listeningBand = 0.0;
    $readingBand = 0.0;
    $writingBand = 0.0;
    $speakingBand = 0.0;
    
    $hasListening = false;
    $hasReading = false;
    $hasWriting = false;
    $hasSpeaking = false;

    foreach($attempt->attempt_types as $type) {
        $typeName = optional($type->type)->name;
        if ($typeName === 'Listening') {
            $listeningCorrect = $type->is_correct_count ?? 0;
            $listeningBand = \App\Services\IeltsScoreConverter::convertListening($listeningCorrect);
            $hasListening = true;
        } elseif ($typeName === 'Reading') {
            $readingCorrect = $type->is_correct_count ?? 0;
            $readingBand = \App\Services\IeltsScoreConverter::convertReading($readingCorrect);
            $hasReading = true;
        } elseif ($typeName === 'Writing') {
            $writingBand = number_format(((float)($type->is_correct_count ?? 0)) / 2, 1);
            $hasWriting = true;
        } elseif ($typeName === 'Speaking') {
            $speakingBand = (float)($type->score ?? 0);
            $hasSpeaking = true;
        }
    }

    // Calculate Overall Band Score
    $scores = [];
    if ($hasListening) $scores[] = $listeningBand;
    if ($hasReading) $scores[] = $readingBand;
    if ($hasWriting) $scores[] = (float)$writingBand;
    if ($hasSpeaking) $scores[] = $speakingBand;

    $overallBand = 0.0;
    if (count($scores) > 0) {
        $avg = array_sum($scores) / count($scores);
        // Round to nearest 0.5 or 0.0
        $fraction = $avg - floor($avg);
        if ($fraction < 0.25) {
            $overallBand = floor($avg);
        } elseif ($fraction < 0.75) {
            $overallBand = floor($avg) + 0.5;
        } else {
            $overallBand = ceil($avg);
        }
    }
    
    $verificationUrl = route('attempt.pdf', $attempt->id);
    $verificationCode = strtoupper(substr(hash('sha256', $attempt->id . $attempt->created_at), 0, 12));
@endphp

<div class="watermark">MYNINE.UZ</div>

<div class="certificate-container">
    <table class="header-table">
        <tr>
            <td class="header-logo">MYNINE</td>
            <td class="header-title">IELTS Test Report Card</td>
        </tr>
    </table>

    <div class="section-title">Candidate Details</div>
    <table class="details-table">
        <tr>
            <td class="details-label">Candidate Name:</td>
            <td class="details-val">{{ optional($attempt->user)->name }}</td>
            <td class="details-label">Attempt ID:</td>
            <td class="details-val">#{{ $attempt->id }}</td>
        </tr>
        <tr>
            <td class="details-label">Contact:</td>
            <td class="details-val">{{ optional($attempt->user)->phone ?? optional($attempt->user)->email ?? '-' }}</td>
            <td class="details-label">Date of Test:</td>
            <td class="details-val">{{ $attempt->created_at->format('Y-m-d H:i') }}</td>
        </tr>
        <tr>
            <td class="details-label">Mock Exam:</td>
            <td class="details-val">{{ optional($attempt->mock)->name ?? 'Practice Test' }}</td>
            <td class="details-label">Verification Code:</td>
            <td class="details-val"><strong>{{ $verificationCode }}</strong></td>
        </tr>
    </table>

    <div class="section-title">Test Results</div>
    <table class="scores-table">
        <thead>
            <tr>
                <th>Module</th>
                <th>Raw Score / Correct Answers</th>
                <th>IELTS Band Score</th>
            </tr>
        </thead>
        <tbody>
            @if($hasListening)
            <tr>
                <td><strong>Listening</strong></td>
                <td>{{ $listeningCorrect }} / 40</td>
                <td class="band-badge">{{ number_format($listeningBand, 1) }}</td>
            </tr>
            @endif
            @if($hasReading)
            <tr>
                <td><strong>Reading</strong></td>
                <td>{{ $readingCorrect }} / 40</td>
                <td class="band-badge">{{ number_format($readingBand, 1) }}</td>
            </tr>
            @endif
            @if($hasWriting)
            <tr>
                <td><strong>Writing</strong></td>
                <td>-</td>
                <td class="band-badge">{{ number_format($writingBand, 1) }}</td>
            </tr>
            @endif
            @if($hasSpeaking)
            <tr>
                <td><strong>Speaking</strong></td>
                <td>-</td>
                <td class="band-badge">{{ number_format($speakingBand, 1) }}</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="overall-box">
        <div class="overall-title">Overall Band Score</div>
        <div class="overall-score">{{ number_format($overallBand, 1) }}</div>
    </div>

    @foreach($attempt->attempt_types as $type)
        @if($type->type->name === 'Writing')
            @foreach($type->attempt_parts ?? [] as $part)
                @foreach($part->part->sections as $sec)
                    @foreach($sec->questions as $q)
                        @if(optional($q->attempt_answer)->review_note_ai)
                            @php
                                $reviewText = $q->attempt_answer->review_note_ai;
                                
                                // Extract Overall Band Score
                                preg_match('/Overall Band Score:\s*([0-9.]+)/i', $reviewText, $matches);
                                $essayOverall = $matches[1] ?? null;

                                // Extract individual criteria scores
                                preg_match('/Task Response:\s*([0-9.]+)/i', $reviewText, $matches);
                                $taskResponse = $matches[1] ?? 'N/A';

                                preg_match('/Coherence & Cohesion:\s*([0-9.]+)/i', $reviewText, $matches);
                                $coherenceCohesion = $matches[1] ?? 'N/A';

                                preg_match('/Lexical Resource:\s*([0-9.]+)/i', $reviewText, $matches);
                                $lexicalResource = $matches[1] ?? 'N/A';

                                preg_match('/Grammatical Range & Accuracy:\s*([0-9.]+)/i', $reviewText, $matches);
                                $grammaticalRange = $matches[1] ?? 'N/A';

                                // Extract Detailed Feedback
                                $feedbackParts = explode('Detailed Feedback:', $reviewText);
                                $detailedFeedback = count($feedbackParts) > 1 ? trim($feedbackParts[1]) : null;
                                
                                if (!$detailedFeedback) {
                                    $detailedFeedback = $reviewText;
                                }
                            @endphp
                            <div class="section-title">Writing Task {{ $loop->iteration }} Evaluation</div>
                            <div class="essay-container">
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                                    <tr>
                                        <td style="width: 60%; vertical-align: top; padding-right: 15px; border-right: 1px solid #e2e8f0;">
                                            <div style="font-weight: bold; color: #4a5568; margin-bottom: 5px;">Your Essay:</div>
                                            <div style="white-space: pre-wrap; color: #1a202c; font-size: 10.5px; line-height: 1.4;">{{ $q->attempt_answer->answer_text }}</div>
                                        </td>
                                        <td style="width: 40%; vertical-align: top; padding-left: 15px;">
                                            <div style="font-weight: bold; color: #1a365d; margin-bottom: 8px; text-transform: uppercase; font-size: 11px;">AI Score Summary:</div>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                                                <tr>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Task Response:</td>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">{{ $taskResponse }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Coherence & Cohesion:</td>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">{{ $coherenceCohesion }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Lexical Resource:</td>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">{{ $lexicalResource }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; color: #718096;">Grammatical Range:</td>
                                                    <td style="padding: 4px 0; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">{{ $grammaticalRange }}</td>
                                                </tr>
                                                @if($essayOverall)
                                                <tr>
                                                    <td style="padding: 6px 0; color: #2b6cb0; font-weight: bold; font-size: 11px;">Overall Band:</td>
                                                    <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #2b6cb0; font-size: 12px;">{{ $essayOverall }}</td>
                                                </tr>
                                                @endif
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px;">
                                    <div style="font-weight: bold; color: #1a365d; margin-bottom: 5px;">Detailed Feedback & Suggestions:</div>
                                    <div style="color: #4a5568; font-style: italic; white-space: pre-wrap; word-wrap: break-word; font-size: 10px; line-height: 1.5;">
                                        {!! nl2br(e($detailedFeedback)) !!}
                                    </div>
                                </div>
                            </div>
                        @endif
                    @endforeach
                @endforeach
            @endforeach
        @endif
    @endforeach

    <table class="footer-table">
        <tr>
            <td class="footer-text">
                <strong>Disclaimer:</strong> This is a practice test report form generated by MyNine.uz IELTS Preparation Platform. The score displayed is an estimate and is intended for practice validation only.<br>
                <strong>Verification URL:</strong> <a href="{{ $verificationUrl }}" style="color: #2b6cb0; text-decoration: none;">{{ $verificationUrl }}</a><br>
                <strong>Verification Code:</strong> <code>{{ $verificationCode }}</code> | Report generated on {{ now()->format('Y-m-d H:i') }}
            </td>
            <td class="qr-code-cell">
                <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ urlencode($verificationUrl) }}" alt="QR Code">
            </td>
        </tr>
    </table>
</div>

</body>
</html>
