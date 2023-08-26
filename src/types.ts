import { JSONSchemaType } from "ajv";

export interface IConfig {
  [key: `.${string}`]: {
    techs: string[];
    instructions: string[];
    examples: IExample[];
  };
}

export interface IGetPromptArgs {
  content: string;
  fileName: string;
  techs?: string[];
  instructions?: string[];
  promptTemplate?: string;
}

export interface IExample {
  fileName: string;
  code: string;
  tests: string;
}

export const examplesSchema: JSONSchemaType<IExample[]> = {
  type: "array",
  items: {
    type: "object",
    required: ["fileName", "code", "tests"],
    properties: {
      fileName: {
        type: "string",
      },
      code: {
        type: "string",
      },
      tests: {
        type: "string",
      },
    },
  },
};

export enum ERole {
  User = "user",
  System = "system",
  Assistant = "assistant",
}

export interface IMessage {
  role: ERole;
  content: string;
}

export interface ICommandArgs {
  inputFile: string;
  outputFile?: string;
  apiKey: string;
  model: string;
  systemMessage: string;
  promptTemplate: string;
  techs: string;
  instructions: string;
  examples: IExample[];
  config?: string;
  stream: boolean;
  modelEndpoint: string;
  help: boolean;
}
