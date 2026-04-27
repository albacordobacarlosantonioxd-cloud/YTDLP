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

            console.log(`¡Éxito! Redirigiendo a: ${title}`);

            // 2. Redirigimos al usuario directamente al link de descarga de la API
            // Esto ahorra memoria en tu servidor de Railway
            res.redirect(downloadUrl);
        } else {
            res.status(500).send('La API externa no pudo procesar el video.');
        }

    } catch (error) {
        console.error('Error con la API:', error.message);
        res.status(500).send('Error al conectar con el servicio de descarga.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con API externa en puerto ${PORT}`);
});