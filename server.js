const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const kws = require('./KeyWords.js');
let use_API = false;
let first_go = true;
const path = require('path')
const axios = require('axios');
const fs = require('fs')
const port = process.env.PORT || 5001;
const io = new Server(server)//,{
//     cors: { //this stays because It is useful
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });
//change the socket port here for front end
server.listen(port, () => {
    console.log('listening on *: ', port);
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connect', (socket) => {
    console.log('socket connected');
    setTimeout(function () {
        socket.emit('serverMessage', 'My name is AGIM, I\'m here to help you learn how to play chess');
    }, 800);
    setTimeout(function () {
        socket.emit('serverMessage', 'I can also record your games (not againt me), just ask me to ' +
            '"start recording" and "stop recording" to stop and "review game" to see your moves');
    }, 800);
    setTimeout(function () {
        socket.emit('serverMessage', 'would you like me to start with the basics?');
    }, 800);

    socket.on('clientMessage', (data) => {
        console.log('received from client: ' + data);
        if (!first_go) {
            setTimeout(function () {
                kws.converstaion_handler(data).then((result) => {
                    socket.emit('serverMessage', result);
                })
            }, 500);
            first_go = false;
        } else {
            if (use_API) {
                Azure(data).then((result) => {
                    socket.emit('serverMessage', result);
                });
            } else {
                kws.converstaion_handler(data).then((result) => {
                    if (result === "$") {
                        use_API = true
                        socket.emit('serverMessage', "switching to LUIS")
                    } else {
                        socket.emit('serverMessage', result);
                    }
                });
            }
        }

    });
    socket.on('disconnect', () => {
        console.log('socket disconnected');
    })
});
io.on('disconnect', () => {
    console.log('socket disconnected');
});
// const answersFile1 =JSON.parse(fs.readFileSync('Rule.txt'));
// const answersFile2 = JSON.parse(fs.readFileSync('Pieces.txt'));

// const answers = {... answersFile1, ...answersFile2};
async function Azure(data) {
    if (data.toLowerCase() === "agim") {
        use_API = false;
        return "Leaving LUIS, Going back to AGIM"
    }
    // try {
    //     // making API call to LUIS using axios or another HTTP client library
    //     const response = await axios.get('https://chess-rule-cb-123.cognitiveservices.azure.com/prediction/v3.0/apps/1fe71a46-17ad-440c-8a78-541a462d3efa/slots/production/predict', {
    //         params : {
    //             query : data,
    //             verbose : true,
    //             'show all intents': true,
    //             // Include any additional parameters required by LUIS
    //         },
    //         headers: {
    //             'Authorization' : 'bearer dec1883a01874e5888457eeaf5a7af7d',
    //             // Add any required headers for authentication or other purposes
    //         },
    //     });
    //
    //     // Extract the answer string from the API response
    //     const topIntent = response.data.prediction.topIntent;
    //     const answer = answers[data.toLowerCase()];
    //     if (answer) {
    //         return answer;
    //     }else{
    //         return 'sorry i could not find an answer to your question'
    //     }
    //
    // } catch (error) {
    //     console.error('Error occurred during LUIS API call:', error);
    //     // Handle the error or return an error message
    //     return 'sorry an error occured while accessing the luis azure API';
    // }

}



