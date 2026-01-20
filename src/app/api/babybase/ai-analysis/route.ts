import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-2.0-flash-001';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const { messages, specialists, articles, posts } = await req.json();

        const latestMessage = messages[messages.length - 1].text;

        const prompt = `
        あなたは愛媛県のママを支援するプラットフォーム「Baby Base」のAI案内コンシェルジュです。
        ユーザー（ママ）からの育児相談に対し、共感を持って答え、最適な専門家や情報を提案してください。

        【提供可能なリソース】
        ■ 専門家（Specialists）:
        ${JSON.stringify(specialists.map((s: any) => ({ id: s.id, name: s.name, category: s.category, description: s.description, tags: s.tags })))}

        ■ 記事・eラーニング（Articles）:
        ${JSON.stringify(articles.map((a: any) => ({ id: a.id, title: a.title, category: a.category })))}

        ■ 投稿・SNS（Posts）:
        ${JSON.stringify(posts.map((p: any) => ({ id: p.id, content: p.content })))}

        【ユーザーの相談】
        "${latestMessage}"

        【指示】
        1. まず、ユーザーの悩みに対して100文字〜150文字程度で、温かく、共感のあるアドバイスを返答してください。
        2. 上記のリソースの中から、相談内容に最も関連の深いものを「2つ」選んでください。
        3. 出力は必ず以下の形式のJSONのみにしてください。

        {
            "responseText": "AIからの共感メッセージ",
            "recommendations": [
                { "type": "specialist" | "article" | "post", "id": "リソースのID" }
            ]
        }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            throw new Error(data.error.message);
        }

        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error('No content generated');

        // Extract JSON from potential markdown blocks
        const jsonStr = textResult.replace(/```json\n?|\n?```/g, '').trim();
        const analysis = JSON.parse(jsonStr);

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to analyze' }, { status: 500 });
    }
}
