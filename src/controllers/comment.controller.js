import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getAllVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID is missing");
    }

    const skipCount = (page - 1) * limit; // Calculate the number of documents to skip

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $skip: skipCount, // Skip documents based on the page number
        },
        {
            $limit: limit, // Limit the number of documents per page
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, comments, "comments fetched succesfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {channelID, videoId} = req.params
    const {content} = req.body

    if(!channelID || !videoId){
        throw new ApiError(400, "Channel ID or Video ID is missing")
    }

    if(!content){
        throw new ApiError(400, "content is missing")
    }

    const comment = await Comment.create(
        {
            content,
            video: videoId,
            owner: channelID
        }
    )

    if(!comment) {
        throw new ApiError(400, "error while creating comment")
    }


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentID} = req.params
    const {content} = req.body

    if(!commentID) {
        throw new ApiError(400, "No Comment ID was found")
    }

    if(!content) {
        throw new ApiError(400, "Content is missing while updating comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentID,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if(!updatedComment) {
        throw new ApiError(400, "Error while updating the comment")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedComment, "comment was updated succesfully"))


    

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentID} = req.params

    if(!commentID) {
        throw new ApiError(400, "No Comment ID was found")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentID)

    if(!deletedComment) {
        throw new ApiError(400, "Error while deleting the comment")
    }

    return res.status(200)
    .json(new ApiResponse(200, deletedComment, "comment was deletd succesfully"))
})

export {
    getAllVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }