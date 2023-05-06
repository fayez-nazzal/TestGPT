import {
  readFile,
  writeToFile,
  getPrompt,
  toList,
  getExampleMessages,
  readYamlFile,
  initOpenAI,
  getCompletionRequest,
} from "./utils";
import fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import chalk from "chalk";
import { ERole } from "./types";

jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  red: jest.fn((text) => text),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("openai", () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn(),
}));

(global as any).fetch = jest.fn();

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("utils", () => {
  describe("readFile", () => {
    it("should read content from file", () => {
      (global as any).fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ message: { bulldog: [], poodle: [] } }),
        })
      );

      (fs.readFileSync as jest.Mock).mockImplementation(() => "some content");

      const result = readFile("path/to/file");
      expect(result).toEqual("some content");
    });

    it("should return an empty string if read fails", () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("error");
      });

      const result = readFile("path/to/file");
      expect(result).toEqual("");
    });
  });

  describe("writeToFile", () => {
    it("should write content to file", () => {
      writeToFile("path/to/file", "file content");
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "path/to/file",
        "file content",
        { flag: "w" }
      );
      expect(chalk.green).toHaveBeenCalledWith(
        "Successfully wrote to file: path/to/file"
      );
    });
  });

  describe("getPrompt", () => {
    it("should generate prompt without techs and tips", () => {
      const result = getPrompt({
        content: "file content",
        fileName: "file.ts",
      });

      expect(result).toContain("I need unit tests for a file called file.ts");
      expect(result).not.toContain("using the following technologies");
      expect(result).not.toContain("Here are some tips");
    });

    it("should generate prompt with techs and tips", () => {
      const result = getPrompt({
        content: "file content",
        fileName: "file.ts",
        techs: ["jest"],
        tips: ["use 2 spaces for indentation"],
      });

      expect(result).toContain("file content");
      expect(result).toContain("file.ts");
      expect(result).toContain("jest");
      expect(result).toContain("use 2 spaces for indentation");
    });
  });

  describe("toList", () => {
    it("should convert array to list", () => {
      const result = toList(["tip1", "tip2"]);
      expect(result).toEqual("1. tip1\r\n2. tip2");
    });
  });

  describe("getExampleMessages", () => {
    it("should generate examples from example", () => {
      const example = [
        {
          fileName: "file1.ts",
          code: "file 1 content",
          tests: "file 1 tests",
        },
      ];

      const result = getExampleMessages(
        {
          content: "file content",
          fileName: "file.ts",
          techs: ["jest"],
          tips: ["use 2 spaces for indentation"],
        },
        example
      );

      expect(result).toHaveLength(2);
      expect(result[0].role).toEqual("user");
      expect(result[0].content).toContain("file content");
      expect(result[1].role).toEqual("assistant");
      expect(result[1].content).toContain("file 1 tests");
    });

    it("should not generate examples when there is no example", () => {
      const result = getExampleMessages({
        content: "file content",
        fileName: "file.ts",
        techs: ["jest"],
        tips: ["use 2 spaces for indentation"],
      });

      expect(result).toEqual([]);
    });
  });

  describe("readYamlFile", () => {
    it("should read yaml file and parse to object", () => {
      (fs.readFileSync as jest.Mock).mockReturnValue("name: John");

      const result = readYamlFile("path/to/file");
      expect(result).toEqual({ name: "John" });
    });
  });

  describe("initOpenAI", () => {
    it("should initialize openai with given api key", async () => {
      const configuration = { apiKey: "api_key" };

      (Configuration as jest.Mock).mockImplementationOnce(() => {
        return configuration;
      });

      await initOpenAI("api_key");
      expect(OpenAIApi).toHaveBeenCalledWith(configuration);
    });
  });

  describe("getCompletionRequest", () => {
    it("should generate completion request", () => {
      const prompt = "prompt text";
      const examples = [
        {
          role: ERole.User,
          content: "test prompt",
        },
      ];

      const result = getCompletionRequest("gpt-4", prompt, examples);

      expect(result).toEqual({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that provides unit tests for a given file.",
          },
          ...examples,
          {
            role: "user",
            content: prompt,
          },
        ],
      });
    });
  });
});
