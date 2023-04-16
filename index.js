import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv"; // для хранения безопасн портов
import {
  loginValidator,
  postCreateValidator,
  registerValidator,
} from "./validations/validations.js";
import checkAuth from "./utils/checkAuth.js";
import { getMe, register, login } from "./controllers/UserController.js";
import cors from "cors";
import {
  create,
  getAll,
  getAllMyPosts,
  getLastTags,
  getOne,
  getPopularPosts,
  remove,
  sortByTags,
  update,
  getComment,
  getLastComments,
} from "./controllers/PostController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import { createComment } from "./controllers/CommentController.js";

// Константы портов
dotenv.config();
const PORT = process.env.PORT || 4444;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.z3tzyxr.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => console.log("DB Ok!"))
  .catch((err) => console.log("Error!", err));
const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads"); // путь по которому сохраняется файл
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname); // название файла
  },
});

const upload = multer({ storage }); // хранилище мультера

app.use(express.json()); // данные возвращаются в формате
app.use(cors());
app.use("/uploads", express.static("uploads")); //  обьясняем express по какому где искать статич файлы
app.post("/upload", checkAuth, upload.single("image"), (req, resp) => {
  resp.json({
    url: `/uploads/${req.file.originalname}`,
  }); // ответ загрузки файла
});

// routes User
app.post("/auth/login", loginValidator, handleValidationErrors, login);
app.post("/auth/register", registerValidator, handleValidationErrors, register);
app.get("/auth/me", checkAuth, getMe);

// router Comments
app.post("/comments/:id", checkAuth, createComment);
app.get("/comments", getLastComments);

// routes Post
app.get("/tags", getLastTags);
app.get("/posts/comments/:id", getComment);
app.get("/posts", getAll);
app.get("/posts/tags/:id", sortByTags);
app.get("/posts/popular", checkAuth, getPopularPosts);
app.get("/posts/user/myposts", checkAuth, getAllMyPosts);
app.get("/posts/tags", getLastTags);
app.get("/posts/:id", getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidator,
  handleValidationErrors,
  create
);

app.delete("/posts/:id", checkAuth, remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidator,
  handleValidationErrors,
  update
);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Success!");
});
