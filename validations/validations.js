import { body } from "express-validator";

export const loginValidator = [
  body("email", "Неверный формат почты!").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов!").isLength({
    min: 6,
  }),
]; // Проверяем валидность логин

export const postCreateValidator = [
  body("title", "Введите заголовок статьи!").isLength({ min: 3 }).isString(),
  body("text", "Введите текст!").isLength({ min: 3 }).isString(),
  body("tags", "Неверный формат тэгов !").optional().isString(),

  body("imageUrl", "Неверная ссылка на изображение!").optional().isString(),
]; // Проверяем валидность постов

export const registerValidator = [
  body("email", "Неверный формат почты!").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов!").isLength({
    min: 6,
  }),
  body("fullName", "Укажите имя, минимум 3 символа!").isLength({ min: 3 }),
  body("avatar", "Неверная ссылка на аватар!").optional().isURL(),
]; // Проверяем валидность при регистрации
