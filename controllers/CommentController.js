import Comments from "../models/Comments.js";
import Post from "../models/Post.js";

export const createComment = async (req, resp) => {
  try {
    const content = new Comments({
      comment: req.body.comment,
      user: req.userId,
    });
    const newComment = await content
      .save()
      .then((comment) => comment.populate("user"));
    const postId = req.params.id;
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment },
    });

    resp.json(newComment);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось создать комментарий!",
    });
  }
};
