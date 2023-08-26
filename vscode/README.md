# TestGPT for Visual Studio Code

Automatically generate unit tests for your files using GPT-3.5-turbo model. (GPT-4 also supported for users who have it).

![TestGPT show](https://user-images.githubusercontent.com/49946791/227503309-06aac81e-3144-4c48-b315-4fd36791034a.gif)

You can find the extension on the [VS Code marketplace](https://marketplace.visualstudio.com/items?itemName=FayezNazzal.testgpt).

## Requirements
- You need TestGPT installed in your system, run `npm install -g testgpt@latest`.
- You need to obtain an OpenAI API Key, you will be asked to provide it once you run the extension.

## Usage

- While your file is opened in the editor, open the command palette.
- Select "Run TestGPT for this file"
- Once generated, you will find a `.test.\<ext\>` file generated in the same directory.

## Using GPT-4
If your OpenAI account supports GPT-4 model, open vscode settings, and set "testgpt.model" property to "gpt-4" to start using it, the default is gpt-3.5-turbo.


## Requesting features / Submitting issues.

Please submit the issues you find or the features you want inside [TestGPT github repo](https://github.com/fayez-nazzal/testgpt-vscode).

**Enjoy testing!**
