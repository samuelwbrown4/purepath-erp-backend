const express = require('express')
const router = express.Router()
const { supabase } = require('../db/supabase');
const {validateApiKey} = require('../middleware/api');

const TMS_API_KEY = process.env.TMS_API_KEY;
const TMS_API_URL = process.env.TMS_API_URL;

router.post('/new', async (req, res) => {
    try {

        const {payload} = req.body

        const { data , error: erpOrderError} = await supabase
            .from('erp_orders')
            .insert({
                customer_id: payload.customerId,
                origin_id: payload.orderOriginId,
                destination_id: payload.orderDestId,
                order_number: payload.orderNumber,
                customer_po_number: payload.custPoNumber,
                requested_ship_date: payload.shipDate,
                order_status: payload.orderStatus
            })
            .select();

        if(erpOrderError) throw erpOrderError;

        const { error } = await supabase
            .from('order_line_items')
            .insert(payload.lineItems.map(li => ({
                order_id: data[0].id,
                product_id: li.productId,
                quantity: li.quantity,
                total_weight_lbs: li.weight
            })));

            if(error) throw error;

            let response = await fetch(`${TMS_API_URL}/api/integration/orders` , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json' , 
                    'x-api-key' : `${TMS_API_KEY}`
                },
                body: JSON.stringify({payload})
            });

            let result = await response.json();

            if(response.status === 201){
                res.status(201).json({message: 'success'})
            };
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.patch('/sync' , validateApiKey , async (req , res) => {
    try{
        const {unsyncedOrders} = req.body;

        for (const order of unsyncedOrders) {
            const {error} = await supabase
            .from('erp_orders')
            .update({order_status: order.order_status})
            .eq('order_number' , order.order_number)

            if (error) throw error
        }

        

        res.status(200).json({message: 'success'})
    }catch(err){
        res.status(500).json({error: err.message})
    }
});

router.get('/order-form' , async (req , res) => {
    try{
        const {data: shipperLocations , error: shipperLocationError} = await supabase
            .from('shipper_locations')
            .select('*')

        if(shipperLocationError) throw shipperLocationError

        const {data: products , error: productError} = await supabase
            .from('products')
            .select('*')

        if(productError) throw productError

        const {count: orderCount , error: orderCountError} = await supabase
            .from('erp_orders')
            .select('*' , {count: 'exact' , head: true})

        if(orderCountError) throw orderCountError

        const { data: customerLocations, error: customerLocationsError} = await supabase
                    .from('customer_locations')
                    .select('*');
        
                if (customerLocationsError) console.log(customerLocationsError);

        res.status(200).json({shipperLocations , products , orderCount , customerLocations})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

module.exports = router