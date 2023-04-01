import fs from "fs";
import path from "path";
import { program } from "commander";
import chalk from "chalk";
import { parseCommand, executeCommand } from "./command";
import { CONFIG_FILE_NAME } from "./const";
import { readYamlFile } from "./utils";
import { IGuide } from "./types";

jest.mock("fs");
jest.mock("path");
jest.mock("commander");
jest.mock("chalk", () => ({
  green: jest.fn(),
  blue: jest.fn(),
  yellow: jest.fn()
}));
jest.mock('./utils');

(global as any).console = {
  log: jest.fn(),
  error: jest.fn(),
};

(global as any).process = {
  exit: jest.fn(),
  cwd: jest.fn()
};

describe("command", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
      guide: [],
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
      (console.log as jest.Mock).mockImplementation(() => { });
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, config: "" });

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
      (console.log as jest.Mock).mockImplementation(() => { });
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
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand(mockArgs);

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).toHaveBeenCalledTimes(1);
    });

    it("should use passed guide when guide not provided in config", () => {
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, guide: ["step1", "step2"] });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
    });

    it("should use passed techs and tips when not provided in config", () => {
      const mockReadYaml = jest.fn();
      const mockExistsSync = jest.fn();
      mockExistsSync.mockReturnValue(false);
      (fs.existsSync as jest.Mock).mockImplementationOnce(mockExistsSync);
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({
        ...mockArgs,
        config: undefined,
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
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (console.log as jest.Mock).mockImplementationOnce(() => { });
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
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (console.log as jest.Mock).mockImplementationOnce(() => { });
      (path.join as jest.Mock).mockReturnValue(CONFIG_FILE_NAME);
      (readYamlFile as jest.Mock).mockReturnValueOnce({});

      executeCommand({ ...mockArgs, apiKey: "5678" });

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(readYamlFile).not.toHaveBeenCalled();
    });
  });
});
