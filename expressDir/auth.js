const express = require("express")
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config();

const crypto = require("crypto");

const app = express()

app.use(express.json())

let port = 4000

app.listen(port , ()=> { console.log(`server listening on port ${port}`) })

let refreshTokens = []

app.post("/login" , (req,res) => {
    body = req.body
    username = body.username
    usernameObj = {username : username}

    const jwtToken = jwt.sign(usernameObj , process.env.SECRET_KEY , {expiresIn : "30s"})
    const refreshToken = jwt.sign(usernameObj , process.env.REFRESH_TOKEN )
    refreshTokens.push(refreshToken)

    res.json({jwtToken:jwtToken , refreshToken : refreshToken})
})

app.post("/token" , (req , res) => {
    refreshToken = req.body.token
    console.log(refreshTokens)
    if (refreshToken == null ) {return  res.send("token null") }
    if (!refreshTokens.includes(refreshToken)){
        res.send("no token matched")
    }
    jwt.verify(refreshToken , process.env.REFRESH_TOKEN , (err, user)=>{
        if (err) {return res.send("error verifying")}
        const jwtToken = jwt.sign({username : user.username} , process.env.SECRET_KEY , {expiresIn : "30s"})
        res.json({jwtToken : jwtToken})
    })
})

app.delete("/logout" , (req,res)=>{
    refreshToken = req.body.token
    refreshTokens = refreshTokens.filter((token) => {token !== refreshToken})
    res.send("deleted successfully")
})

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