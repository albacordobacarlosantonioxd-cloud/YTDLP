const express = require('express');
const path = require('path');
const { exec } = require('yt-dlp-exec');
const app = express();

// CLAVE PARA RAILWAY: Usar el puerto dinámico
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta principal para cargar tu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// RUTA DE DESCARGA
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Falta la URL de YouTube');
    }

    try {
        // Configuración de descarga para MP3 con Carátula
        const options = {
            extractAudio: true,
            audioFormat: 'mp3',
            addMetadata: true,
            embedThumbnail: true,
            output: '-', // Esto envía el archivo directamente al navegador
        };

        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
        res.setHeader('Content-Type', 'audio/mpeg');

        // Ejecutar yt-dlp y enviar el flujo al cliente
        const stream = exec(videoUrl, options, { stdio: ['ignore', 'pipe', 'ignore'] });
        
        stream.stdout.pipe(res);

        stream.on('error', (err) => {
            console.error('Error en la descarga:', err);
            if (!res.headersSent) res.status(500).send('Error al procesar el audio');
        });

    } catch (error) {
        console.error('Error fatal:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Encender el motor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor activo y escuchando en el puerto ${PORT}`);
});