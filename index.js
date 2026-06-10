const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const MY_TOKEN = "proxy2026";
const AI_API_KEY = process.env.AI_API_KEY;

const SYSTEM_PROMPT =
    "Eres un asistente especializado en Java para estudiantes de DAM. " +
    "REGLAS ESTRICTAS: " +
    "1. Responde SIEMPRE en español. " +
    "2. Todo el código que generes debe ser SIEMPRE Java puro. " +
    "3. El código debe ser completo, compilable y ejecutable tal cual. " +
    "4. No uses bloques markdown ni ```, escribe el código en texto plano. " +
    "5. Sé directo, da UNA sola solución completa sin alternativas.";

app.use((req, res, next) => {
    if (req.headers['x-proxy-token'] !== MY_TOKEN) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
});

app.post('/ask', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: req.body.prompt }]
            },
            {
                headers: {
                    'x-api-key': AI_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({ respuesta: response.data.content[0].text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Proxy corriendo'));