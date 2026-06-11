const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const MY_TOKEN = "proxy2026";
const AI_API_KEY = process.env.AI_API_KEY;

const SYSTEM_PROMPT =
    "Eres un asistente de Java para DAM de primer año. " +
    "REGLAS ABSOLUTAS: " +
    "1. Cuando te pidan métodos Java, da SOLO el código de esos métodos exactos. " +
    "2. Si el ejercicio es de JDBC, usa siempre PreparedStatement y ResultSet con MySQL. " +
    "3. Asume siempre que existe una conexión llamada 'conn' de tipo Connection. " +
    "4. Sin markdown ni ```. " +
    "5. Sin explicaciones, sin preguntas, sin pedir más contexto. " +
    "6. Si falta información, asume valores razonables y responde igualmente. " +
    "7. Comentarios mínimos en español solo en líneas clave."
    "8. NUNCA uses ``` ni bloques de código markdown. Escribe el código en texto plano directamente.";
;app.use((req, res, next) => {
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