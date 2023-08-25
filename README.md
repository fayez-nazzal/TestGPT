![TestGPT - Logo Cover](https://github.com/fayez-nazzal/TestGPT/assets/49946791/77ec722a-dfb6-4f49-a4b1-d4b659219765)

<h1>
   <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="32px" height="32px" />
   TestGPT
</h1>

Your AI testing companion that writes tests on your behalf, automated to get you to build and ship faster without sacrificing tests.

By default, TestGPT will use OpenAI gpt-3.5-turbo-16k model, but you have the option to use gpt-4, or any other model you want.

> 🤖 A Visual Studio Code Extension is available! Check it in the <strong>[VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=FayezNazzal.testgpt)</strong>

<br />

<div align="center">
   <img src="./show.gif" alt="Show" />
</div>

<br />

## Installation 

1. Install TestGPT by running one of these commands:

   ```zsh
   # Install globally
   npm install -g testgpt@latest

   # OR install locally in your project
   npm install testgpt@latest
   ```

2. **Get your OpenAI API Key** by requesting access to the [OpenAI API](https://openai.com/api/) and obtaining your [API key](https://platform.openai.com/account/api-keys).

   Then export it based on your OS:
   - **macOS or Linux:** Add the following line to .zshrc or .bashrc in your home directory:

      ```zsh
      export OPENAI_API_KEY="Your OpenAI API Key."
      ```
      
      Then run the command:
      
      ```zsh
      source ~/.zshrc
      ```

   - **Windows:** Go to System -> Settings -> Advanced -> Environment Variables, click New under System Variables, and create a new entry with the key `OPENAI_API_KEY` and your OpenAI API Key as the value.

## Usage


### Universal / Plug and Play

Here's a simple form of a test generation command:

```zsh
testgpt -i ./component.tsx -m gpt4
# Creates: ./component.test.tsx
```

With more options, comes more power! You can easily specify target techs, tips, and specify a custom GPT model, along with other options. Here is a breakdown table:

| Option        | Description | Required | Default Value |
| ------------- | ----------- | -------- | ------------- |
| `-i, --inputFile` | Path for the input file. | Yes | 
| `-o, --outputFile` | Path for the output file. | No | \<inputFile\>.test.\<extension\>.
| `-k, --apiKey` | OpenAI API key. | No | Taken as an environment variable.
| `-m, --model` | GPT model to be used for generating tests. | No | gpt-3.5-turbo-16k.
| `-s, --stream` | Stream the response using OpenAI streaming feature. | No |
| `-t, --techs` | The technologies to be used. | No |
| `-p, --instructions` | The instructions to be used. | No |
| `-c, --config` | Path to config file. | No |

Here is an example command that uses more options like those mentioned above:

```zsh
testgpt -i ./Button.tsx -o ./Button.spec.tsx -m gpt-4 --techs "jest, testing-library" --apiKey "Your OpenAI API Key"
```


### Locally / Config-based

For extra flexibility, having `testgpt.config.yaml` at your project's root allows for running shorter commands, quicker, and more friendly for repetitive usage.

An example of a `testgpt.config.yaml` file:
```yaml
.tsx:
   techs:
      - jest
      - react-testing-library
   instructions:
      - Wrap test groups in 'describe' blocks
   examples:
      - fileName: file1.tsx
        code: <code for file1.tsx>
        tests: <tests for file1.tsx>
      - fileName: file2.tsx
        code: <code for file2.tsx>
        tests: <tests for file2.tsx>
```

> More and longer examples enhance the test quality. This will be more possible with high-context length models like gpt-3.5-turbo-16k or gpt-4-32k.

## License

This tool is licensed under the MIT License. Feel free to use it however you like, and contributions are always welcome 😊
