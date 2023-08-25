import chalk from "chalk";
import fs from "fs";
import path from "path";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import { parse } from "yaml";
import { ERole, IExample, IMessage, IGetPromptArgs } from "./types";

export const readFile = (path: string) => {
  try {
    const fileContent: string = fs.readFileSync(path, "utf-8");
    return fileContent;
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    return "";
  }
};

export const writeToFile = (
  path: string,
  content: string,
  append?: boolean
) => {
  try {
    fs.writeFileSync(path, content, {
      flag: append ? "a" : "w",
    });
    console.log(chalk.green(`Successfully wrote to file: ${path}`));
  } catch (err) {
    console.error(`Error writing to file: ${err}`);
  }
};

export const divideFileName = (fileName: string) => {
  const extension = path.extname(fileName);
  const name = path.basename(fileName, extension);

  return { name, extension };
};

export enum EFileType {
  File,
  Directory,
}

export const getFileType = (path: string) => {
  try {
    const isDirectory = fs.lstatSync(path).isDirectory();

    return isDirectory ? EFileType.Directory : EFileType.File;
  } catch (err) {
    console.error(`Error getting file type: ${err}`);
    return EFileType.File;
  }
};

export const toList = (arr: string[]) =>
  arr.map((tip, index) => `${index + 1}. ${tip}`).join("\r\n");

export const parseTemplatePrompt = (template: string, args: any) => {
  const regex = /{(\w+)}/g;

  return template.replace(regex, (_, key) => {
    return args[key];
  });
};

export const getPrompt = ({
  content,
  fileName,
  techs,
  instructions,
  promptTemplate,
}: IGetPromptArgs) => {
  let prompt =
    promptTemplate ??
    `Please provide unit tests for the file {fileName} using {techs}
{instructions}

Please begin your response with \`\`\` and end it with \`\`\` directly.

Here is the file content:
\`\`\`{content}\`\`\``;

  const techsCotent = techs?.length ? toList(techs) : "same techs as the file";
  const instructionsContent = instructions?.join("\r\n") || "";

  const resultPrompt = parseTemplatePrompt(prompt, {
    content,
    fileName,
    techs: techsCotent,
    instructions: instructionsContent,
  });

  return resultPrompt;
};

export const getExampleMessages = (
  promptArgs: IGetPromptArgs,
  examples?: IExample[]
) => {
  if (!examples) {
    return [];
  }

  const messages = examples
    .map((g) => {
      const prompt = getPrompt({
        ...promptArgs,
        content: g.code,
        fileName: g.fileName,
      });

      return [
        {
          role: ERole.User,
          content: prompt,
        },
        {
          role: ERole.Assistant,
          content: g.tests,
        },
      ];
    })
    .flat();

  return messages as IMessage[];
};

export const readYamlFile = (path: string) => {
  const content = readFile(path);
  return parse(content);
};

export type IModel = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";

export const initOpenAI = async (apiKey: string) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);

  return openai;
};

export type ICompletionRequest = CreateChatCompletionRequest;

export const getCompletionRequest = (
  model: IModel,
  systemMessage: string,
  prompt: string,
  examples: IMessage[]
) => {
  systemMessage ??=
    "You are my unit testing assistant, you will help me write unit tests for the files I provide, your reply will only include the unit tests without any additional information, starting your response with ``` and ending it with ``` directly will help me understand your response better.";

  return {
    model,
    messages: [
      {
        role: ERole.System,
        content: systemMessage,
      },
      ...examples,
      {
        role: ERole.User,
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

export const streamTestContent = async (
  completionRequest: ICompletionRequest,
  openai: OpenAIApi,
  onToken: (token: string) => void
) => {
  const response = await openai.createChatCompletion(
    {
      ...completionRequest,
      stream: true,
    },
    {
      responseType: "stream",
    }
  );

  for await (const chunk of (response as any).data) {
    const lines = chunk
      .toString("utf8")
      .split("\n")
      .filter((line) => line.trim().startsWith("data: "));

    for (const line of lines) {
      const message = line.replace(/^data: /, "");

      if (message === "[DONE]") {
        return;
      }

      const json = JSON.parse(message);
      const token = json.choices[0].delta.content;

      if (token) {
        onToken(token);
      }
    }
  }
};

interface IAutoTestArgs {
  inputFile: string;
  outputFile: string;
  apiKey: string;
  model: IModel;
  systemMessage?: string;
  promptTemplate?: string;
  modelEndpoint?: string;
  examples?: IExample[];
  techs?: string[];
  instructions?: string[];
  stream?: boolean;
}

export const autoTest = async ({
  inputFile,
  outputFile,
  apiKey,
  model,
  systemMessage,
  promptTemplate,
  examples,
  techs,
  instructions,
  stream,
  modelEndpoint,
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

  const promptArgs = {
    content,
    fileName: inputFile,
    techs,
    instructions,
    promptTemplate,
  };

  const prompt = getPrompt(promptArgs);
  const exampleMessages = getExampleMessages(promptArgs, examples);

  if (modelEndpoint) {
    console.log("Found model endpoint, using it instead of OpenAI API");
    const response = await fetch(modelEndpoint, {
      method: "POST",
      body: JSON.stringify({
        prompt,
        examples: exampleMessages,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    writeToFile(outputFile, text);
    return;
  }

  const completionRequest = getCompletionRequest(
    model,
    systemMessage,
    prompt,
    exampleMessages
  );

  const openai = await initOpenAI(apiKey);

  if (stream) {
    await streamTestContent(completionRequest, openai, (token) => {
      writeToFile(outputFile, token, true);
    });
  } else {
    const testContent = await getTestContent(completionRequest, openai);
    writeToFile(outputFile, testContent);
  }
};
