import chalk from "chalk";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
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
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  return openai;
};

export const getMessages = (
  systemMessage: string | undefined,
  prompt: string,
  examples: IMessage[]
) => {
  systemMessage ??=
    "You are my unit testing assistant, you will help me write unit tests for the files I provide, your reply will only include the unit tests without any additional information, starting your response with ``` and ending it with ``` directly will help me understand your response better.";

  return [
    {
      role: ERole.System,
      content: systemMessage,
    },
    ...examples,
    {
      role: ERole.User,
      content: prompt,
    },
  ];
};

interface IGetTestContentArgs {
  model: IModel;
  messages: IMessage[];
  openai: OpenAI;
}

export const getTestContent = async ({
  model,
  messages,
  openai,
}: IGetTestContentArgs) => {
  const response = await openai.chat.completions.create({
    model,
    messages,
  });

  // remove lines that start with ``` (markdown code block)
  const regex = /^```.*$/gm;
  return response.choices[0].message?.content?.replace(regex, "");
};

export interface IStreamTestContentArgs {
  model: IModel;
  messages: IMessage[];
  openai: OpenAI;
  onToken: (token: string) => void;
}

export const streamTestContent = async ({
  model,
  messages,
  openai,
  onToken,
}: IStreamTestContentArgs) => {
  const response = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  for await (const part of response) {
    const content = part.choices[0].delta.content;

    if (content) {
      onToken(content);
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

  const messages = getMessages(systemMessage, prompt, exampleMessages);

  const openai = await initOpenAI(apiKey);

  if (stream) {
    const onToken = (token) => {
      writeToFile(outputFile, token, true);
    };

    await streamTestContent({
      openai,
      model,
      messages,
      onToken,
    });
  } else {
    const testContent = await getTestContent({
      openai,
      model,
      messages,
    });

    if (!testContent) {
      console.error(chalk.red("Error generating tests - No tests content"));
      process.exit(1);
    }

    writeToFile(outputFile, testContent);
  }
};
