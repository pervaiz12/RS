var express = require('express')
path = require('path');
mongoose = require('mongoose')
var mongodbConnect = require('./config/dbconnection')
var Notification = require('./model/notification')

var userRoutes = require('./routes/userRoutes')
var cors = require("cors")
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));



app.use(cookieParser());

//cors Policy it 
app.use(cors())

// Load Routes
app.use("/api/user", userRoutes)
const { Socket } = require('net');


//static folder routes
app.use('/uploads', express.static(path.resolve(__dirname, "uploads")))
app.use('/resized', express.static(path.resolve(__dirname, "resized")))




// mongoose.Promise = global.Promise;

// mongoose.connect("mongodb://localhost:27017/schoo", { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
//     if (!error) {
//         console.log("Success");
//     }
//     else {
//         console.log("sorry ");
//     }
// });



// PORT
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log('Listening on port ' + port)
})
const socket = require('socket.io')(server);
socket.on('connection', socket => {


    console.log('Socket: client connected');
    //for emit to every component
    // socket.on('message', (msg, leave_id) => {
    //     socket.broadcast.emit('message-broadcast', { "id": msg, "message": "reject", "leaveID": leave_id });

    // });
    socket.on('message', async (request) => {
        console.log("new message", request);
        // socket.broadcast.emit('message-broadcast', request.message);
        socket.to(request.reciever).emit("message-broadcast", request.message);

        const doc = new Notification({
            leaveRequest_id: request?.leaveRequest_id,
            sender_id: request.sender,
            message: request.message,
            reciever_id: request.reciever,
            isread: false,

        })
        await doc.save()


    });
    socket.on('joinNotifications', (params, cb) => {
        socket.join(params.sender)
        cb()
    })

    socket.on('sendNotifications', async (request) => {
        console.log(">>>>>>>>>>>>>>>>>LLLLLLLLLLLLLL", request.reciever)
        socket.to(request.reciever).emit("recieveNotifications", request);
        const doc = new Notification({
            leaveRequest_id: request.leaveRequest_id,
            sender_id: request.sender,
            message: request.message,
            reciever_id: request.reciever,
            isread: false,

        })
        await doc.save()


        // socket.to(request.reciever).emit('recieveNotifications', request)
    })
});






