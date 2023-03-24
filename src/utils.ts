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
    console.log(chalk.green(`Successfully wrote to file: ${path}`));
  } catch (err) {
    console.error(`Error writing to file: ${err}`);
  }
};


export const getPrompt = (
  content: string,
  techs?: string[],
  tips?: string[]
) => {
  let prompt = "Please write unit tests for the following file given";

  if (techs?.length) {
    prompt += " using the following technologies";
    prompt += techs.join(", ");
  }

  if (tips?.length) {
    prompt += " and the following tips";
    prompt += tips.join(", ");
  }

  prompt +=
    'Please only give the code directly, without any additional text, without any additional details, your answer should be only the code block of the unit tests without anything else, don\'t tell anything like "Here are the unit tests", just answer with the code block.';

  prompt += content;

  return prompt;
};

export const readJsonFile = (path: string) => {
  const content = readFile(path);
  return JSON.parse(content);
};

export type IModel = "gpt-3.5-turbo" | "gpt-3.5-turbo-0301" | "gpt-4";

export const getTestContent = async (
  prompt: string,
  apiKey: string,
  model: IModel
) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);

  const response = await openai.createChatCompletion({
    model,
    messages: [
      {
        role: "system",
        content: "You are a unit test generator.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // remove lines that start with ``` (markdown code block)
  const regex = /^```.*$/gm;
  return response.data.choices[0].message.content?.replace(regex, "");
};

interface IAutoTestArgs {
  inputFile: string;
  outputFile: string;
  apiKey: string;
  model: IModel;
  techs?: string[];
  tips?: string[];
}

export const autoTest = async ({
  inputFile,
  outputFile,
  apiKey,
  model,
  techs,
  tips,
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
  const testContent = await getTestContent(prompt, apiKey, model);
  writeToFile(outputFile, testContent);
};
