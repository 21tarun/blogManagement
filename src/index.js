const express = require('express')
const app = express();
const  mongoose = require('mongoose');
mongoose.set('strictQuery', true); /// to handle the deprication error
const route = require('./routes/route.js');
require('dotenv').config();

app.use(express.json())

mongoose.connect(process.env.MONGODB_CLUSTER, {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route)

app.listen(4000, function(){
 console.log("server running on port" + 4000);
}) 