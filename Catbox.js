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
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            headers: { 'Content-Type': contentType },
            body: body,
        });

        const text = await response.text();
        res.status(200).send(text);
    } catch (error) {
        res.status(500).send('Upload failed: ' + error.message);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
