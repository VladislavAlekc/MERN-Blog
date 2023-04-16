import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

export const register = async (req, resp) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10); // алгорит хиширования

    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      passwordHash: hash,
      fullName: req.body.fullName,
      avatar: req.body.avatar,
    });

    const user = await doc.save(); // док сохранить в БД

    const token = jwt.sign(
      {
        _id: user._id, //_id хранится в MongoDB
      },
      "secret123",
      {
        expiresIn: "30d",
      } // токен перестанет быть валидным
    );

    const { passwordHash, ...userData } = user._doc; // убираем информацию о пароле

    resp.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось зарегистрироваться!",
    });
  }
};
export const login = async (req, resp) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return resp.status(404).json({
        message: "Пользователь не найден!",
      });
    }
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    ); // Сравниваем пароли
    if (!isValidPass) {
      return resp.status(400).json({
        message: "Неверный логин или пароль!",
      });
    }
    const token = jwt.sign(
      {
        _id: user._id, //_id хранится в MongoDB
      },
      "secret123",
      {
        expiresIn: "30d",
      } // токен перестанет быть валидным
    );
    const { passwordHash, ...userData } = user._doc; // убираем информацию о пароле
    resp.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: "Не удалось авторизоваться!",
    });
  }
};
export const getMe = async (req, resp) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return resp.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc; // убираем информацию о пароле
    resp.json(userData);
  } catch (error) {
    resp.status(500).json({
      message: "Нету доступа!",
    });
  }
};
