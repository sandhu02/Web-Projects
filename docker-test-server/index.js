const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


app.listen(3000 ,()=>{
    console.log("server listening on port 3000")
})

const CONNECTION_STRING = "mongodb://admin:qwerty@localhost:27017/"
mongoose.connect(CONNECTION_STRING , {
    dbName: "dockerTest",
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});
 
userSchema = new mongoose.Schema(
    {name : { type: String, required: true } , username : { type: String, required: true }}
)

const User = mongoose.model("users" , userSchema)

app.get("/" , async (req,res)=> {
    const users = await User.find()
    res.send(users)
})

app.post("/" ,async (req,res) => {
    const {name , username}  = req.body
    try {
        await User.create({ name , username });
        res.send("user created successfully")
    } catch (error) {
        console.log(error)
        res.send("error creating user")
    }
})