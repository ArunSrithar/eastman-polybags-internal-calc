function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTrustProxy(value) {
  if (value == null || value === "") {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric) && Number.isInteger(numeric)) {
    return numeric;
  }

  return value;
}

export function getServerConfig() {
  const origins = parseCsv(process.env.CLIENT_ORIGIN || "http://localhost:8000");

  return {
    port: Number(process.env.PORT) || 3001,
    clientOrigins: origins,
    mutationRateLimitMax: Number(process.env.MUTATION_RATE_LIMIT_MAX) || 120,
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  };
}

export function makeCorsOriginChecker(allowlist) {
  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowlist.includes(origin)) {
      callback(null, true);
      return;
    }

    const err = new Error("CORS origin not allowed");
    err.status = 403;
    callback(err);
  };
}
