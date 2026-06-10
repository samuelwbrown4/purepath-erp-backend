const express = require('express')
import {Request , Response} from 'express'
const router = express.Router()
const { supabase } = require('../db/supabase');
const { validateApiKey } = require('../middleware/api');

const TMS_API_KEY = process.env.TMS_API_KEY;
const TMS_API_URL = process.env.TMS_API_URL;

router.post('/new' , async (req: Request , res: Response) => {
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
        if(err instanceof Error){
            res.status(500).json({error: err.message})
        }else{
            res.status(500).json({ error: 'An unknown error occurred' })
        } 
    }
})

router.get('/finished-goods' , async (req: Request , res: Response) => {
    try{
        const {data: products , error} = await supabase 
            .from('products')
            .select('*')
            .eq('product_type' , 'finished_good')

            console.log(products)
        res.status(200).json({products})
    }catch(err){
        if(err instanceof Error){
            res.status(500).json({error: err.message})
        }else{
            res.status(500).json({error: 'An unknkown error occured'})
        }
    }
})

module.exports = router