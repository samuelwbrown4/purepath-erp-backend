const express = require('express')
const router = express.Router()
const { supabase } = require('../db/supabase');
const { validateApiKey } = require('../middleware/api');

const TMS_API_KEY = process.env.TMS_API_KEY;
const TMS_API_URL = process.env.TMS_API_URL;

router.post('/new' , async (req , res) => {
    try{
        const {payload} = req.body

        const {data: product , error} = await supabase
            .from('products')
            .insert({
                company_id: payload.companyId,
                material_number: `PP-MED-${payload.materialNumber}`,
                product_type: 'finished_good',
                description: payload.description,
                weight: payload.weight,
                freight_class: payload.freightClass,
                unit_of_measure: 'EA'
            })
            .select()

        res.status(201).json({product})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

router.get('/finished-goods' , async (req , res) => {
    try{
        const {data: products , error} = await supabase 
            .from('products')
            .select('*')
            .eq('product_type' , 'finished_good')

            console.log(products)
        res.status(200).json({products})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

module.exports = router