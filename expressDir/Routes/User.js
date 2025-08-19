const express = require("express")

const router = express.Router()

router.get("/:id", (req,res) => {
    console.log(req.params)
    res.send("this is request : ")
})

router.post("/", (req,res) => {
    let body = req.body
    console.log(body)
    res.send("this is body : ")
})

module.exports  = router;