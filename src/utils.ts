import chalk from "chalk";
import fs from "fs";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

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

export interface iGetPromptArgs {
  content: string;
  fileName: string;
  techs?: string[];
  tips?: string[];
}

export const toList = (arr: string[]) =>
  arr.map((tip, index) => `${index + 1}. ${tip}`).join("\r\n");

export const getPrompt = ({
  content,
  fileName,
  techs,
  tips,
}: iGetPromptArgs) => {
  let prompt = `I need unit tests for a file called ${fileName}`;

  if (techs?.length) {
    prompt += ` using the following technologies: 
      ${toList(techs)}
    `;
  }

  if (tips?.length) {
    prompt += `Here are some tips: 
      ${toList(tips)}
    `;
  }

  prompt +=
    "Your answer should be only the code block. Start your response it with ``` and end it with ```";

  prompt += `Here is the file content: 
    \`\`\`
    ${content}
    \`\`\`
  `;

  return prompt;
};

export const readJsonFile = (path: string) => {
  const content = readFile(path);
  return JSON.parse(content);
};

export type IModel = "gpt-3.5-turbo" | "gpt-3.5-turbo-0301" | "gpt-4";

export const initOpenAI = async (apiKey: string) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);

  return openai;
};

export type ICompletionRequest = CreateChatCompletionRequest;

export const getCompletionRequest = (model: IModel, prompt: string) => {
  return {
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
  } as ICompletionRequest;
};

export const getTestContent = async (
  completionRequest: ICompletionRequest,
  openai: OpenAIApi
) => {
  const response = await openai.createChatCompletion(completionRequest);

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

  const openai = await initOpenAI(apiKey);

  // ROW ROW FIGHT THE POWER
  const prompt = getPrompt({
    content,
    fileName: inputFile,
    techs,
    tips,
  });
  const completionRequest = getCompletionRequest(model, prompt);
  const testContent = await getTestContent(completionRequest, openai);
  writeToFile(outputFile, testContent);
};
