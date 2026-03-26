/**
 * Express middleware factory – validates a selected request source against a Joi schema.
 */
const validate = (schema, source = "body") => (req, _res, next) => {
  const target = req[source] ?? {};

  const { error, value } = schema.validate(target, {
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

  req[source] = value;
  next();
};

export default validate;
