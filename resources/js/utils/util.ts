const getImagePrefix = () => {
    return process.env.NODE_ENV === 'production' ? '' : '';
};

const cleanTinyMce = (html: string): string => {
    if (!html) return '';

    let cleaned = html;

    // 1️⃣ Remove zero-width spaces and hidden chars
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 2️⃣ Replace non-breaking spaces with normal space
    cleaned = cleaned.replace(/&nbsp;/gi, ' ');

    // 3️⃣ Fix missing spaces between inline tags like </span><span>
    cleaned = cleaned.replace(/<\/(span|b|i|u|strong|em)>(?=<\1)/gi, '</$1> ');
    cleaned = cleaned.replace(/<\/(span|b|i|u|strong|em)>(?=<[a-z])/gi, '</$1> ');

    // 4️⃣ Add space between closing and opening inline tags generally
    cleaned = cleaned.replace(/><(span|b|i|u|strong|em)/gi, '> <$1');

    // 5️⃣ Remove inline styles that cause nowrap or break text wrapping
    cleaned = cleaned.replace(/\s*style="[^"]*"/gi, '');

    // 6️⃣ Collapse multiple spaces but keep one
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

    // 7️⃣ Trim
    return cleaned.trim();
};

export { getImagePrefix, cleanTinyMce };
