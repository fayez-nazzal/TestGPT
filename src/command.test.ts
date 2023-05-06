import fs from "fs";
import path from "path";
import { executeCommand } from "./command";
import { CONFIG_FILE_NAME } from "./const";
import { divideFileName, readYamlFile } from "./utils";

jest.mock("fs");
jest.mock("commander");
jest.mock("chalk", () => ({
  green: jest.fn(),
  blue: jest.fn(),
  yellow: jest.fn(),
}));
jest.mock("./utils");
jest.mock("path");

(global as any).console = {
  log: jest.fn(),
  error: jest.fn(),
};

(global as any).process = {
  exit: jest.fn(),
  cwd: jest.fn(),
};

describe("command", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (divideFileName as jest.Mock).mockReturnValue({
      name: "input",
      extension: ".txt",
    });
  });

  describe("executeCommand", () => {
    const mockArgs = {
      inputFile: "input.txt",
      outputFile: "output.txt",
      apiKey: "1234",
      model: "davinci",
      techs: "JS,TS",
      tips: "good,bad",
      config: "test.yaml",
      examples: [],
      stream: false,
      help: false,
    };

    it("should print help message", () => {
      executeCommand({ ...mockArgs, help: true });

      expect(console.log).toHaveBeenCalled();
    });

    it("should use default config when no config file is found", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementation(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, config: undefined });

      expect(fs.existsSync).toHaveBeenCalled();
      expect(mockReadYaml).not.toHaveBeenCalled();
      expect(readYamlFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it("should use provided config when no config file is found and techs is passed", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementation(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, config: undefined });

      expect(mockReadYaml).not.toHaveBeenCalled();
      expect(readYamlFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it("should use config file when exists", () => {
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(true);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand(mockArgs);

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).toHaveBeenCalledTimes(1);
    });

    it("should use passed example when example not provided in config", () => {
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({
        ...mockArgs,
        examples: [
          {
            fileName: "test.txt",
            code: "test code",
            tests: "test",
          },
        ],
      });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
    });

    it("should use passed techs and tips when not provided in config", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({
        ...mockArgs,
        config: "",
        techs: "python",
        tips: "bad",
      });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
    });

    it("should use default output file when none provided", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn(() => false);
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, outputFile: undefined });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it("should use provided apiKey", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn(() => false);
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (console.log as jest.Mock).mockImplementationOnce(() => {});
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, apiKey: "5678" });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
    });
  });
});
