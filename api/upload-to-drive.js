// Vercel Serverless Function - Upload file to Google Drive
// This runs on the server, keeping Google credentials safe.

export const config = {
    api: {
        bodyParser: false, // We handle raw multipart ourselves
    },
};

async function createJWT(serviceAccount, impersonateEmail) {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
        sub: impersonateEmail, // Domain-wide delegation: act as this user
    };

    const encode = (obj) =>
        Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

    const signingInput = `${encode(header)}.${encode(payload)}`;

    const { createSign } = await import('crypto');
    const sign = createSign('RSA-SHA256');
    sign.update(signingInput);
    const signature = sign
        .sign(serviceAccount.private_key, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${signingInput}.${signature}`;
}

async function getAccessToken(serviceAccount, impersonateEmail) {
    const jwt = await createJWT(serviceAccount, impersonateEmail);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    const data = await response.json();
    if (!data.access_token) {
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }
    return data.access_token;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const impersonateEmail = process.env.GOOGLE_IMPERSONATE_EMAIL;

    if (!serviceAccountKey || !folderId || !impersonateEmail) {
        return res.status(500).json({
            error: `Server configuration error: Missing env vars. Key:${!!serviceAccountKey} Folder:${!!folderId} Email:${!!impersonateEmail}`,
        });
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        const accessToken = await getAccessToken(serviceAccount, impersonateEmail);

        // Read raw multipart body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks);

        // Extract content-type to get boundary
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        if (!boundaryMatch) {
            return res.status(400).json({ error: 'No boundary found in Content-Type' });
        }
        const boundary = boundaryMatch[1];

        // Parse multipart manually
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const parts = [];
        let pos = 0;

        while (pos < rawBody.length) {
            const boundaryIdx = rawBody.indexOf(boundaryBuffer, pos);
            if (boundaryIdx === -1) break;

            const partStart = boundaryIdx + boundaryBuffer.length;
            if (rawBody[partStart] === 45 && rawBody[partStart + 1] === 45) break; // --boundary--

            // Skip \r\n after boundary
            const headerStart = partStart + 2;
            const headerEnd = rawBody.indexOf(Buffer.from('\r\n\r\n'), headerStart);
            if (headerEnd === -1) break;

            const headerStr = rawBody.slice(headerStart, headerEnd).toString();
            const contentDisposition = headerStr.match(/Content-Disposition: (.+)/i)?.[1] || '';
            const partContentType = headerStr.match(/Content-Type: (.+)/i)?.[1]?.trim() || 'application/octet-stream';
            const nameMatch = contentDisposition.match(/name="([^"]+)"/);
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);

            const dataStart = headerEnd + 4; // skip \r\n\r\n
            const nextBoundary = rawBody.indexOf(boundaryBuffer, dataStart);
            // Data ends at next boundary minus \r\n
            const dataEnd = nextBoundary === -1 ? rawBody.length : nextBoundary - 2;
            const data = rawBody.slice(dataStart, dataEnd);

            if (nameMatch) {
                parts.push({
                    name: nameMatch[1],
                    filename: filenameMatch?.[1],
                    contentType: partContentType,
                    data,
                });
            }
            pos = nextBoundary === -1 ? rawBody.length : nextBoundary;
        }

        const filePart = parts.find((p) => p.filename);
        if (!filePart) {
            return res.status(400).json({ error: 'No file found in request' });
        }

        // Build Google Drive multipart upload body
        const metadata = JSON.stringify({
            name: filePart.filename,
            parents: [folderId],
        });

        const driveBoundary = 'drive_boundary_' + Date.now();
        const bodyParts = [
            `--${driveBoundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
            `--${driveBoundary}\r\nContent-Type: ${filePart.contentType}\r\n\r\n`,
        ];

        const bodyStart = Buffer.concat(bodyParts.map((p) => Buffer.from(p)));
        const bodyEnd = Buffer.from(`\r\n--${driveBoundary}--`);
        const fullBody = Buffer.concat([bodyStart, filePart.data, bodyEnd]);

        // Upload to Google Drive
        const uploadResponse = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': `multipart/related; boundary=${driveBoundary}`,
                    'Content-Length': fullBody.length.toString(),
                },
                body: fullBody,
            }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadData.id) {
            throw new Error(`Drive upload failed: ${JSON.stringify(uploadData)}`);
        }

        // Set file permissions: anyone with the link can view
        await fetch(
            `https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: 'reader', type: 'anyone' }),
            }
        );

        const fileUrl = `https://drive.google.com/file/d/${uploadData.id}/view`;

        return res.status(200).json({
            url: fileUrl,
            fileId: uploadData.id,
            name: uploadData.name,
        });
    } catch (error) {
        console.error('upload-to-drive error:', error);
        return res.status(500).json({ error: error.message });
    }
}
