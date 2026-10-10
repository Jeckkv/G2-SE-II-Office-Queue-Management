export default function errorHandler(err, _req, res, _next) {
  const response = {
    error: err?.name || "UnknownError",
    message: err?.message || "",
  };

  res.status(err?.statusCode || 500).json(response);
}
