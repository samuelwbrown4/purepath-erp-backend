"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const companiesRoutes = require('./routes/companies');
const customersRoutes = require('./routes/customers');
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5174', 'https://purepath-erp.com', 'https://www.purepath-erp.com'],
    credentials: true
}));
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/customers', customersRoutes);
app.get('/', (req, res) => {
    res.send('ERP app up and running!');
});
app.listen(PORT, () => {
    console.log(`ERP app running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map