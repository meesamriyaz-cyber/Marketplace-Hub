export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode < 500) {
    return res.status(statusCode).json({ error: message });
  }

  return res.status(statusCode).json({ error: message });
};
