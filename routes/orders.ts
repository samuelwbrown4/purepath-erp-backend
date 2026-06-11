const express = require('express')
import { Request , Response } from "express";
const router = express.Router()
const { supabase } = require('../db/supabase');
const { validateApiKey } = require('../middleware/api');

const TMS_API_KEY = process.env.TMS_API_KEY;
const TMS_API_URL = process.env.TMS_API_URL;

interface LineItem {
    productId: string
    quantity: number
    weight: number
}

interface SupplierProductRow {
    products: {
        id: string
        material_number: string
        description: string
        weight: number
        freight_class: string
        unit_of_measure: string
        product_type: string
    }
}

router.post('/new', async (req: Request, res: Response) => {
    try {


        const { payload } = req.body
        console.log('payload.companyId:', payload.companyId)

        if (payload.customerId) {
            const { data: customerData, error: custDataError } = await supabase
                .from('customers')
                .select('tms_customer_id')
                .eq('id', payload.customerId)
                .single()

            const tmsCustomerId = customerData.tms_customer_id
            payload.tmsCustomerId = tmsCustomerId
        }

        payload.tmsOrderDestId = payload.orderDestId

        if (payload.directionCategory === 'outbound') {
            const { data: custLocData, error: custLocDataError } = await supabase
                .from('customer_locations')
                .select('tms_customer_location_id')
                .eq('id', payload.orderDestId)
                .single()

            payload.tmsOrderDestId = custLocData.tms_customer_location_id
        }

        const { data, error: erpOrderError } = await supabase
            .from('erp_orders')
            .insert({

                origin_id: payload.orderOriginId,
                destination_id: payload.orderDestId,
                order_number: payload.orderNumber,
                customer_po_number: payload.custPoNumber ? payload.custPoNumber : null,
                requested_ship_date: payload.shipDate,
                order_status: payload.orderStatus,
                direction_category: payload.directionCategory,
                company_id: payload.companyId,
                customer_id: payload.customerId,
                supplier_id: payload.supplierId,
                shipper_id: payload.shipperId,
                customer_location_id: payload.customerLocId
            })
            .select();

        if (erpOrderError) throw erpOrderError;

        const { error } = await supabase
            .from('order_line_items')
            .insert(payload.lineItems.map((li: LineItem) => ({
                order_id: data[0].id,
                product_id: li.productId,
                quantity: li.quantity,
                total_weight_lbs: li.weight
            })));

        if (error) throw error;

        let response = await fetch(`${TMS_API_URL}/api/integration/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${TMS_API_KEY}`
            },
            body: JSON.stringify({ payload })
        });

        let result = await response.json();

        if (response.status === 201) {
            res.status(201).json({ message: 'success' })
        };
    } catch (err){
    if (err instanceof Error) {
        res.status(500).json({ error: err.message })
    } else {
        res.status(500).json({ error: 'An unknown error occurred' })
    }
}
});

router.patch('/sync', validateApiKey, async (req: Request, res: Response) => {
    try {
        const { unsyncedOrders } = req.body;

        for (const order of unsyncedOrders) {
            const { error } = await supabase
                .from('erp_orders')
                .update({ order_status: order.order_status })
                .eq('order_number', order.order_number)

            if (error) throw error
        }



        res.status(200).json({ message: 'success' })
    } catch (err){
    if (err instanceof Error) {
        res.status(500).json({ error: err.message })
    } else {
        res.status(500).json({ error: 'An unknown error occurred' })
    }
}
});

router.get('/order-form', async (_req: Response, res: Response) => {
    try {
        const { data: shipperLocations, error: shipperLocationError } = await supabase
            .from('shipper_locations')
            .select('*')

        if (shipperLocationError) throw shipperLocationError

        const { data: products, error: productError } = await supabase
            .from('products')
            .select('*')

        if (productError) throw productError

        const { count: orderCount, error: orderCountError } = await supabase
            .from('erp_orders')
            .select('*', { count: 'exact', head: true })

        if (orderCountError) throw orderCountError

        const { data: customerLocations, error: customerLocationsError } = await supabase
            .from('customer_locations')
            .select('*');

        if (customerLocationsError) throw customerLocationsError;

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*');

        if (companyError) throw companyError;

        const { data: supplierLocations, error: supplierLocationsError } = await supabase
            .from('suppliers')
            .select('*');

        if (supplierLocationsError) throw supplierLocationsError;

        res.status(200).json({ shipperLocations, products, orderCount, customerLocations, company, supplierLocations })
    } catch (err){
    if (err instanceof Error) {
        res.status(500).json({ error: err.message })
    } else {
        res.status(500).json({ error: 'An unknown error occurred' })
    }
}
});

router.get('/all', async (_req: Request, res: Response) => {
    try {
        const { data: orders, error } = await supabase
            .from('erp_orders')
            .select(`
        *,
        order_line_items (quantity, total_weight_lbs),
        shipper_locations!fk_shipper_id (name, erp_id, city, address, state),
        suppliers!fk_supplier_id (name, city, address, state),
        customer_locations!fk_customer_location_id (name, city, address, state)
    `)

        console.log('with customer_locations:', orders, error)

        res.status(200).json({ orders })
    } catch (err){
    if (err instanceof Error) {
        res.status(500).json({ error: err.message })
    } else {
        res.status(500).json({ error: 'An unknown error occurred' })
    }
}
})

router.get('/supplier-products/:orderOriginId', async (req: Request, res: Response) => {
    try {
        const { orderOriginId } = req.params;

        let { data: supplierProducts, error: supplierProductsError } = await supabase
            .from('supplier_products')
            .select(`
                products (
                    id,
                    material_number,
                    description,
                    weight,
                    freight_class,
                    unit_of_measure,
                    product_type
                )
            `)
            .eq('supplier_id', orderOriginId)

        supplierProducts = supplierProducts.map((row: SupplierProductRow) => row.products)

        res.status(200).json({ supplierProducts })
    } catch (err){
    if (err instanceof Error) {
        res.status(500).json({ error: err.message })
    } else {
        res.status(500).json({ error: 'An unknown error occurred' })
    }
}
})

module.exports = router