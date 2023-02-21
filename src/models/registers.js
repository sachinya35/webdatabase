const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt= require("jsonwebtoken");

const employeSchema= new mongoose.Schema({
    firstname:{
        type: 'string',
        required: true
    },
    lastname:{
        type: 'string',
        required: true
    },
    password:{
        type: 'string',
        required: true
    },
    cpassword: {
        type: 'string',
        required: true
    }
    ,
    gender:{
        type: 'string',
        required: true
    },
    email:{
        type: 'string',
        required: true,
        unique: true
    },
    phone:{
        type: 'number',
        required: true,
        unique: true
    },
    tokens:[{
        token:{
            type: 'string',
            required: true
        }
    }]
    
});
// geting tokens
employeSchema.methods.generateAuthToken=async function(){
    try{
        
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(e){
        res.send("the error is"+ e);
        console.log("the error is"+ e)
    }
}

// hashing
employeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password =await bcrypt.hash(this.password,10)
        this.cpassword=await bcrypt.hash(this.password,10)
    }
    next();

})

const Register=new mongoose.model("Register",employeSchema);
module.exports = Register;