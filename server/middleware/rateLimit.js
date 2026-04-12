import rateLimit from "express-rate-limit";

function isReadOnlyMethod(method) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

export function createMutationRateLimiter(max) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false,
    },
    skip: (req) => isReadOnlyMethod(req.method),
    message: { error: "Too many write requests. Please try again later." },
  });
}
