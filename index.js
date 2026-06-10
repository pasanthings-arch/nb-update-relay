const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const MY_TOKEN = "proxy2026";
const AI_API_KEY = process.env.AI_API_KEY;

const SYSTEM_PROMPT =
  "Das SOLO código Java. Sin texto antes ni después. " +
    "Sin explicaciones. Sin ejemplos." +
    "Solo el código pedido con comentarios mínimos en líneas clave. " +
    "Responde en español solo en los comentarios.";
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