const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const admin = require("firebase-admin")
const serviceAccount = require("./fir-pushnotifications-176af-firebase-adminsdk-fbsvc-f05b7c2e31.json");

const app = express()

const storage = multer.memoryStorage(); // keep file in memory (good for uploading to Cloudinary)
const upload = multer({ storage });

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",     // Or specify your Android app's domain/IP
        methods: ["GET", "POST"]
    }
});

admin.initializeApp(    //for firebase
    { credential: admin.credential.cert(serviceAccount) }    
);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000
server.listen(PORT , () => {console.log(`Server running on port ${PORT}`)})


mongoose.connect(process.env.MONGODB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fcmTokens: { type: [String], default: [] }
});
const videoSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
});
const User = mongoose.model('users', userSchema);
const Video = mongoose.model('videos' , videoSchema)

app.get("/" , verifyToken , (req,res) => {
    res.send({
        success : true ,
        message : "Valid Token"
    })
})

app.post("/register" , async (req,res)=> {
    console.log(req.body)
    const {name, username, password} = req.body

    const alreadyExists = await User.findOne({username})
    if (alreadyExists){ 
        res.send({
            success : false ,
            message : "User already exists"
        }) 
    } 

    const hash = await bcrypt.hash(password, 10);
    try {
        await User.create({ name, username, password: hash });
        res.send({
            success : true ,
            message : "User created successfully"
        })
    } catch (err) {
        res.status(400).send({
            success : false ,
            message : 'Error creating user'
        });
    }
})

app.post("/login" , async (req ,res) => {
    const {username , password} = req.body

    const mongodbUser = await User.findOne( {username} );
    if (!mongodbUser) {
        return res.status(400).send(
            {
                success: false,
                message: "User not found"
            }
        );
    }
    const isMatch = await bcrypt.compare(password, mongodbUser.password);
    
    if(!isMatch){
        return res.json(
            {
                success: false,
                message: "Incorrect password"
            }
        )
    }
    
    const token = jwt.sign({ id: mongodbUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
    res.status(200).json(
        { 
            success: true,
            message: "Login successful",
            token : token
        }
    );

})

app.delete("/logout" , verifyToken ,(req,res) => {
    res.clearCookie('token', { httpOnly: true });
    
    console.log("in logout")
    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
})

app.get("/videos",verifyToken ,async (req,res) => {
    const videos = await Video.find()
    res.send(videos)
})

app.get("/users",verifyToken, async (req,res) => {
    const users = await User.find()
    res.send(users)
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post("/videos" , verifyToken , upload.single("video") , async (req,res) => {
    try {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "video" },
            async (error, result) => {
                if (error) {
                    return res.json({ success: false, message: error.message });
                }

                // Save to MongoDB
                await Video.create({
                    title: req.body.title,
                    description: req.body.description,
                    publicId: result.public_id ,
                    url: result.secure_url
                });

                res.json({ success: true, message: "Video Uploaded Successfully" });
            }
        );
        stream.end(req.file.buffer); // send the file buffer from multer to Cloudinary
    } 
    catch (err) {
        res.json({ success: false, message: err.message });
    }

})

app.delete("/videos" , verifyToken ,async (req,res) => {
    const publicId = req.query.publicId;
    try{
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        await Video.deleteOne( { publicId } )
        res.send({success : true , message : "Video Deleted Successfully"})
    }
    catch (e) {
        console.log(e.message)
        res.send({success : false , message : e.message})
    }
})

app.get("/home", verifyToken, async (req,res)=>{
    const user = await User.findById(req.user.id)
    res.render("home.ejs",{user : user})
})

app.post("/registerNotification" , verifyToken , async (req,res) => {
    const {username , fcmtoken} = req.body
    await User.updateOne(
        {username : username},
        { $addToSet: { fcmTokens: fcmtoken } }
    )

    res.json({ success: true , message : "FCM token inserted successfuly"});
})

app.post("/notification" ,verifyToken ,async (req,res) => {
    const { title, body } = req.body;
    const username = req.query.username;

    try{    
        const user = await User.findOne({username})
        console.log(user.fcmTokens[0])
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            return res.json({ success: false, message: "No tokens found for user" });
        }

        const message = {
            notification: {
                title: title,
                body: body
            },
            tokens : user.fcmTokens
        };

        const response = await admin.messaging().sendEachForMulticast(message)

        res.json({ success: true, message: "Notification sent", response });
    }    
    catch(error) {
        console.log("Error sending message:", error);
        res.send( {success : false , message : error.message} )
    };
})

function verifyToken(req,res,next){
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.json({ success: false, message: "No token provided" });
    }

    jwt.verify(token , process.env.JWT_SECRET , (err,user)=>{
        if (err){
            res.json({success : false , message : "Invalid token"})
        }
        else {
            req.user = user
            next()
        }
    })
    
}


const userSocketMap = {};
io.use((socket , next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("No token provided"));
    }
    jwt.verify(token , process.env.JWT_SECRET , (err,user)=>{
        if (err){
            return next(new Error("Invalid Token"));
        }
        else {
            console.log(user)
            socket.user = user
            next()
        }
    })
})
io.on("connection", (socket) => {
    // Store mapping: userId -> socketId
    userSocketMap[socket.user.id.toString()] = socket.id;

    console.log(`User ${socket.user.id} connected with socket id ${socket.id}`);
    
    socket.on("chat message", async (data) => {
        console.log("Received message from", socket.user.id, ":", data);

        //get username from mongodb
        let receivingUser = await User.findOne( {username : data.toUserName} )
        
        // Example: Send to specific user
        const receiverSocketId = userSocketMap[receivingUser._id.toString()];
        console.log("receiving user :" , receivingUser)
        // io.emit("chat message" , {from: socket.user.id,
        //         message: `${data.message} to : ${receiverSocketId}`})

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("chat message", {  
                from: socket.user.id,
                message: data.message,
            });
        }


    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.user.id} disconnected`);
        delete userSocketMap[socket.user.id.toString()];
    });
});