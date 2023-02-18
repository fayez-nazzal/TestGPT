# TestGPT

TestGPT is an open source tool that uses OpenAI API to automatically generate unit tests for your codebase. It helps save time and improve the quality of your code by generating tests that cover a large number of use cases.

![image](https://user-images.githubusercontent.com/49946791/219856357-57a55c11-208b-4df3-ad10-ffc465e9d549.gif)

## Installation

To use TestGPT, follow these steps:

1. Install TestGPT by running one of the following commands:
    ```bash
    # Install locally in your project
    npm install testgpt

    # OR install globally
    npm install -g testgpt
    ```
2. Request access to OpenAI Text Completion and export your API key by running the following command: 
   ```bash
   export OPENAI_API_KEY='Your OpenAI API Key'
   ```
3. Add a `testgpt.config.json` file to the root directory of your project. you can specify the technologies and tips for each file extension. Here's an example:
   ```json
   {
     ".ts": {
       "techs": ["jest"],
       "tips": [
         "use 2 spaces for indentation",
         "wrap each group of tests in a describe block"
       ]
     },
     ".tsx": {
       "techs": ["jest", "react-testing-library", "userEvent"],
       "tips": [
         "use 2 spaces for indentation",
         "use screen",
         "wrap each group of tests in a describe block",
         "when using user event, use an async function and await the user event",
         "prefer to not use getByTestId"
       ]
     }
   }
   ```

4. Auto generate unit tests by running this command
    ```bash
    testgpt --inputFile <path to your input file> --outputFile <path to your test output file>
    ```

    Alternatively, you can use the shorthand:
    ```bash
    testgpt --i <path to your input file> --o <path to your test output file>
    ```

    If you don't provide an `--outputFile`, the generated test file will be saved in the same directory as the input file.
    ```bash
    testgpt --i ./src/myComponent.tsx 
    # Output file will be ./src/myComponent.test.tsx
    ```

## License
TestGPT is released under the MIT License. Feel free to use it and contribute to it!


> Thanks for OpenAI for generating this README, and my unit tests for this project :)