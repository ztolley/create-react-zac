#!/usr/bin/env node
const path = require("path");
const degit = require("degit");
const fse = require("fs-extra");
const { spawn } = require("child_process");

const templateRepo = "ztolley/vite-react-ts";

async function updatePackageJson(dir, packageName) {
  const appPackageJsonPath = path.join(dir, "package.json");
  const appPackageJson = await fse.readJson(appPackageJsonPath);
  appPackageJson.name = packageName;
  await fse.writeJson(appPackageJsonPath, appPackageJson, { spaces: 2 });
}

function installDependencies(dir) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["ci"], {
      cwd: dir,
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error("npm install failed"));
        return;
      }
      resolve();
    });
  });
}

async function main(args) {
  const projectDir = args[2];
  const packageName = path.basename(projectDir);

  await degit(templateRepo).clone(projectDir, { cache: false });
  await updatePackageJson(projectDir, packageName);
  await installDependencies(projectDir);
}

if (require.main === module) {
  main(process.argv).catch((error) =>
    process.stderr.write(`\n${error.message}\n`, () => process.exit(1))
  );
}
