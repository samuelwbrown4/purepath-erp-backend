"use strict";
const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { validateApiKey } = require('../middleware/api');
router.get('/all', async (req, res) => {
    try {
        const { data: companies, error } = await supabase
            .from('companies')
            .select('*');
        res.status(200).json({ companies });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
//# sourceMappingURL=companies.js.map