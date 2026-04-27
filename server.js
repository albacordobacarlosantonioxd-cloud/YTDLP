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
        console.log(`Obteniendo info de: ${videoUrl}`);
        
        // 1. Obtenemos el título del video primero
        const info = await exec(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
        });

        const videoTitle = info.title.replace(/[^\w\s]/gi, ''); // Limpiamos el título de caracteres raros
        const outputPath = path.join('/tmp', `${videoTitle}-${Date.now()}.mp3`);

        console.log(`Descargando: ${videoTitle}`);

        // 2. Ejecutamos la descarga con carátula y metadatos
        await exec(videoUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
            addMetadata: true,
            embedThumbnail: true, // Esto pega la imagen al MP3
            noCheckCertificates: true,
            preferFreeFormats: true,
        });

        // 3. Enviamos el archivo con su nombre real
        if (fs.existsSync(outputPath)) {
            res.download(outputPath, `${videoTitle}.mp3`, (err) => {
                if (err) console.error('Error al enviar:', err);
                // Borramos el temporal para no llenar el disco de Railway
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        } else {
            res.status(500).send('No se pudo generar el archivo.');
        }

    } catch (error) {
        console.error('Error fatal:', error);
        res.status(500).send('Error en el servidor. Revisa los logs.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Pro en puerto ${PORT}`);
});