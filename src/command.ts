import fs from "fs";
import path from "path";

import { program } from "commander";
import chalk from "chalk";

import { CONFIG_FILE_NAME, DEFAULT_MODEL } from "./const";
import { ICommandArgs, IConfig, examplesSchema } from "./types";
import {
  autoTest,
  divideFileName,
  EFileType,
  getFileType,
  IModel,
  readYamlFile,
} from "./utils";
import Ajv from "ajv";

export const parseCommand = () => {
  program
    .option("-i, --inputFile <char>")
    .option("-o, --outputFile <char>")
    .option("-k, --apiKey <char>")
    .option("-m, --model <char>")
    .option("-p, --promptTemplate <char>")
    .option("-y, --systemMessage <char>")
    .option("-t, --techs <char>")
    .option("-n, --instructions <char>")
    .option("-x, --examples <char>")
    .option("-c, --config <char>")
    .option("-s, --stream")
    .option("-e, --modelEndpoint <char>")
    .option("-h, --help");

  program.parse();

  const options = program.opts();

  if (options.help) {
    console.log(
      chalk.blue(
        `Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <instructions> -c <config>`
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

export const executeCommand = async (args: ICommandArgs) => {
  const { help, inputFile, outputFile } = args;
  if (help) {
    console.log(
      chalk.blue(
        `Usage: testgpt -i <inputFile> -o <outputFile> -k <apiKey> -m <model> -t <techs> -p <instructions> -c <config>`
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

  const isInputDirectory = getFileType(inputFile) === EFileType.Directory;
  const isOutputDirectory =
    outputFile && getFileType(outputFile) === EFileType.Directory;

  if (isInputDirectory && outputFile && !isOutputDirectory) {
    console.error(
      chalk.red(
        "If inputFile is a directory, outputFile must also be a directory"
      )
    );
    process.exit(1);
  }

  if (isInputDirectory) {
    // if outputDirectory is not provided, use the inputDirectory
    const outputDirectory = outputFile || inputFile;

    const files = fs.readdirSync(inputFile);

    for (const file of files) {
      const inputFilePath = path.join(inputFile, file);
      const { name: inputFileName, extension } = divideFileName(inputFilePath);
      const outputFilePath = path.join(
        outputDirectory,
        `${inputFileName}.test${extension}`
      );

      await executeForFile({
        ...args,
        inputFile: inputFilePath,
        outputFile: outputFilePath,
      });
    }
  } else {
    await executeForFile(args);
  }

  process.exit(0);
};

export const executeForFile = async ({
  inputFile,
  outputFile,
  apiKey,
  model,
  systemMessage,
  promptTemplate,
  techs,
  instructions,
  examples,
  config,
  stream,
  modelEndpoint,
}: Omit<ICommandArgs, "help">) => {
  if (examples && typeof examples === "string") {
    const ajv = new Ajv();
    const validate = ajv.compile(examplesSchema);

    examples = JSON.parse(examples);

    const valid = validate(examples);
    if (!valid) {
      console.error(chalk.red("Invalid examples format"));
      console.error(chalk.red(JSON.stringify(validate.errors, null, 2)));
      process.exit(1);
    }
  }

  let { extension: inputFileExtension } = divideFileName(inputFile);

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
          instructions: instructions?.split(",") || [],
          examples: [],
        },
      };
    } else {
      console.log(
        chalk.blue(`Config file not found, continuing with default config`)
      );
    }
  }

  if (!outputFile) {
    const inputFileWithoutExtension = inputFile.replace(inputFileExtension, "");

    outputFile = `${inputFileWithoutExtension}.test${inputFileExtension}`;

    console.log(chalk.blue("No output file provided, using default."));

    console.log(chalk.yellow(`Output file: ${outputFile}`));
  }

  const parsedTechs = testGPTConfig?.[inputFileExtension]?.techs;
  const parsedInstructions = testGPTConfig?.[inputFileExtension]?.instructions;
  examples ??= testGPTConfig?.[inputFileExtension]?.examples;
  apiKey ??= process.env.OPENAI_API_KEY as string;
  model ??= DEFAULT_MODEL;

  await autoTest({
    inputFile,
    outputFile,
    apiKey,
    model: model as IModel,
    systemMessage,
    promptTemplate,
    examples,
    techs: parsedTechs,
    instructions: parsedInstructions,
    stream,
    modelEndpoint,
  });
};
