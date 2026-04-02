const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const app=express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const authRoutes=require('./src/routes/auth.routes');
const recordRoutes=require('./src/routes/record.routes');
const dashboardRoutes=require('./src/routes/dashboard.routes');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth',authRoutes);
app.use('/api/records',recordRoutes);
app.use('/api/dashboard',dashboardRoutes);
app.get('/',(req,res)=>{
    res.send("Hello World");
});


module.exports=app;