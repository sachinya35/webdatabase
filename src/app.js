require('dotenv').config();
const express= require("express");
const path= require("path");
const bcrypt= require("bcryptjs");
const jwt= require("jsonwebtoken");
const cook= require("cookie-parser");

const app = express();
const hbs = require("hbs");
require("./db/conn")
const auth = require("./middleware/auth");
const Register=require("./models/registers")
const port = process.env.PORT || 4000;

const staticPath = path.join(__dirname,"../public");
const templatePath = path.join(__dirname,"../templates/views");
const partialPath = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cook());
app.use(express.urlencoded({extended:false}));    

app.use(express.static(staticPath));
app.set('view engine','hbs');
app.set('views',templatePath);
hbs.registerPartials(partialPath);

console.log(process.env.SECRET);


app.get("/",(req,res)=>{   
    res.render("index")
})

app.get("/secret",auth,(req,res)=>{  
    console.log(`my cookie  ${req.cookies.jwt}`); 
    res.render("secret")
});

 

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/login",(req,res)=>{   
    res.render("login")
})

app.get("/logout",auth,async (req,res)=>{   
    try {
        // for single logout
        // req.user.tokens=req.user.tokens.filter((currElement)=>{
        //     return currElement.token!=req.token;
        // })


        // for multiy logout
        // req.user.tokens=[];


        res.clearCookie("jwt");
        console.log("logout successfully")
        await req.user.save();
        res.render("login")

    }catch(e) {
        res.status(500).send(e);
    }
})

app.post("/register",async (req,res)=>{
    try{
        const password = req.body.password;
        const cpassword=req.body.cpassword;
        if(password===cpassword){
            const registeremploye=new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                password:req.body.password,
                cpassword:req.body.cpassword,
                gender:req.body.gender,
                email:req.body.email,
                phone:req.body.phone 

            })
            
            const token=await registeremploye.generateAuthToken();
            
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+300000),
                httpOnly:true
            });
            console.log(cookie)
            
            const register=await registeremploye.save();
            res.status(201).render('index')
            
        }else{
            res.send("password are not matching");
        }
    }catch(e){
        res.status(400).send(e)
    }
   
})

app.post("/login",async (req,res)=>{
    try{
        const password = req.body.password;
        const email=req.body.email;

        const usermail=await Register.findOne({email: email});
        const isMatch=await bcrypt.compare(password,usermail.password);

        const token=await usermail.generateAuthToken(); 
        console.log("toke is"+token)

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+70000),
            httpOnly:true
        });

       

        if(isMatch){
            res.status(200).render('index')
        }else{
            res.send("envalid");
        }
    }catch(e){
        res.status(400).send(e)
    }
   
})



app.listen(port, ()=>{
    console.log(`listen to ${port}`)
})