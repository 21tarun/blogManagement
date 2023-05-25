const mongoose = require('mongoose');



const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'author9'
    },

    category: {
        type: String,
        required: true
    },

    deletedAt: {
        type : Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
   publishedAt: {
    type : Date
},
    isPublished: {
        type: Boolean,
        default: false
    }
},{timestamps  : true}
)

module.exports = mongoose.model('blog9', blogSchema)