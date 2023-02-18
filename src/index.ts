#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import { CONFIG_FILE_NAME } from "./const.js";
import { readJsonFile, autoTest } from "./utils.js";
import path from "path";

program.option("-i, --inputFile <char>").option("-o, --outputFile <char>");
program.parse();

interface IConfig {
  [key: `.${string}`]: {
    techs: string[];
    tips: string[];
  };
}

const options = program.opts();

console.log(chalk.blue(`Reading ${CONFIG_FILE_NAME}...`));

let config: IConfig;

try {
  config = readJsonFile(path.join(process.cwd(), `${CONFIG_FILE_NAME}`));
} catch (err) {
  console.error(chalk.red(`Please create ${CONFIG_FILE_NAME}`));
  process.exit(1);
}

const inputFile = options.inputFile;

if (!inputFile) {
  console.error(chalk.red("Please provide an input file"));
  process.exit(1);
}

let outputFile = options.outputFile;
let inputFileExtension = path.extname(inputFile);

if (!outputFile) {
  const inputFileWithoutExtension = inputFile.replace(inputFileExtension, "");

  outputFile = `${inputFileWithoutExtension}.test${inputFileExtension}`;

  console.log(chalk.blue("No output file provided, using default."));

  console.log(chalk.yellow(`Output file: ${outputFile}`));
}

const extensionConfig = config[inputFileExtension];

if (!extensionConfig) {
  console.error(
    chalk.red(
      `Please create config for the '${inputFileExtension}' extension to ${CONFIG_FILE_NAME}`
    )
  );
  process.exit(1);
}

const techs = config[inputFileExtension].techs;
const tips = config[inputFileExtension].tips || [];

if (!techs || !techs.length) {
  console.error(
    chalk.red(
      `Please add techs for the '${inputFile}' extension to ${CONFIG_FILE_NAME}`
    )
  );
  process.exit(1);
}

autoTest({
  techs,
  tips,
  inputFile,
  outputFile,
});
