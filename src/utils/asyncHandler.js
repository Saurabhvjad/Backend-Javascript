const asyncHandler = (requestHandeler) => {
    (req, res, next) => {
        Promise.resolve(requestHandeler).
        catch((err) => next(err))
    }
}

export {asyncHandler}

// const asyncHandler = (func) => {() => {}}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }