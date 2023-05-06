# TestGPT

A command-line tool for generating unit tests for your files automatically using OpenAI GPT-3.5-turbo model (gpt-4 also supported for developers who have it).

> If you have access to GPT-4 API, you can now pass `--model`/`-m` option, see below for an example. 

> Now there is a VScode extension the process even faster, check the extension [here](https://marketplace.visualstudio.com/items?itemName=FayezNazzal.testgpt) (You have to install the latest version of testgpt for it to work)

> NOTE: From version 3.0.0 and upwards, `testgpt.config.json` was replaced with `testgpt.config.yaml`, and a new custom property (`examples`) is added.

<br />

<div align="center">
   <img src="./show.gif" alt="Show" />
</div>

<br />

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
   

3. If you have `testgpt.config.yaml` you can  **Generate** unit tests by running this command from your project's root directory (where testgpt.config.yaml is located):

   ```zsh
   testgpt -i <path to your input file> -o <path to your test output file>
   ```

   Note that `--inputFile`/`-i` and `--outputFile`/`-o` can be either a file path or directory, and in the later case, a tests will be generated for each file inside the directory.

   If you don't provide an `--outputFile`/`-o`, the generated test file will be saved in the same directory as the input file.

   ```zsh
   testgpt -i ./src/component.tsx
   # Output file will be ./src/component.test.tsx
   ```

## Providing custom techs using a config file

You can create a `testgpt.config.yaml` file in your project's root directory to specify technologies and tips for each file extension. Example:

```yaml
.ts:
  techs:
    - jest
  tips:
    - use 2 spaces for indentation
    - wrap each group of tests in a describe block
    - Don't forget to import the things you need.

.tsx:
  techs:
    - jest
    - react-testing-library
    - userEvent
  tips:
    - use 2 spaces for indentation
    - use screen
    - wrap each group of tests in a describe block
    - when using user event, use an async function and await the user event
    - prefer not to use getByTestId
    - Don't forget to import the things you need.
```

Then you can run the following command from the same directory as the config file:

```zsh
testgpt -i ./src/component.tsx
```

You can also pass the `config` file path using the `--config`/`-c` argument.

```zsh
testgpt -i ./src/component.tsx -c `./testgpt.config.yaml`
```

## Providing examples

The file `testgpt.config.yaml` supports the `examples` property for each file extension:

```yaml
.tsx
   techs:
      - jest
      - react-testing-library
   tips:
      - wrap each group of tests in a describe block
   examples:
      - fileName: file1.tsx
        code: <code content for file1.tsx>
        tests: <tests content for file1.tsx>
      - fileName: file2.tsx
        code: <code content for file2.tsx>
        tests: <tests content for file2.tsx>
```

## Providing custom techs directly

   You can pass `--techs`/`-t` and `--tips`/`-p` directly for each command

   ```zsh
   testgpt -i ./src/component.tsx --techs react,jest --tips "Don't forget to import what you need"`
   ```


## Providing custom model

You can pass `--model`/`-m` option to use a custom model other than the default (currently gpt-3.5-turbo):

```zsh
testgpt -i ./src/component.tsx -m gpt-4
```

## License

TestGPT is released under the MIT License. Feel free to use it and contribute to it!

> Thanks to OpenAI for generating this README and my unit tests for this project :)
