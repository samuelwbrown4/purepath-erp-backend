const pool = require('../db/pool');

async function validateApiKey(req , res , next){
    try{
        const key = req.headers['x-api-key'];
        if(!key){
            return res.status(401).json({error: 'No API Key!'})
        }

        let result = await pool.query(`SELECT resource FROM api_keys WHERE api_key = $1` , [key])

        if(result.rows.length === 0){
            return res.status(401).json({error: 'Invalid API Key!'})
        }

        let resource = result.rows[0].resource

        req.resource = resource
        next()
    }catch(error){

    }
}

module.exports = {validateApiKey}