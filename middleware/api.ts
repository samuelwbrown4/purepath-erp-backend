const supabase = require('../db/supabase');
import { Request, Response , NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            resource?: string
        }
    }
}

async function validateApiKey(req: Request, res: Response, next: NextFunction) {
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
        console.log('>>> validateApiKey error:', error)
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { validateApiKey };