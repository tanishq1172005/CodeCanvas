import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";
import { prisma } from "./db";
import dotenv from 'dotenv'

dotenv.config({
    path:'./.env'
})

const client = createClient({
    url:process.env.REDIS_URL
});
client.connect().then(async () => {
  while (1) {
    const response = await client.rPop("problems");
    if (!response) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    const parsedResponse = JSON.parse(response);
    const code = parsedResponse.code;
    const language = parsedResponse.language;
    const submissionId = parsedResponse.submissionId;
    console.log("Processing question for user");
    let finalOutput = "";

    if (language === "cpp") {
      console.log("Running user c++ code");
      const filePath = __dirname + "/code/a.cpp";
      fs.writeFileSync(filePath, code);
      const responseCompiler = spawn("g++", [filePath, "-o", "./code/out"]);
      let exitCodeCompiler = null;
      await new Promise<void>((resolve) => {
        responseCompiler.on("exit", async (exitCode) => {
          exitCodeCompiler = exitCode;
          if (exitCode !== 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Failure",
              },
            });
          }
          resolve();
        });
      });
      if (exitCodeCompiler !== 0) {
        continue;
      }

      const response = spawn("./code/out");
      response.stdout.on("data", (chunk) => {
        finalOutput += chunk.toString();
      });

      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          console.log(exitCode);
          if (exitCode === 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Success",
                output: finalOutput,
              },
            });
          } else {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Failure",
              },
            });
          }
          resolve();
        });
      });
    }

    if (language === "js") {
      const filePath = __dirname + "/code/a.js";
      console.log("Running user js code");
      fs.writeFileSync(filePath, code);
      const response = spawn("node", [filePath]);
      response.stdout.on("data", (chunk) => {
        finalOutput += chunk.toString();
      });
      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          if (exitCode === 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Success",
                output: finalOutput,
              },
            });
          } else {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Failure",
              },
            });
          }
          resolve();
        });
      });
    }

    if (language === "py") {
      const filePath = __dirname + "/code/a.py";
      console.log("running user py code");
      fs.writeFileSync(filePath, code);
      const response = spawn("python3", [filePath]);
      response.stdout.on("data", (chunk) => {
        finalOutput += chunk.toString();
      });
      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          if (exitCode === 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "Success",
                output: finalOutput,
              },
            });
          }
          resolve()
        });
      });
    }
  }
});
