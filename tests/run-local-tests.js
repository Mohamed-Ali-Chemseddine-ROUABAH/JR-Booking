const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const { spawnSync } = require("node:child_process");
const { runAudit } = require("./final-qa-audit.cjs");

const root = path.resolve(__dirname, "..");
const emulatorHosts = [
    "FIREBASE_AUTH_EMULATOR_HOST",
    "FIRESTORE_EMULATOR_HOST",
    "FUNCTIONS_EMULATOR_HOST",
    "FIREBASE_STORAGE_EMULATOR_HOST"
];
const testFiles = walk(__dirname).filter((file) => /\.test\.(cjs|mjs|js)$/.test(file));
const emulatorTests = testFiles.filter((file) => file.includes("-emulator.test."));
const unitTests = testFiles.filter((file) => !file.includes("-emulator.test."));
const syntaxFiles = [
    ...walk(path.join(root, "functions")).filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`) && /\.(cjs|mjs|js)$/.test(file)),
    ...walk(path.join(root, "public", "js")).filter((file) => /\.(mjs|js)$/.test(file))
];

main().catch((error) => {
    console.error(`Local QA runner failed: ${error.message}`);
    process.exit(1);
});

async function main() {
    const forceEmulatorSuite = process.argv.includes("--with-emulators");
    if (forceEmulatorSuite) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
        process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
        process.env.FUNCTIONS_EMULATOR_HOST ||= "127.0.0.1:5001";
        process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
        process.env.FIREBASE_PROJECT_ID ||= "jr-booking-premium";
    }
    const hasLocalEmulators = forceEmulatorSuite || await areEmulatorsReachable();
    console.log(`Local emulator suite: ${hasLocalEmulators ? "detected" : "not detected"}`);
    console.log(`Unit tests: ${unitTests.length}; emulator tests: ${emulatorTests.length}; syntax files: ${syntaxFiles.length}`);

    const syntaxResult = checkSyntaxFiles();
    const docsResult = checkArchitectureDocs();
    const auditResult = runAudit(root);
    const selectedTests = hasLocalEmulators ? testFiles : unitTests;
    const testResult = run("Serial tests", process.execPath, ["--test", "--test-concurrency=1", ...selectedTests]);

    if (!syntaxResult || !testResult || !auditResult) {
        console.error("Local QA failed.");
        if (!hasLocalEmulators && emulatorTests.length) console.error("Start Auth, Firestore, Functions, and Storage emulators to include emulator tests.");
        process.exitCode = 1;
        return;
    }

    if (!docsResult) console.warn("Architecture documentation has gaps; see the list above.");
    console.log(`Local QA passed: ${selectedTests.length} test files, ${syntaxFiles.length} syntax files.`);
    if (!hasLocalEmulators && emulatorTests.length) console.log(`Emulator tests skipped: ${emulatorTests.length}; unit-only mode is safe without emulator hosts.`);
}

function run(label, command, args) {
    console.log(`\n=== ${label} ===`);
    const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: process.env, shell: false });
    return result.status === 0;
}

function checkSyntaxFiles() {
    console.log("\n=== Syntax checks ===");
    for (const file of syntaxFiles) {
        const result = spawnSync(process.execPath, ["--check", file], { cwd: root, stdio: "inherit", env: process.env, shell: false });
        if (result.status !== 0) return false;
    }
    return true;
}

function checkArchitectureDocs() {
    console.log("\n=== Architecture coverage ===");
    const missing = [];
    for (const file of walk(path.join(root, "public", "js"))) {
        if (!/\.(mjs|js)$/.test(file)) continue;
        const relative = path.relative(path.join(root, "public", "js"), file).replace(/\\/g, "/");
        const moduleName = relative.replace(/\.(mjs|js)$/, "");
        const candidates = [
            path.join(root, "docs", "architecture", `${moduleName}.md`),
            path.join(root, "docs", "architecture", `${path.basename(moduleName)}.md`),
            path.join(root, "docs", "architecture", "js", `${moduleName}.md`)
        ];
        if (!candidates.some((candidate) => fs.existsSync(candidate))) missing.push(relative);
    }
    if (missing.length) {
        console.error(`Missing architecture docs (${missing.length}):`);
        missing.forEach((file) => console.error(`- ${file}`));
        return false;
    }
    console.log("All public JavaScript modules have architecture documentation.");
    return true;
}

function walk(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
    });
}

function isLocalHost(value) {
    return typeof value === "string" && /^(localhost|127\.0\.0\.1):\d+$/.test(value);
}

async function areEmulatorsReachable() {
    const ports = emulatorHosts.map((name) => parseHost(process.env[name])).filter(Boolean);
    if (ports.length !== emulatorHosts.length) return false;
    const results = await Promise.all(ports.map(({ host, port }) => canConnect(host, port)));
    return results.every(Boolean);
}

function parseHost(value) {
    if (!isLocalHost(value)) return null;
    const [host, port] = value.split(":");
    return { host, port: Number(port) };
}

function canConnect(host, port) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host, port });
        const finish = (result) => { socket.destroy(); resolve(result); };
        socket.once("connect", () => finish(true));
        socket.once("error", () => finish(false));
        socket.setTimeout(500, () => finish(false));
    });
}
