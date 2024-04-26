import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    const existerUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existerUser) {
        throw new ApiError(409, "user with email or username already exists.")
    }

    // check for images, check avatar exist
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files)

    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)
    && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


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
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    // remove password & refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while")        
    }

    // return resposne
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )
})

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const loginUser = asyncHandler(async(req, res) => {
    // req body -> data
    const {email, username, password} = req.body

    // username or email
    if  (!username || !email) {
        throw new  ApiError (400, "username or email is required")
    }
    
    // find the user
     const user = await User.findOne({
            $or: [{username},{email}]
        })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")
    }

    // access and refresh token
    const {accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = User.findById(user._id).
    select("-password -refreshToken")

    // send access & refresh as cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken", refreshToken, options).
    json(
        new ApiResponse (
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in succesfully"
        )
    )


})

export {
    registerUser,
    loginUser
}