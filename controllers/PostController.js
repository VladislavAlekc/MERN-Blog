import Comments from "../models/Comments.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const getLastTags = async (req, resp) => {
  try {
    const posts = await Post.find().limit(4).exec(); // верни последние 5 тегов
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);
    resp.json(tags);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить статьи!",
    });
  }
};

export const getLastComments = async (req, resp) => {
  try {
    const comments = await Comments.find()
      .sort("-createdAt")
      .limit(3)
      .populate("user")
      .exec(); // верни последние 5 тегов

    resp.json(comments);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить статьи!",
    });
  }
};

export const getAll = async (req, resp) => {
  try {
    const posts = await Post.find().sort("-createdAt").populate("user").exec(); // верни все статьи && передаём связь "user"

    resp.json(posts);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить статьи!",
    });
  }
};

export const sortByTags = async (req, resp) => {
  try {
    const postId = req.params.id;

    const posts = await Post.find({ tags: { $in: postId } })
      .populate("user")
      .exec();

    resp.json(posts);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить статьи!",
    });
  }
};

export const getPopularPosts = async (req, resp) => {
  try {
    const popularPosts = await Post.find()
      .sort("-viewsCount")
      .populate("user")
      .exec();
    resp.json(popularPosts);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить популярные статьи!",
    });
  }
};

export const getOne = async (req, resp) => {
  try {
    const postId = req.params.id;
    const findOne = await Post.findOneAndUpdate(
      {
        _id: postId,
      }, // получить статью
      {
        $inc: { viewsCount: 1 }, // увеличить кол-во increment
      },
      {
        returnDocument: "after",
      } // вернуть актуальный документ
    ).populate("user");

    if (!findOne) {
      return resp.status(404).json({
        message: "Статья не найдена!",
      });
    }
    resp.json(findOne);
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Не удалось получить статью!",
    });
  }
};

export const getAllMyPosts = async (req, resp) => {
  try {
    const myId = req.userId;
    const findOne = await User.findById(myId);
    const list = await Promise.all(
      findOne.posts.map((post) => {
        return Post.findById(post._id).populate("user").exec();
      })
    );
    resp.json(list);
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Не удалось получить статью!",
    });
  }
};

export const remove = async (req, resp) => {
  try {
    const postId = req.params.id;
    const deleteOne = await Post.findOneAndDelete({
      _id: postId,
    });

    if (!deleteOne) {
      console.log(err);
      return resp.status(404).json({
        message: "Статья не надена!",
      });
    }
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { posts: postId } },
      { new: true }
    );

    resp.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Не удалось удалить статью!",
    });
  }
};

export const create = async (req, resp) => {
  try {
    const doc = new Post({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags.split(","),
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: post },
    });
    resp.json(post);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось создать статью!",
    });
  }
};

export const update = async (req, resp) => {
  try {
    const postId = req.params.id;
    await Post.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(","),
      }
    );
    resp.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось обновить статью!",
    });
  }
};

export const getComment = async (req, resp) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const list = await Promise.all(
      post.comments.map((comment) => {
        return Comments.findById(comment).populate("user").exec();
      })
    );

    resp.json(list);
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось получить коментарии!",
    });
  }
};
