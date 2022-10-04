var mongoose= require('mongoose')
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/schoo", { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (!error) {
        console.log("Success ttttt");
    }
    else {
        console.log("sorry ");
    }
});