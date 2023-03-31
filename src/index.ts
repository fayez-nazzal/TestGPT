#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import { CONFIG_FILE_NAME, DEFAULT_MODEL } from "./const.js";
import { readYamlFile, autoTest } from "./utils.js";
import path from "path";
import fs from "fs";

program
  .option("-i, --inputFile <char>")
  .option("-o, --outputFile <char>")
  .option("-k, --apiKey <char>")
  .option("-m, --model <char>")
  .option("-t, --techs <char>")
  .option("-p, --tips <char>")
  .option("-c, --config <char>")
  .option("-h, --help");

program.parse();

interface IGuide {
  fileName: string;
  code: string;
  tests: string;
}

interface IConfig {
  [key: `.${string}`]: {
    techs: string[];
    tips: string[];
    guide: IGuide[];
  };
}

const options = program.opts();

if (options.help) {
  console.log(
    chalk.blue(
      `Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <tips> -c <config>`
    )
  );

  console.log(
    chalk.green(
      "\r\nAll fields are optional except for the input file. If no output file is provided, the default will be used."
    )
  );

  // exit the program
  process.exit(0);
}

const inputFile = options.inputFile;

if (!inputFile) {
  console.error(chalk.red("Please provide an input file"));
  process.exit(1);
}

let inputFileExtension = path.extname(inputFile);

console.log(chalk.blue(`Reading ${CONFIG_FILE_NAME}...`));

let config: IConfig;

console.log(chalk.blue(`inputFile extension: ${inputFileExtension}`));

const configFilePath = path.join(process.cwd(), `${CONFIG_FILE_NAME}`);

if (fs.existsSync(configFilePath)) {
  config = readYamlFile(
    options.config || path.join(process.cwd(), `${CONFIG_FILE_NAME}`)
  );
} else {
  if (options.techs) {
    console.log(chalk.blue(`Config not found, using passed configs`));

    config = {
      [inputFileExtension]: {
        techs: options.techs?.split(",") || [],
        tips: options.tips?.split(",") || [],
        guide: [],
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
const guide = config?.[inputFileExtension]?.guide;

const apiKey = process.env.OPENAI_API_KEY || options.apiKey;
const model = options.model || DEFAULT_MODEL;

autoTest({
  inputFile,
  outputFile,
  apiKey,
  model,
  techs,
  tips,
});
