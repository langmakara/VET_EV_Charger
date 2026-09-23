const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const packageJson = require("../package.json");

const args = process.argv.slice(2);
let targetVersion = packageJson.version; // default version

if (args.length > 0) {
  targetVersion = args[0];
}

console.log(`ENV = PROD`);
console.log(`Version = ${targetVersion}`);

async function main() {
  const name = packageJson.name;
  const distDir = path.join(__dirname, "../dist");
  const outputDir = path.join(__dirname, "../.output");
  const releaseDir = path.join(__dirname, "../release");
  const outputFilename = `${name}##V${targetVersion}.zip`;
  const outputPath = path.join(releaseDir, outputFilename);

  try {
    // Sync pom.xml with package.json version
    const pomPath = path.join(__dirname, "../pom.xml");
    if (fs.existsSync(pomPath)) {
      let pomContent = fs.readFileSync(pomPath, "utf8");
      const packagingMatch = pomContent.match(/<packaging>/);
      const anchorIndex = packagingMatch ? packagingMatch.index : pomContent.indexOf("<properties>");
      const searchLimit = anchorIndex > 0 ? anchorIndex : 1000;
      const prePackagingContent = pomContent.substring(0, searchLimit);
      const hasProjectVersion = prePackagingContent.includes("<version>");

      if (hasProjectVersion) {
        const newPrePackaging = prePackagingContent.replace(/<version>.*?<\/version>/, `<version>${targetVersion}</version>`);
        pomContent = newPrePackaging + pomContent.substring(searchLimit);
      } else {
        if (packagingMatch) {
          pomContent = pomContent.replace(/<packaging>/, `<version>${targetVersion}</version>\n\t<packaging>`);
        } else {
          pomContent = pomContent.replace(/<\/artifactId>/, `</artifactId>\n\t<version>${targetVersion}</version>`);
        }
      }
      pomContent = pomContent.replace(/<artifactId>.*?<\/artifactId>/, `<artifactId>${name}</artifactId>`);
      fs.writeFileSync(pomPath, pomContent);
    }

    // Sync package.json version if changed
    if (targetVersion !== packageJson.version) {
      const updatedPackageJson = { ...packageJson, version: targetVersion };
      fs.writeFileSync(path.join(__dirname, "../package.json"), JSON.stringify(updatedPackageJson, null, 2) + "\n");
    }

    // Run pnpm run generate with spinner
    const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let spinnerIndex = 0;
    process.stdout.write("⠋");
    const interval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
      process.stdout.write(`\r${spinnerFrames[spinnerIndex]}`);
    }, 80);

    try {
      await new Promise((resolve, reject) => {
        const child = spawn("pnpm", ["run", "generate"], {
          cwd: path.join(__dirname, "../"),
          env: { ...process.env, VITE_NODE_ENV: "pro", NUXT_APP_BASE_URL: `/${name}/` },
          shell: true
        });

        let stdoutBuffer = "";
        child.stdout.on("data", (data) => {
          stdoutBuffer += data.toString();
          let lines = stdoutBuffer.split("\n");
          stdoutBuffer = lines.pop();
          for (const line of lines) {
            const cleaned = line.replace(/\r$/, "");
            if (cleaned) {
              const lowerLine = cleaned.toLowerCase();
              const isError = cleaned.startsWith("[ERROR]") || lowerLine.includes("error") || lowerLine.includes("failed") || lowerLine.includes("exception");
              if (isError) {
                process.stdout.write("\r\x1b[K");
                console.log(cleaned);
              }
            }
          }
        });

        let stderrBuffer = "";
        child.stderr.on("data", (data) => {
          stderrBuffer += data.toString();
          let lines = stderrBuffer.split("\n");
          stderrBuffer = lines.pop();
          for (const line of lines) {
            const cleaned = line.replace(/\r$/, "");
            if (cleaned && !cleaned.includes("No license field")) {
              process.stdout.write("\r\x1b[K");
              process.stderr.write(cleaned + "\n");
            }
          }
        });

        child.on("close", (code) => {
          if (stdoutBuffer) {
            const cleaned = stdoutBuffer.replace(/\r$/, "");
            if (cleaned) {
              const lowerLine = cleaned.toLowerCase();
              const isError = cleaned.startsWith("[ERROR]") || lowerLine.includes("error") || lowerLine.includes("failed") || lowerLine.includes("exception");
              if (isError) {
                process.stdout.write("\r\x1b[K");
                console.log(cleaned);
              }
            }
          }
          if (stderrBuffer) {
            const cleaned = stderrBuffer.replace(/\r$/, "");
            if (cleaned && !cleaned.includes("No license field")) {
              process.stdout.write("\r\x1b[K");
              process.stderr.write(cleaned + "\n");
            }
          }
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`pnpm run generate process exited with code ${code}`));
          }
        });
      });
    } finally {
      clearInterval(interval);
      process.stdout.write("\r\x1b[K");
    }

    // Ensure release dir exists
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir);
    }

    // Create Zip
    if (fs.existsSync(outputPath)) fs.rmSync(outputPath);

    const run = (cmd, cwd) => execSync(cmd, { stdio: "ignore", cwd });

    if (process.platform === "win32") {
      run(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${outputPath}' -Force"`);
    } else {
      run(`zip -q -r "${outputFilename}" .`, distDir);
      run(`mv "${path.join(distDir, outputFilename)}" "${releaseDir}/"`);
    }

    console.log(`Successfully generated ZIP file: ${outputFilename}`);

    // Cleanup
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

main();
