// Proxies any Telegram Bot API method, e.g.
//   POST /api/telegram?token=BOT_TOKEN&method=sendVideo   (multipart body: chat_id, video)
//   POST /api/telegram?token=BOT_TOKEN&method=getFile     (json body: { file_id })
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { token, method } = req.query;
        if (!token || !method) {
            return res.status(400).send('Missing token or method query parameter');
        }

        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';

        const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': contentType },
            body: body,
        });

        const text = await response.text();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(text);
    } catch (error) {
        res.status(500).send('Telegram proxy failed: ' + error.message);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
