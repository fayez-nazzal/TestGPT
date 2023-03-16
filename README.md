# TestGPT

A command-line tool for generating unit tests for your files automatically using OpenAI API.

![](testgpt.webp)

## Installation 

To use TestGPT, follow these steps:

1. Install TestGPT by running one of these commands:

   ```zsh
   # Install globally
   npm install -g testgpt@latest

   # OR install locally in your project
   npm install testgpt@latest
   ```

2. **Get your OpenAI API** key by requesting access to the [OpenAI API](https://openai.com/api/) and obtaining your [API key](https://platform.openai.com/account/api-keys). Then, export your OpenAI key based on your operating system:
   
   You then need to export your OpenAI key. Follow the steps to export for your OS:
   - **macOS or Linux (zsh):** Add the following line to .zshrc in your home or ~ directory:

      ```zsh
      export OPENAI_API_KEY="Your OpenAI API Key."
      ```
      
      Then run the command:
      
      ```zsh
      source ~/.zshrc
      ```
      
   - **Linux (bash):** Add the following line to ~/.bashrc:
      
      ```bash
      export OPENAI_API_KEY="Your OpenAI API Key."
      ```
      
      Then run the command:
      
      ```bash
      source ~/.bashrc
      ```

   - **Windows:** Go to System -> Settings -> Advanced -> Environment Variables, click New under System Variables, and create a new entry with the key `OPENAI_API_KEY` and your OpenAI API Key as the value.
   

3. **[Optional]** Create a `testgpt.config.json` file in your project's root directory to specify technologies and tips for each file extension. Example:

   ```json
   {
     ".ts": {
       "techs": ["jest"],
       "tips": [
         "use 2 spaces for indentation",
         "wrap each group of tests in a describe block",
         "Don't forget to import the things you need."
       ]
     },
     ".tsx": {
       "techs": ["jest", "react-testing-library", "userEvent"],
       "tips": [
         "use 2 spaces for indentation",
         "use screen",
         "wrap each group of tests in a describe block",
         "when using user event, use an async function and await the user event",
         "prefer not to use getByTestId",
         "Don't forget to import the things you need."
       ]
     }
   }
   ```

4. If you have `testgpt.config.json` you can  **Generate** unit tests by running this command from your project's root directory (where testgpt.config.json is located):

   ```zsh
   testgpt -i <path to your input file> -o <path to your test output file>
   ```

   If you don't provide an `--outputFile`/`-o`, the generated test file will be saved in the same directory as the input file.

   ```zsh
   testgpt -i ./src/component.tsx
   # Output file will be ./src/component.test.tsx
   ```

   You can also pass the `config` file path using the `--config`/`-c` argument.

   ```zsh
   testgpt -i ./src/component.tsx -c `./testgpt.config.json`
   ```

   Or pass `--techs`/`-t` and `--tips`/`-p` directly

      ```zsh
   testgpt -i ./src/component.tsx --techs react,jest --tips "Don't forget to import what you need"`
   ```

## License

TestGPT is released under the MIT License. Feel free to use it and contribute to it!

> Thanks to OpenAI for generating this README and my unit tests for this project :)
