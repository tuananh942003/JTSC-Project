import 'dotenv/config';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
console.log('=== GROQ API TEST ===');
console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT SET!'}`);

if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.error('\n❌ LỖI: API key chưa được set trong file .env!');
    console.error('Hãy mở file .env và thêm API key Groq của bạn:');
    console.error('GROQ_API_KEY=gsk_xxxxxxxxxxxxxxx\n');
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function testTextModel() {
    console.log('\n--- Test 1: Text Model (openai/gpt-oss-120b) ---');
    try {
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                { role: 'user', content: 'Xin chào! Hãy nói "Hello" bằng 3 ngôn ngữ.' }
            ],
            max_tokens: 200,
        });
        console.log('✅ Text Model OK!');
        console.log('Response:', completion.choices[0]?.message?.content);
    } catch (error) {
        console.error('❌ Text Model FAILED:', error.message);
    }
}

async function testVisionModel() {
    console.log('\n--- Test 2: Vision Model (meta-llama/llama-4-scout-17b-16e-instruct) ---');
    try {
        const completion = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                { role: 'user', content: 'Xin chào! Hãy nói "Hello" bằng 2 ngôn ngữ.' }
            ],
            max_tokens: 200,
        });
        console.log('✅ Vision Model OK!');
        console.log('Response:', completion.choices[0]?.message?.content);
    } catch (error) {
        console.error('❌ Vision Model FAILED:', error.message);
    }
}

async function main() {
    await testTextModel();
    await testVisionModel();
    console.log('\n=== TEST COMPLETE ===');
}

main();
