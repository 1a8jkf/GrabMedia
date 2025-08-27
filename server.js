const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path'); 

const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/video-info', async (req, res) => {
    const { url, platform } = req.body;

    if (!url || !platform) {
        return res.status(400).json({ error: 'URL e plataforma são obrigatórios!' });
    }

    let normalizedUrl = normalizeUrl(url, platform);
    if (!normalizedUrl) {
        return res.status(400).json({ error: `URL inválida para a plataforma ${platform}.` });
    }

    try {
        const cookiesPath = path.join(__dirname, 'cookies.txt');
        const process = spawn('yt-dlp', ['-j', '--cookies', cookiesPath, normalizedUrl]);

        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            console.error(`Erro: ${data.toString()}`);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Erro ao obter informações do vídeo.' });
            }

            const info = JSON.parse(output);

            const videoFormats = info.formats
                .filter(format => format.vcodec !== 'none' && format.filesize)
                .map(format => ({
                    quality: `${format.height || '--'}p${format.fps ? ` ${format.fps}fps` : ''}`,
                    fps: format.fps || 0,
                    resolution: format.height || 0,
                    size: `${(format.filesize / (1024 * 1024)).toFixed(2)} MB`,
                    itag: format.format_id,
                    mimeType: format.ext,
                }))
                .sort((a, b) => b.resolution - a.resolution || b.fps - a.fps)
                .filter((format, index, self) =>
                    index === self.findIndex(f => f.resolution === format.resolution && f.fps === format.fps)
                );

            const audioFormats = info.formats
                .filter(format => format.acodec !== 'none' && format.vcodec === 'none' && format.filesize)
                .map(format => ({
                    bitrate: `${format.abr || '--'} kbps`,
                    size: `${(format.filesize / (1024 * 1024)).toFixed(2)} MB`,
                    itag: format.format_id,
                    mimeType: format.ext,
                }));

            return res.json({
                title: info.title,
                embedUrl: `https://www.youtube.com/embed/${info.id}`,
                videoFormats,
                audioFormats,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao processar o pedido. Verifique a URL e tente novamente.' });
    }
});

app.get('/download', async (req, res) => {
    const { url, itag, title, platform } = req.query;

    if (!url || !itag || !title || !platform) {
        return res.status(400).send('Parâmetros inválidos.');
    }

    let normalizedUrl = normalizeUrl(url, platform);
    if (!normalizedUrl) {
        return res.status(400).send(`URL inválida para a plataforma ${platform}.`);
    }

    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');

    try {
        const cookiesPaths = path.join(__dirname, 'cookies.txt');
        const process = spawn('yt-dlp', [
            '-f', `${itag}+bestaudio[ext=m4a]/mp4`,
            '--merge-output-format', 'mp4',
            '-o', '-',
            '--cookies', cookiesPaths,
            normalizedUrl,
        ]);

        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        process.stdout.pipe(res);

        process.stderr.on('data', (data) => {
            const message = data.toString();
            if (message.includes('frame=') || message.includes('fps=')) {
                console.log(`Progresso: ${message.trim()}`);
            } else {
                console.error(`Erro: ${message.trim()}`);
            }
        });

        process.on('close', (code) => {
            if (code !== 0 && !res.headersSent) {
                console.error(`Erro no comando yt-dlp com código ${code}`);
                return res.status(500).send('Erro ao processar o download.');
            }
        });
    } catch (error) {
        console.error('Erro ao processar o download:', error);
        if (!res.headersSent) {
            return res.status(500).send('Erro ao processar o download.');
        }
    }
});


function normalizeUrl(url, platform) {
    const normalizers = {
        youtube: normalizeYouTubeUrl,
        vimeo: normalizeVimeoUrl,
        facebook: normalizeFacebookUrl,
        instagram: normalizeInstagramUrl,
        tiktok: normalizeTikTokUrl,
    };
    return normalizers[platform.toLowerCase()]?.(url) || null;
}

function normalizeYouTubeUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
}

function normalizeVimeoUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;
    return regex.test(url) ? url : null;
}

function normalizeFacebookUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com\/(?:[^\/]+\/)?videos\/)(\d+)/;
    return regex.test(url) ? url : null;
}

function normalizeInstagramUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/(?:p|reel)\/[a-zA-Z0-9_-]+)/;
    return regex.test(url) ? url : null;
}

function normalizeTikTokUrl(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/(?:@[a-zA-Z0-9_.-]+\/video\/\d+))/;
    return regex.test(url) ? url : null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
