import fs from "fs";
import path from "path";

import { program } from "commander";
import chalk from "chalk";

import { CONFIG_FILE_NAME, DEFAULT_MODEL } from "./const";
import { ICommandArgs, IConfig } from "./types";
import { autoTest, IModel, readYamlFile } from "./utils";

export const parseCommand = () => {
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

  return options as ICommandArgs;
};

export const executeCommand = ({
  inputFile,
  outputFile,
  apiKey,
  model,
  techs,
  tips,
  guide,
  config,
  help,
}: ICommandArgs) => {
  if (help) {
    console.log(
      chalk.blue(
        `Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <tips> -c <config>`
      )
    );

    console.log(
      chalk.green(
        "\r\nAll fields are optional except inputFile. If no inputFile is provided, the default will be used."
      )
    );

    // exit the program
    process.exit(0);
  }

  let inputFileExtension = path.extname(inputFile);

  if (!inputFile) {
    console.error(chalk.red("Please provide an input file"));
    process.exit(1);
  }

  console.log(chalk.blue(`Reading ${CONFIG_FILE_NAME}...`));

  const configFilePath = path.join(process.cwd(), `${CONFIG_FILE_NAME}`);

  let testGPTConfig: IConfig = {};

  if (fs.existsSync(configFilePath)) {
    console.log(chalk.green("Config file found, using.."));

    testGPTConfig = readYamlFile(
      config || path.join(process.cwd(), `${CONFIG_FILE_NAME}`)
    );
  } else {
    if (techs) {
      console.log(chalk.blue(`Config file not found, using passed config`));

      testGPTConfig = {
        [inputFileExtension]: {
          techs: techs?.split(",") || [],
          tips: tips?.split(",") || [],
          guide: [],
        },
      };
    } else {
      console.log(chalk.blue(`Config file not found, continuing with default config`));
    }
  }

  if (!outputFile) {
    const inputFileWithoutExtension = inputFile.replace(inputFileExtension, "");

    outputFile = `${inputFileWithoutExtension}.test${inputFileExtension}`;

    console.log(chalk.blue("No output file provided, using default."));

    console.log(chalk.yellow(`Output file: ${outputFile}`));
  }

  const parsedTechs = testGPTConfig?.[inputFileExtension]?.techs;
  const parsedTips = testGPTConfig?.[inputFileExtension]?.tips;
  guide ??= testGPTConfig?.[inputFileExtension]?.guide;
  apiKey ??= process.env.OPENAI_API_KEY;
  model ??= DEFAULT_MODEL;

  autoTest({
    inputFile,
    outputFile,
    apiKey,
    model: model as IModel,
    guide,
    techs: parsedTechs,
    tips: parsedTips,
  });
}

