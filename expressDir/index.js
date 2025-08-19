const express = require("express")
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config();

const crypto = require("crypto");

const app = express()

app.use(express.json())

let port = 3000

app.listen(port , ()=> { console.log(`server listening on port ${port}`) })

app.get("/posts" , auth , (req , res) => {
    let user = req.user
    res.send(`hi from posts from user ${user.username}`)
})

function auth(req , res ,next){
    console.log(req.headers);

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        res.send("<h1>token missing</h1>")
    }
    else{
        jwt.verify(token , process.env.SECRET_KEY , (err, user) => {
            if (err) {res.send("acces denied")}
            req.user = user
            next()
        })
    }
}

app.post("/testLogin" , (req , res) => {
    body = req.body
    username = body.username
    usernameObj = {username : username}
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const iat = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({username : "awais" , iat:iat})).toString("base64url");

    console.log(header)
    console.log(payload)

    const data = `${header}.${payload}`

    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(data)
        .digest("base64url");

    console.log(`${data}.${signature}`)

    jwtToken = jwt.sign(usernameObj , process.env.SECRET_KEY)
    console.log("jwtToken : ")
    console.log(jwtToken)
    res.json({jwytToken:jwtToken})
})