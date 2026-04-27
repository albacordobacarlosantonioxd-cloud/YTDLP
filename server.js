const express = require('express');
const path = require('path');
const { exec } = require('yt-dlp-exec');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL requerida');

    try {
        console.log(`Conectando: ${videoUrl}`);
        
        // 1. Sacamos la info básica (título)
        const info = await exec(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            cookies: './cookies.txt',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const videoTitle = info.title.replace(/[/\\?%*:|"<>\.]/g, ''); 
        const outputPath = path.join('/tmp', `${videoTitle}-${Date.now()}.mp3`);

        console.log(`Descargando audio: ${videoTitle}`);

        // 2. Descarga simple de audio (sin imagen para evitar errores de formato)
        await exec(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
            noCheckCertificates: true,
            cookies: './cookies.txt',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        if (fs.existsSync(outputPath)) {
            res.download(outputPath, `${videoTitle}.mp3`, (err) => {
                if (err) console.error('Error al enviar:', err);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        } else {
            res.status(500).send('Error al generar el archivo.');
        }

    } catch (error) {
        console.error('--- ERROR ---');
        console.error(error.stderr || error);
        res.status(500).send('YouTube bloqueó la descarga o el formato no está disponible.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});