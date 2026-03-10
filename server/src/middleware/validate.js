/**
 * Express middleware factory – validates req.body against a Joi schema.
 */
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    const err = new Error("Validation failed");
    err.statusCode = 400;
    err.details = messages;
    return next(err);
  }

  req.body = value;
  next();
};

export default validate;
