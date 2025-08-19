const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')

const app = express()

app.set("view engine" ,"ejs")

const port = 3000

app.use(session(
    {secret : "mysecret" , saveUninitialized : true , resave : false,
        cookie : {
            expires : Date.now() + (30*1000),
            maxAge : 30*1000,
            httpOnly : true
        }
    },
))
app.use(flash())

app.listen(port , () => {
    console.log(`app is listening on port ${3000}`)
})

app.get("/login" , (req , res) => {
    if (req.session.count){
        req.session.count++
    }
    else {
        req.session.count = 1
    }

    res.locals.successMsg = req.flash("success")
    res.render("page.ejs" , {name:req.session.name.name })
})

app.get("/register" , (req, res) => {
    let name = req.query
    req.session.name = name
    req.flash('success',"name registered successfully")
    res.redirect("/login")
})