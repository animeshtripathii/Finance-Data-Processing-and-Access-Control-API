const jwt=require('jsonwebtoken');
const user=require('../models/User.model');

const authmiddleware=async(req,res,next)=>{
  try{
    const token=req.cookies.token;
   if(!token){
    return res.status(401).json({success:false,message:"Unauthorized"});
   }
   const decode=jwt.verify(token,process.env.JWT_Secret_Key);
    const userId=decode.id;
    const userData=await user.findById(userId).select('-password');
    if(!userData){
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
    if(!userData.isActive){
      return res.status(403).json({success:false,message:"User is inactive"});
    }
    req.user=userData;
    next();
  }catch(error){
    console.error("Error in authmiddleware:",error);
    res.status(401).json({success:false,message:"Unauthorized"});
  }
};
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports={authmiddleware, requireRole};