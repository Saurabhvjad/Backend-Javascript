import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler( async(req, res) => {
    // get user details from front end
    const {fullName, email, username, password }= req.body
    console.log("email: ",email);

    // check if recieved details are not empty
    if ([fullName, email, username, password].some((field)=> 
    field?.trim() === "" )) {
        throw new ApiError(400, "All Fields are required")        
    }

    // check if user already exists
    const existerUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existerUser) {
        throw new ApiError(409, "user with email or username already exists.")
    }

    // check for images, check avatar exist
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files)

    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")        
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    
    // create user object - create entry in db
    // remove password & refresh token from response
    // check for user creation
    // return resposne
})


export {registerUser}