import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getAllVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router.route("/:videoId").get(getVideoComments).post(addComment);
// router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

router.route("/create/:channelId/:videoId").post(verifyJWT,addComment);
router.route("/vid-comments/:videoId").get(verifyJWT,getAllVideoComments);
router.route("/delete-comment/:commentId").post(verifyJWT,deleteComment);
router.route("/update-comment/:commentId").post(verifyJWT,updateComment);

export default router