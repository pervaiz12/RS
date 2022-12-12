var express = require('express')
path = require('path');
mongoose = require('mongoose')
var mongodbConnect = require('./config/dbconnection')
var Notification = require('./model/notification')
var admin = require("firebase-admin");

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
//firebase
var registrationToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7InVzZXJfaWQiOiI2MjY3NzhmMmU3MWIzZjk4ODhkNTdhMGUifSwiZW1haWwiOiJzb2xlYmVycnkwMTJAZ21haWwuY29tIiwic3ViIjoiNjI2Nzc4ZjJlNzFiM2Y5ODg4ZDU3YTBlIiwiZXhwaXJlIjoxNjY2Njc1NjExNjE4fQ.8PcYS0SF53e_lRNbFuj4mQnXxHsKYgsng87V3q7Rolw';

var serviceAccount = require('./fcm-messaging-4b5d8-firebase-adminsdk-k8e0q-b73a7852ac.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fcm-messaging-4b5d8.firebaseio.com'

});

app.post('/notification/sendToSpecific', (req, res) => {


    const  registrationToken = "fkhWEaBkHVa4NKfPQjz_jx:APA91bHMjTTD4aGCjUBks59qZn-SI8GB6UTPUDVCCmtFBt59Q92AGuYPo9zc5BbwHk_pwtVvnzLqaIwgmQaWUCDoWSsOMoU_eJWHFpp1zdcqO_fCYU8ZNUnM76jGqpu1UVBIVAUbxHti"

              const message = {
        "notification":{
            "title":" seebiz....",
            "body":"Breaking News...."
        },
    }
      admin.messaging().sendToDevice(registrationToken, message)
      .then( response => {

       res.status(200).send("Notification sent successfully")

      })
      .catch( error => {
          console.log(error);
          res.status(500).send(error)

      });


    // These registration tokens come from the client FCM SDKs.
    // const registrationTokens = [
    //     "fkhWEaBkHVa4NKfPQjz_jx:APA91bHMjTTD4aGCjUBks59qZn-SI8GB6UTPUDVCCmtFBt59Q92AGuYPo9zc5BbwHk_pwtVvnzLqaIwgmQaWUCDoWSsOMoU_eJWHFpp1zdcqO_fCYU8ZNUnM76jGqpu1UVBIVAUbxHti",
    //     "cys94TiPdyuA9yovw8B_jP:APA91bG6Ykb0Ipd25ZFmHoOZqPnAW7CS3A08aFq_wJrOmYIiMm_gMMEV1PUX2DUQ_4_vBEIa5Mjkp5rUvFrHFJJLPdBcgH4ZPFd9_xJNuKTkgMipLWiVmyOybATBOZ8iu8i4NQn3NZNx"
    //   ];

    //   // Subscribe the devices corresponding to the registration tokens to the
    //   // topic.
    //                const topic = {
    //         "notification":{
    //             "title":" seebiz....",
    //             "body":"Breaking News...."
    //         },
    //     }
    //   admin.messaging().subscribeToTopic(registrationTokens, topic)
    //     .then((response) => {
    //       // See the MessagingTopicManagementResponse reference documentation
    //       // for the contents of response.
    //       console.log('Successfully subscribed to topic:', response);
    //     })
    //     .catch((error) => {
    //       console.log('Error subscribing to topic:', error);
    //     });


    // The topic name can be optionally prefixed with "/topics/".
    // const topic = 'everyone';

    // const message = {
    //     "notification":{
    //         "title":" seebiz....",
    //         "body":"Breaking News hina pervaiz...."
    //     },
    //     topic: topic
    // };


    // // Send a message to devices subscribed to the provided topic.
    // admin.messaging().send(message)
    //     .then((response) => {
    //         // Response is a message ID string.
    //         console.log('Successfully sent message:', response);
    //     })
    //     .catch((error) => {
    //         console.log('Error sending message:', error);
    //     });
})


//end















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






