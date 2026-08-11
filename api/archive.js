// Proxies a video upload to Archive.org's S3-style API.
// Client sends: PUT /api/archive
//   headers: x-access-key, x-secret-key, x-identifier, x-filename
//   body: raw video bytes
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-key, x-secret-key, x-identifier, x-filename');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PUT') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const accessKey = req.headers['x-access-key'];
        const secretKey = req.headers['x-secret-key'];
        const identifier = req.headers['x-identifier'];
        const filename = req.headers['x-filename'];
        if (!accessKey || !secretKey || !identifier || !filename) {
            return res.status(400).send('Missing archive.org credentials or file info headers');
        }

        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks);

        const uploadUrl = `https://s3.us.archive.org/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'authorization': `LOW ${accessKey}:${secretKey}`,
                'x-archive-meta-title': identifier,
                'x-archive-auto-make-bucket': '1',
            },
            body: body,
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).send('Archive.org upload failed: ' + errText);
        }
        res.status(200).send(uploadUrl);
    } catch (error) {
        res.status(500).send('Archive proxy failed: ' + error.message);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
