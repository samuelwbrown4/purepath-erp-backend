"use strict";
const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { validateApiKey } = require('../middleware/api');
const TMS_API_KEY = process.env.TMS_API_KEY;
const TMS_API_URL = process.env.TMS_API_URL;
router.get('/locations/all', async (req, res) => {
    try {
        const { data: customerLocations, error } = await supabase
            .from('customer_locations')
            .select('*');
        res.status(200).json({ customerLocations });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/all', async (req, res) => {
    try {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*');
        res.status(200).json({ customers });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/new', async (req, res) => {
    try {
        const { payload } = req.body;
        payload.country = 'US';
        let response = await fetch(`${TMS_API_URL}/api/integration/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${TMS_API_KEY}`
            },
            body: JSON.stringify({ payload })
        });
        let result = await response.json();
        if (response.status !== 201) {
            return res.status(500).json({ error: 'TMS customer creation failed' });
        }
        const tmsCustomerId = result.newCustomer;
        const { data: customer, error: custInsertError } = await supabase
            .from('customers')
            .insert({
            tms_customer_id: tmsCustomerId,
            company_id: payload.companyId,
            name: payload.custName,
            address: payload.custAddress,
            city: payload.custCity,
            state: payload.custState,
            zip_code: payload.custZip,
            country: payload.country
        })
            .select();
        if (custInsertError)
            return res.status(500).json({ error: custInsertError.message });
        res.status(201).json({ customer });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/locations/new', async (req, res) => {
    try {
        const { payload } = req.body;
        payload.country = 'US';
        const { data: custData, error: tmsCustIdErr } = await supabase
            .from('customers')
            .select('tms_customer_id')
            .eq('id', payload.customer)
            .single();
        payload.tmsCustomerId = custData.tms_customer_id;
        if (tmsCustIdErr)
            return res.status(500).json({ error: tmsCustIdErr.message });
        let response = await fetch(`${TMS_API_URL}/api/integration/customer-locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${TMS_API_KEY}`
            },
            body: JSON.stringify({ payload })
        });
        let result = await response.json();
        if (!result.newCustomerLocation)
            return res.status(500).json({ error: err.message });
        payload.tmsCustLocId = result.newCustomerLocation;
        const { data: location, error: locationError } = await supabase
            .from('customer_locations')
            .insert({
            tms_customer_location_id: payload.tmsCustLocId,
            customer_id: payload.customer,
            name: payload.locName,
            address: payload.locAddress,
            city: payload.locCity,
            state: payload.locState,
            zip_code: payload.locZip,
            country: payload.country
        })
            .select();
        if (locationError)
            return res.status(500).json({ error: locationError.message });
        res.status(201).json({ location });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
//# sourceMappingURL=customers.js.map