const dotenv=require('dotenv');
dotenv.config();
const mongoose=require('mongoose');
const app=require('./app');
const connectDB=require('./src/config/db');
const Port=process.env.PORT;
app.listen(Port,async()=>{
    await connectDB();
    console.log(`Server is running on port ${Port}`);
});
