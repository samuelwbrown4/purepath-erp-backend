const express = require('express')
import { Request, Response } from "express";
const router = express.Router()
const { supabase } = require('../db/supabase');

router.get('/all' , async (req: Request , res: Response)=> {
    try{
        const {data: companies , error} = await supabase
            .from('companies')
            .select('*')

        res.status(200).json({companies})
    }catch(err){
        if(err instanceof Error){
            res.status(500).json({error: err.message})
        }else{
            res.status(500).json({error: 'An unknown error occured'})
        }
    }
})

module.exports = router