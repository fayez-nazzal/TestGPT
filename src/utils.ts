import chalk from "chalk";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

export const readFile = (path: string) => {
  try {
    const fileContent: string = fs.readFileSync(path, "utf-8");
    return fileContent;
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    return "";
  }
};

export const writeToFile = (path: string, content: string) => {
  try {
    fs.writeFileSync(path, content);
    console.log(`Successfully wrote to file: ${path}`);
  } catch (err) {
    console.error(`Error writing to file: ${err}`);
  }
};

export const getPrompt = (content: string, techs: string[], tips: string[]) =>
  `I have the following file, write me unit tests using ${techs.join(
    ", "
  )}, please ${tips.join(", ")}. Here is the file:
 ${content}`;

export const readJsonFile = (path: string) => {
  const content = readFile(path);
  return JSON.parse(content);
};

export const getTestContent = async (prompt: string) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 2048,
  });

  return response.data.choices[0].text;
};

interface IAutoTestArgs {
  techs: string[];
  tips: string[];
  inputFile: string;
  outputFile: string;
}

export const autoTest = async ({
  techs,
  tips,
  inputFile,
  outputFile,
}: IAutoTestArgs) => {
  console.log(chalk.blue("Reading input file..."));

  let content: string;
  try {
    content = readFile(inputFile);
  } catch (err) {
    console.error(chalk.red(`Error reading file: ${err}`));
    process.exit(1);
  }

  console.log(chalk.blue("Generating tests..."));

  const prompt = getPrompt(content, techs, tips);
  const testContent = await getTestContent(prompt);
  writeToFile(outputFile, testContent);
};
