const { supabase } = require('../db/supabase');

async function validateApiKey(req, res, next) {
    try {
        const key = req.headers['x-api-key'];
        if (!key) {
            return res.status(401).json({ error: 'No API Key!' });
        }

        const { data, error } = await supabase
            .from('api_keys')
            .select('resource')
            .eq('api_key', key)
            .single();

        if (!data || error) {
            return res.status(401).json({ error: 'Invalid API Key!' });
        }

        req.resource = data.resource;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { validateApiKey };