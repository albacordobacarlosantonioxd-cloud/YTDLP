const express = require('express');
const axios = require('axios'); // Necesitamos instalar axios
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL requerida');

    try {
        console.log(`Solicitando descarga para: ${videoUrl}`);

        // 1. Llamamos a la API de Sylphy
        const apiUrl = `https://sylphyy.xyz/download/v2/ytmp3?url=${encodeURIComponent(videoUrl)}&api_key=sylphy-ty5xtWm`;
        
const response = await axios.get(apiUrl);

        if (response.data && response.data.status) {
            const downloadUrl = response.data.result.download_url;
            const title = response.data.result.title || 'audio';

            console.log(`¡Éxito! Enviando link de descarga para: ${title}`);

            // Cambiamos el redirect por un envío de HTML que fuerza la descarga
            res.send(`
                <!DOCTYPE html>
                <html>
                <head><title>Descargando...</title></head>
                <body style="background:#121212; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
                    <h2>Tu archivo está listo</h2>
                    <p>La descarga de <strong>${title}</strong> debería empezar automáticamente.</p>
                    <p>Si no empieza, <a href="${downloadUrl}" style="color:#00d2ff;">haz clic aquí para descargar manualmente</a>.</p>
                    <script>
                        // Esto fuerza al navegador a abrir el link de descarga
                        window.location.href = "${downloadUrl}";
                    </script>
                </body>
                </html>
            `);
       } else {
            res.status(500).send('La API de Sylphy no devolvió un link válido.');
        }

    } catch (error) {
        // Este es el bloque que faltaba
        console.error('Error en el servidor:', error.message);
        res.status(500).send('Ocurrió un error al procesar la descarga.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con API externa en puerto ${PORT}`);
});