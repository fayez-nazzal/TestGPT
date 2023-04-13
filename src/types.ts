export interface IConfig {
  [key: `.${string}`]: {
    techs: string[];
    tips: string[];
    examples: IExample[];
  };
}

export interface iGetPromptArgs {
  content: string;
  fileName: string;
  techs?: string[];
  tips?: string[];
}

export interface IExample {
  fileName: string;
  code: string;
  tests: string;
}

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
  outputFile: string;
  apiKey: string;
  model: string;
  techs: string;
  tips: string;
  examples: IExample[];
  config: string;
  stream: boolean;
  help: boolean;
}
