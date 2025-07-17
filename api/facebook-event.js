const axios = require('axios');

// Configuración
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAATqZC2FPZC7cBPBWp3or0JJZCkyKTnG6XbMXmlZCBwWxP0nqSfnZC6eYxqcQEZBVGVpcvsgQ4oZA5Y6ZBpqsCZCiaJzyfID9KHJnA2lK2ZCgaivhuQNZBGCaZAcJrPDXidsZCJBr0qWT46YJUTYZAl8n7QGqVX7hiYPO0co9UJzVVJPol5wZClhS7BxcUfSBaMJWw3Cox6iwZDZD';
const FACEBOOK_PIXEL_ID = '1072806391607694';
const FACEBOOK_API_VERSION = 'v18.0';

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const {
            event_name,
            event_time,
            event_source_url,
            user_data = {},
            custom_data = {}
        } = req.body;

        // Obtener IP del cliente
        const clientIP = getClientIP(req);

        // Preparar datos del usuario
        const userData = {
            client_ip_address: clientIP,
            client_user_agent: user_data.client_user_agent,
            fbc: user_data.fbc,
            fbp: user_data.fbp
        };

        // Payload para Facebook API
        const eventPayload = {
            data: [{
                event_name,
                event_time,
                action_source: 'website',
                event_source_url,
                user_data: userData,
                custom_data
            }]
        };

        // Enviar a Facebook API
        const response = await axios.post(
            `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`,
            {
                ...eventPayload,
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Facebook API Response:', response.data);
        
        res.json({
            success: true,
            message: 'Event sent successfully',
            facebook_response: response.data
        });
    } catch (error) {
        console.error('Error sending event to Facebook:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error sending event to Facebook',
            error: error.response?.data || error.message
        });
    }
}
