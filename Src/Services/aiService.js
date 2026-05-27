const askLessonAI = async ({ lesson, question }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
        throw new Error('Thiếu GEMINI_API_KEY trong file .env');
    }

    const prompt = `
Bạn là trợ giảng lập trình trong nền tảng học code.

Quy tắc trả lời:
- Trả lời bằng tiếng Việt.
- Giải thích ngắn gọn, dễ hiểu cho người mới học.
- Ưu tiên trả lời dựa trên nội dung bài học.
- Nếu câu hỏi nằm ngoài bài học, hãy nói: "Nội dung này chưa có trong bài học hiện tại."
- Nếu có ví dụ code, hãy trình bày rõ ràng.

Tên bài học:
${lesson.title}

Nội dung bài học:
${lesson.theory_md || 'Bài học này chưa có nội dung lý thuyết.'}

Câu hỏi học viên:
${question}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 800
            }
        })
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch {
        console.error('[Gemini Non-JSON Response]', rawText);
        throw new Error(`Gemini khong tra JSON. HTTP ${response.status}`);
    }

    if (!response.ok) {
        console.error('[Gemini Error]', data);
        throw new Error(data.error?.message || 'Gemini API error');
    }

    const answer = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

    return answer || 'Gemini chưa trả về nội dung.';
};

module.exports = { askLessonAI };
