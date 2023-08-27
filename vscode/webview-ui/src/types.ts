export interface IPreset {
  name: string;
  config: {
    model: string;
    streaming: boolean;
    systemMessage: string;
    promptTemplate: string;
    instructions: string;
    autoTechs?: boolean;
    techs?: string[];
    examples?: {
      fileName: string;
      code: string;
      tests: string;
    }[];
  };
}
