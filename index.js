const express = require('express');
const http = require('http');
const SocketIo = require('socket.io');
const {createClient} = require('redis');
require('dotenv').config();
const redisClient = createClient();
const app = express();
app.set("view engine" , "ejs");
const server = http.createServer(app);

const io = SocketIo(server , {cors:{origin: "*"}});

async function sendMessage(socket){
    redisClient.lrange("messages" , 0 , -1 , (err , data)=>{
        data.map(item =>{
            const [username , message] = item.split(":");
            socket.emit("message" , {
                username,
                message
            })
        })
    })
} 

io.on("connection" , socket=>{
    sendMessage(socket);
    socket.on("message" , ({username , message})=>{
        redisClient.rpush("messages" , `${username}:${message}`);
        io.emit("message" , {username,message});
    })
})

app.get("/" , (req, res)=>{
    res.render("login")
});

app.get("/chat" , (req, res)=>{
    const {username} = req.query;
    res.render("chat" , {username});
});

const port = process.env.PORT;

server.listen(port , ()=> console.log(`connecting to port ${port} successfully...`));
