const express = require('express');
require('dotenv').config()
const cors = require('cors')
const app = express();
const orderRoutes = require('./routes/orders')

const PORT = 3000 || process.env.PORT

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5174', 'https://purepath-erp.com', 'https://www.purepath-erp.com'],
    credentials: true
}))

app.use('/api/orders' , orderRoutes)

app.get('/' , (req , res)=>{
    res.send('ERP app up and running!')
});

app.listen(PORT , ()=>{
    console.log(`ERP app running on port ${PORT}`)
})