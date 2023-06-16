const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const kws = require('./KeyWords.js');
const fs = require("fs");
let timeoutId;
let first_go = true;
const path = require('path')


const io = new Server(server)//,{
//     cors: { //this stays because It is useful
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });
//change the socket port here for front end
server.listen(5001, () => {
    console.log('listening on *:5001');
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connect', (socket) => {
    console.log('socket connected');
    setTimeout(function () {
        socket.emit('serverMessage', 'My name is AGIM, I\'m here to help you learn how to play chess');
    }, 500);
    setTimeout(function () {
        socket.emit('serverMessage', 'I can also record your games (not againt me), just ask me to ' +
            '"start recording" and "stop recording" to stop and "review game" to see your moves');
    }, 500);
    setTimeout(function () {
        socket.emit('serverMessage', 'would you like me to start with the basics?');
    }, 500);

    socket.on('clientMessage', (data) => {
        console.log('received from client: ' + data);
        if (first_go) {
            setTimeout(function () {
                kws.converstaion_handler(data).then((result) => {
                    socket.emit('serverMessage', result);
                })
            }, 500);
            first_go = false;
        }
        kws.converstaion_handler(data).then((result) => {
            socket.emit('serverMessage', result);
        })
    });
    socket.on('disconnect', (socket) => {
        console.log('socket disconnected');
    })
});
io.on('disconnect', (socket) => {
    console.log('socket disconnected');
})

