var express = require('express')
path = require('path');
mongoose = require('mongoose')
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

//cors Policy
app.use(cors())

// Load Routes
app.use("/api/user", userRoutes)


//static folder routes
app.use('/uploads', express.static(path.resolve(__dirname, "uploads")))
app.use('/resized', express.static(path.resolve(__dirname, "resized")))





mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/schoo", { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (!error) {
        console.log("Success");
    }
    else {
        console.log("sorry ");
    }
});

// PORT
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Listening on port ' + port)
})




