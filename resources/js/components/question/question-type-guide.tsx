import React from 'react';
import { HelpCircle, Info, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuestionTypeGuideProps {
    type?: string; // e.g., 'multiple_choice', 'true_false', 'matching', etc.
}

interface GuideContent {
    title: string;
    description: string;
    steps: string[];
    example?: string;
    warning?: string;
}

const GUIDES: Record<string, GuideContent> = {
    multiple_choice: {
        title: "Multiple Choice (Bir to'g'ri javobli test)",
        description: "Foydalanuvchiga bir nechta variant beriladi, faqat 1 tasi to'g'ri bo'ladi.",
        steps: [
            "Savol matnini yozing.",
            "Variantlarni birma-bir yozing yoki 'Aqlli nusxalash' tugmasi bilan birga tashlang.",
            "To'g'ri variant yonidagi radiotugmani belgilang."
        ],
        example: "A) Option 1  |  B) Option 2  (1 tasi to'g'ri)"
    },
    multiple_response: {
        title: "Multiple Response (Kop to'g'ri javobli test)",
        description: "Foydalanuvchi 2 va undan ortiq to'g'ri variantni tanlaydi (Masalan: Choose TWO letters).",
        steps: [
            "Savol matnini kiring (Masalan: Which TWO reasons are mentioned?).",
            "Variantlarni qo'shing va BARCHA to'g'ri javoblar katakchasini (checkbox) belgilang."
        ],
        example: "Option A (to'g'ri) + Option C (to'g'ri)"
    },
    true_false: {
        title: "True / False / Not Given",
        description: "Matndagi faktlarga mos kelishini aniqlash testi.",
        steps: [
            "Savol matniga tasdiq gapni kiriting.",
            "Pastdagi 'True', 'False' yoki 'Not Given' kartalaridan to'g mezon variantni ustiga bosib belgilang."
        ],
        example: "True (To'g'ri), False (Noto'g'ri), Not Given (Matnda yo'q)"
    },
    yes_no: {
        title: "Yes / No / Not Given",
        description: "Muallifning fikriga yoki qarashlariga mos kelishini aniqlash.",
        steps: [
            "Savol matniga muallif mulohazasini kiriting.",
            "Pastdagi 'Yes', 'No' yoki 'Not Given' kartalaridan to'g'ri javobni tanlang."
        ]
    },
    fill_blank: {
        title: "Fill in the Blank (Bo'sh joyni to'ldirish)",
        description: "Foydalanuvchi javob so'zini klaviaturada yozib to'ldiradi.",
        steps: [
            "Savol matnini kiriting.",
            "'To'g'ri javob matni' maydoniga kiritilishi kerak bo'lgan so'zni yozing.",
            "Harf kattaligi (case) avtomatik tekshiriladi."
        ],
        example: "To'g'ri javob: 'climate change'"
    },
    matching: {
        title: "Matching (Moslashtirish / Headings)",
        description: "Savolga mos harfni (A, B, C...) tanlash testi.",
        steps: [
            "1. Bo'lim (Section) yaratishda 'from_option' va 'to_option' variantlar diapazonini bering (Masalan: A va F).",
            "2. Har bir savol uchun javoblar ro'yxatidan to'g'ri harfni (A, B, C...) tanlang."
        ],
        warning: "Agar Bo'limda variant diapazoni (A-F) berilmagan bo'lsa, savolda javob tanlab bo'lmaydi!",
        example: "Javob: B"
    },
    essay: {
        title: "Essay (Writing Task / Insho)",
        description: "Foydalanuvchi yozma insho yoki javob matnini kiritadi.",
        steps: [
            "Topshiriq va yo'riqnomani (Prompt/Task) yozing.",
            "Foydalanuvchiga yozuv maydoni va so'zlar hisoblagichi taqdim etiladi."
        ]
    },
    complete_section: {
        title: "Complete Section (Bo'sh joylarni to'ldirish / Note Completion)",
        description: "Matn ichiga { to'g'ri_javob } shaklida bo'sh joylar kiritiladi. Tizim ularni avtomatik tarzda savollarga aylantiradi.",
        steps: [
            "1. Bo'lim matnida har bir bo'sh joy o'rniga { to'g'ri_javob } deb yozing (Masalan: { caves }).",
            "2. Agar bir nechta to'g'ri variant bo'lsa, ularni '/' yoki '|' bilan ajrating (Masalan: { 14000 / 14,000 } yoki { stone / stones }).",
            "3. Pastdagi 'Jonli savollar detektori' orqali barcha savollar to'g'ri chiqqanini tekshiring."
        ],
        example: "Excavations inside { caves } revealed axes made of { stone / stones } dating from around { 11700 / 11,700 } years ago."
    },
    drag_and_drop: {
        title: "Drag and Drop (Sudrab joylashtirish)",
        description: "Matndagi bo'sh joylarga variantlar so'zlarini sudrab joylashtirish.",
        steps: [
            "1. Matn ichidagi bo'sh joylarni { to'g'ri_so'z } shaklida yozing.",
            "2. Qo'shimcha (chalg'ituvchi) noto'g'ri variantlarni bo'lim yaratilgach, 'Noto'g'ri variantlar' bo'limiga qo'shing."
        ],
        example: "Axes were made out of { stone }."
    }
};

export default function QuestionTypeGuide({ type }: QuestionTypeGuideProps) {
    if (!type || !GUIDES[type]) return null;

    const guide = GUIDES[type];

    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-800 p-4 space-y-2 text-sm text-gray-800 dark:text-gray-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{guide.title}</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {guide.description}
            </p>

            {guide.steps.length > 0 && (
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300 pl-1">
                    {guide.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                            <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">•</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ul>
            )}

            {guide.warning && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{guide.warning}</span>
                </div>
            )}

            {guide.example && (
                <div className="text-[11px] font-mono bg-white dark:bg-gray-900/60 px-2.5 py-1 rounded border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 inline-block">
                    Misol: {guide.example}
                </div>
            )}
        </div>
    );
}
