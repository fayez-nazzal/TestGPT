import fs from "fs";
import { readFile, writeToFile, getPrompt } from "./utils";

// mock chalk
jest.mock("chalk", () => ({
  // es module export
  __esModule: true,
  default: {
    blue: jest.fn((text) => text),
    red: jest.fn((text) => text),
    green: jest.fn((text) => text),
  },
}));

// Unit Tests
describe("readFile", () => {
  it("should return the content of a file", () => {
    const path = "./test.txt";
    const expectedContent = "This is a test file";

    fs.writeFileSync(path, expectedContent);

    expect(readFile(path)).toBe(expectedContent);

    fs.unlinkSync(path);
  });

  it("should return an empty string if an error occurs", () => {
    const path = "./invalid-file.txt";

    expect(readFile(path)).toBe("");
  });
});

describe("writeToFile", () => {
  it("should write content to a file", () => {
    const path = "./test.txt";
    const content = "This is a test file";

    writeToFile(path, content);

    expect(fs.readFileSync(path, "utf-8")).toBe(content);

    fs.unlinkSync(path);
  });
});

describe("getPrompt", () => {
  it("should return the correct prompt with the given parameters", () => {
    const content = `const greetings = "Hello!"`;
    const techs = ["jest"];
    const tips = ["use 2 spaces for indentation"];

    const prompt = getPrompt(content, techs, tips);

    for (const tech of techs) {
      expect(prompt).toContain(tech);
    }

    for (const tip of tips) {
      expect(prompt).toContain(tip);
    }

    expect(prompt).toContain(content);
  });
});
