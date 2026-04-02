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

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON format in request body' });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';
    return res.status(statusCode).json({ success: false, message });
});


module.exports=app;