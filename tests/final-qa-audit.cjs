const fs = require("node:fs");
const path = require("node:path");

function auditRepository(root) {
    const failures = [];
    const publicRoot = path.join(root, "public");
    const sourceFiles = walk(path.join(publicRoot, "js")).filter((file) => /\.(js|mjs)$/.test(file));
    const largest = sourceFiles.map((file) => ({ file, bytes: fs.statSync(file).size })).sort((left, right) => right.bytes - left.bytes)[0];
    if (largest && largest.bytes > 250 * 1024) failures.push(`production module exceeds 250 KiB: ${relative(root, largest.file)}`);

    for (const file of sourceFiles) {
        const content = fs.readFileSync(file, "utf8");
        if (/from\s+["'][^"']*(?:tests|node_modules)[^"']*["']/.test(content)) failures.push(`production import references tests/dependencies: ${relative(root, file)}`);
        if (/FIREBASE_ADMIN|GOOGLE_CLIENT_SECRET|JWT_SECRET/.test(content)) failures.push(`possible server secret name in browser source: ${relative(root, file)}`);
    }

    const firebaseConfig = readJson(path.join(root, "firebase.json"), failures);
    if (firebaseConfig?.hosting?.public !== "public") failures.push("firebase hosting public directory must be public");
    if (firebaseConfig?.functions?.source !== "functions") failures.push("firebase functions source must be functions");
    const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
    if (/GOOGLE_CLIENT_SECRET|JWT_SECRET/.test(envExample)) failures.push(".env.example exposes a forbidden secret variable");

    return { failures, largest };
}

function runAudit(root) {
    const result = auditRepository(root);
    console.log("\n=== Performance and deployment audit ===");
    if (result.largest) console.log(`Largest production module: ${relative(root, result.largest.file)} (${result.largest.bytes} bytes)`);
    if (result.failures.length) {
        result.failures.forEach((failure) => console.error(`- ${failure}`));
        return false;
    }
    console.log("Source-size, production-import, secret-exposure, and Firebase-config checks passed.");
    return true;
}

function readJson(file, failures) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
        failures.push(`invalid JSON: ${path.basename(file)}`);
        return null;
    }
}

function relative(root, file) {
    return path.relative(root, file).replace(/\\/g, "/");
}

function walk(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
    });
}

module.exports = { auditRepository, runAudit };
