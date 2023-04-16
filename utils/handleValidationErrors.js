import { validationResult } from "express-validator";

export default (req, resp, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return resp.status(400).json(error.array());
  }
  next(); // если err нет то иди далее
};
