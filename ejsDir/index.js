const express = require("express")
const path = require("path")
let app = express()

const port = 3000

app.set("views" , path.join(__dirname , "/views"))
app.set("view engine" , "ejs")

app.listen(port , ()=>{console.log(`server listening on port ${port}`)} )
app.use(express.urlencoded({extended : true}))

app.get(("/") ,(req,res)=> {res.send("hello")} )

app.get(("/home") , (req,res)=>{
    res.render("home.ejs")
})


app.get("/rolldice" , (req, res)=>{
    let diceval = Math.floor(Math.random()*100) + 1

    res.render("home" , {num : diceval})
})

app.get(("/ig/:username/:password") , (req,res)=>{
    let {username} = req.params
    let {password} = req.params

    console.log(username , password)

    res.render("instagram.ejs" , {username , password})
} )

app.get(("/form") ,(req,res) => {
    let {username , password} = req.query

    res.send(`username is ${username} and pasword is ${password}`)
} )

app.post(("/form") ,(req,res) => {
    let {username , password} = req.body
    console.log(req.body)
    res.send(`POST\n username is ${username}\npassword is ${password}`)
    // res.render("response.ejs" , {username , password})
} )