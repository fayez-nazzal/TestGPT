import { CONFIG_FILE_NAME } from "./const";

describe("CONFIG_FILE_NAME", () => {
  it('should be equal to "testgpt.config.json"', () => {
    expect(CONFIG_FILE_NAME).toBe("testgpt.config.json");
  });
});
