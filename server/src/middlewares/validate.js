import { matchedData, validationResult } from "express-validator";

import BadRequestError from "#src/errors/bad-request-error.js";

export default function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  req.cleanData = matchedData(req);

  next();
}
