import dotenv from "dotenv";
import mongoose from "mongoose";
import { execFileSync } from "child_process";
import { timingSafeEqual } from "crypto";

dotenv.config();

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) {
    return "";
  }
  return process.argv[idx + 1] || "";
}

function secureEquals(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}

function assertDeveloperAuthorization() {
  const expectedKey = process.env.DEV_RESET_DB_KEY || "";
  const providedKey = getArgValue("--key") || process.env.RESET_DB_KEY || "";

  if (!expectedKey) {
    throw new Error("Security audit is disabled. Set DEV_RESET_DB_KEY in local env.");
  }

  if (!providedKey || !secureEquals(providedKey, expectedKey)) {
    throw new Error("Unauthorized security audit request.");
  }
}

function checkMongoUri(uri) {
  if (!uri) {
    return {
      ok: false,
      reason: "MONGODB_URI is missing",
    };
  }

  const hasCredentials = /mongodb(?:\+srv)?:\/\/(?:[^@/]+)@/i.test(uri);
  const hasAuthSource = /[?&]authSource=/i.test(uri);

  if (!hasCredentials) {
    return {
      ok: false,
      reason: "MONGODB_URI does not include credentials",
    };
  }

  if (!hasAuthSource) {
    return {
      ok: false,
      reason: "MONGODB_URI does not include authSource",
    };
  }

  return { ok: true };
}

async function checkAppUserRole() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const authInfo = await mongoose.connection.db.command({ connectionStatus: 1 });
  const roles = authInfo?.authInfo?.authenticatedUserRoles || [];
  const hasReadWrite = roles.some(
    (role) => role.role === "readWrite" && role.db === "eastman-polybags",
  );
  const hasElevated = roles.some(
    (role) => role.role !== "readWrite" || role.db !== "eastman-polybags",
  );

  await mongoose.connection.close();

  if (!hasReadWrite) {
    return {
      ok: false,
      reason: "App user is missing readWrite on eastman-polybags",
      roles,
    };
  }

  if (hasElevated) {
    return {
      ok: false,
      reason: "App user has elevated or unexpected roles",
      roles,
    };
  }

  return {
    ok: true,
    roles,
  };
}

function checkUnauthenticatedCommandBlock() {
  try {
    execFileSync(
      "mongosh",
      [
        "--quiet",
        "--eval",
        "db.adminCommand({ listDatabases: 1, nameOnly: true })",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    return {
      ok: false,
      reason: "Unauthenticated privileged command unexpectedly succeeded",
    };
  } catch (err) {
    const output = `${String(err.stdout || "")}${String(err.stderr || "")}`;
    const authBlocked = /requires authentication|Authentication failed/i.test(output);

    if (!authBlocked) {
      return {
        ok: false,
        reason: "Privileged command failed, but not due to authentication",
      };
    }

    return { ok: true };
  }
}

async function main() {
  try {
    assertDeveloperAuthorization();

    const checks = [];

    const uriCheck = checkMongoUri(process.env.MONGODB_URI || "");
    checks.push({ name: "Authenticated MONGODB_URI", ...uriCheck });
    if (!uriCheck.ok) {
      throw new Error(uriCheck.reason);
    }

    const roleCheck = await checkAppUserRole();
    checks.push({ name: "Least-privilege app role", ...roleCheck });
    if (!roleCheck.ok) {
      throw new Error(roleCheck.reason);
    }

    const unauthCheck = checkUnauthenticatedCommandBlock();
    checks.push({ name: "Unauthenticated admin block", ...unauthCheck });
    if (!unauthCheck.ok) {
      throw new Error(unauthCheck.reason);
    }

    console.log("DB security audit passed");
    for (const c of checks) {
      console.log(`- ${c.name}: OK`);
    }
  } catch (err) {
    console.error("DB security audit failed", err.message || err);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

main();
