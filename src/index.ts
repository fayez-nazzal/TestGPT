#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import { CONFIG_FILE_NAME } from "./const.js";
import { readJsonFile, autoTest } from "./utils.js";
import path from "path";

program
  .option("-i, --inputFile <char>")
  .option("-o, --outputFile <char>")
  .option("-t, --techs <char>")
  .option("-p, --tips <char>")
  .option("-c, --config <char>");
program.parse();

interface IConfig {
  [key: `.${string}`]: {
    techs: string[];
    tips: string[];
  };
}

const options = program.opts();

const inputFile = options.inputFile;

if (!inputFile) {
  console.error(chalk.red("Please provide an input file"));
  process.exit(1);
}

let inputFileExtension = path.extname(inputFile);

console.log(chalk.blue(`Reading ${CONFIG_FILE_NAME}...`));

let config: IConfig;

console.log(chalk.blue(`inputFile extension: ${inputFileExtension}`));

try {
  config = readJsonFile(
    options.config || path.join(process.cwd(), `${CONFIG_FILE_NAME}`)
  );
} catch (err) {
  if (options.techs) {
    console.log(chalk.blue(`Config not found, using passed configs`));

    config = {
      [inputFileExtension]: {
        techs: options.techs?.split(",") || [],
        tips: options.tips?.split(",") || [],
      },
    };
  } else {
    console.log(chalk.blue(`Config not found, continuing without config`));
  }
}

let outputFile = options.outputFile;

if (!outputFile) {
  const inputFileWithoutExtension = inputFile.replace(inputFileExtension, "");

  outputFile = `${inputFileWithoutExtension}.test${inputFileExtension}`;

  console.log(chalk.blue("No output file provided, using default."));

  console.log(chalk.yellow(`Output file: ${outputFile}`));
}

const techs = config?.[inputFileExtension]?.techs;
const tips = config?.[inputFileExtension]?.tips || [];

autoTest({
  techs,
  tips,
  inputFile,
  outputFile,
});
