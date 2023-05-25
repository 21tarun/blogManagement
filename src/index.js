const express = require('express')
const app = express();
const  mongoose = require('mongoose');
mongoose.set('strictQuery', true); /// to handle the deprication error
const route = require('./routes/route.js');

app.use(express.json())

mongoose.connect("mongodb+srv://tarun21:tarun1616@cluster0.h0l8mir.mongodb.net/task1", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen(4000, function(){
 console.log("server running on port" + 4000);
}) 