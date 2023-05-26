const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");
const {isValid}= require('../validators/validation')
const mongoose=require('mongoose')

const redis=require('redis')
const {promisify}=require('util')



// create connection to redis with the help javascript redis module



const redisClient =redis.createClient(
    17291,
    "redis-17291.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    {no_ready_check:true}
)
redisClient.auth("T4ckV7zYmiiPepIZjIoFWLOQh9l0vSRz",function(err){
    if(err) throw err
})
redisClient.on("connect",async function(){
    console.log("connected to Redis")
})




// prepare function so that our redis module method return response in promise object, not by the call back function
const GET_ASYNC =promisify(redisClient.GET).bind(redisClient)
const SETEX_ASYNC=promisify(redisClient.SETEX).bind(redisClient)





//=================================================CREATE BLOG===============================================================================================
const createblog = async function (req, res) {
    try {
        let data = req.body;
        if (!isValid(data.title)) return res.status(400).send({ status: false, message: "title is necessary or not valid" });
        if (!isValid(data.body)) return res.status(400).send({ status: false, message: "body is necessary or not valid" });

        if (!data.authorId) return res.status(400).send({ status: false, message: "authorId is necessary" });
        if (!mongoose.Types.ObjectId.isValid(data.authorId)) return res.status(400).send({ status: false, message: "invalid userId" })
        if (!data.category) return res.status(400).send({ status: false, message: "category is necessary" });
        let validAuthor = await userModel.findById(data.authorId)
        if (!validAuthor) return res.status(404).send({ status: false, msg: "author not found" })

        let createdBlog = await blogModel.create(data);
 
        res.status(201).send({ status: true, data: createdBlog })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//======================================================GET BLOG BY FILTER and Pagination====================================================================
const getBlog = async function (req, res) {
    try {
        let data = req.query;
        data.isDeleted = false;
        
        // Check if the requested data is already cached
        const cacheKey = JSON.stringify(data);
        const cachedBlogs = await GET_ASYNC(cacheKey);
        if (cachedBlogs) {
            // Data exists in cache, return the cached data
            console.log("i am in cache memory")
            return res.status(200).send({ status: true, data: JSON.parse(cachedBlogs) });
            
        }
        
        // Data does not exist in cache, query the database
        // Pagination variables
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        // Query the database with pagination options
        let blogs = await blogModel.find(data)
        .skip(skip)
        .limit(limit)
        .populate('authorId');



        
    
        res.status(200).send({ status: true, data: blogs });
        // Cache the queried data
        await SETEX_ASYNC(cacheKey, 3600, JSON.stringify(blogs));

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


//==============================================UPDATE BLOG BY BODY================================================================================
const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).send({ status: false, message: "invalid blogId" })
        let data = req.body;
        let x = await blogModel.findOne({_id:blogId,isDeleted:false})
        if (!x) return res.status(404).send({ status: false, error: "No relevant data found by this Id" })

        // Authorization
        if (x.authorId != req.authorId) return res.status(403).send({ status: false, message: "You are not allowed to perform this modification" })



        let updatedBlog = await blogModel.findByIdAndUpdate(blogId, { $set: data }, { new: true })
        res.status(200).send({ status: true, data: updatedBlog })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



//================================================DELETE BLOG BY ID=============================================================================
const deleteBlog = async function (req, res) {
    try {
        let data = req.params.blogId;
        if (!mongoose.Types.ObjectId.isValid(data)) return res.status(400).send({ status: false, message: "invalid blogId" })
        let deletedBlog = await blogModel.findOne({_id:data,isDeleted:false})
        if (!deletedBlog) return res.status(404).send({ status: false, message: "No Data with this Id" })

        //Authorization
        if (deletedBlog.authorId != req.authorId) return res.status(403).send({ status: false, error: "You are not allowed to perform this modification" })


        await blogModel.findOneAndUpdate({ _id: data }, {isDeleted: true}, { new: true });
        res.status(200).send({status:true,message:"Sucessfully deleted"})
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



module.exports.createblog = createblog;
module.exports.getBlog = getBlog;


module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;