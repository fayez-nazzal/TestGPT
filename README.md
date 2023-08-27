![TestGPT - Logo Cover](https://github.com/fayez-nazzal/TestGPT/assets/49946791/77ec722a-dfb6-4f49-a4b1-d4b659219765)

<h1>
   <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="32px" height="32px" />
   TestGPT
</h1>

Your AI testing companion that writes tests on your behalf, automated to get you to build and ship faster without sacrificing tests.

By default, TestGPT will use OpenAI gpt-3.5-turbo-16k model, but you have the option to use gpt-4, or any other model you want.

<div>
    <a href="https://www.loom.com/share/9eab4b1c35194a8190daffb26fcb2cff">
      <p><img style="padding: 0 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="16px" height="16px" />A Sneak Peek for the upcoming VSCode Extension<img style="padding: 0 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="16px" height="16px" /></p>
    </a>
    <a href="https://www.loom.com/share/9eab4b1c35194a8190daffb26fcb2cff">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/9eab4b1c35194a8190daffb26fcb2cff-with-play.gif">
    </a>
</div>

<hr />

<br />

<div align="center">
   <img src="./show.gif" alt="Show" />
</div>

<br />

<h2>    <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="24px" height="24px" />
 Installation
</h2>

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

<h2>    <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="24px" height="24px" />
 Usage
</h2>


### <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="16px" height="16px" /> Universal / Plug and Play

Here's a simple form of a test generation command:

```zsh
testgpt -i ./component.tsx -m gpt4
# Creates: ./component.test.tsx
```

With more options, comes more power! You can easily specify target techs, tips, and specify a custom GPT model, along with other options. Here is a breakdown table:

<div style="display: flex; flex-direction: column; gap: 8px;">
<details>
   <summary>
   <b>--inputFile</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-i</span>
    <span style="margin: 0 6px">|</span> 
   <span style="color: #ff8b8b">[ Required ]</span>
 
   </summary>
   
   <div style="margin-left: 12px">
   Path for the input file to be tested (e.g. `./Button.tsx`).
   </div>
</details>

<details>
   <summary>
   <b>--outputFile</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-o</span>
    <span style="margin: 0 6px">|</span> 
   <span style="color: #bbbb8b">[ Default: {inputFile}.test.{extension} ]</span>
 
   </summary>
   
   <div style="margin-left: 12px">
   Path for the output file where the generated tests will be written (e.g. `./Button.spec.tsx`). If not provided, the output file will be the same as the input file, but with `.test` added before the extension.
   </div>
</details>

<details>
   <summary>
   <b>--apiKey</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-k</span>
    <span style="margin: 0 6px">|</span> 
   <span style="color: #bbbb8b">[ Default: OPENAI_API_KEY Env ]</span>
 
   </summary>
   
   <div style="margin-left: 12px">
   OpenAI API key. If not provided, it will be taken from the `OPENAI_API_KEY` environment variable. If using an API other than OpenAI, currently, this option will be ignored.
   </div>
</details>

<details>
   <summary>
   <b>--model</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-m</span>
    <span style="margin: 0 6px">|</span> 
   <span style="color: #bbbb8b">[ Default: gpt-3.5-turbo-16k ]</span>
 
   </summary>
   
   <div style="margin-left: 12px">
   GPT model to be used for generating tests. If using an API other than OpenAI, currently, this option will be ignored.
   </div>
</details>

<details>
   <summary>
   <b>--stream</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-s</span>
   
 
   </summary>
   
   <div style="margin-left: 12px">
      Stream the response using OpenAI streaming feature. If using an API other than OpenAI, currently, this option will be ignored.
   </div>
</details>

<details>
   <summary>
   <b>--systemMessage</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-y</span>
   </summary>
   
   <div style="margin-left: 12px">
      System message to be used for generating tests.
   </div>
</details>

<details>
   <summary>
   <b>--promptTemplate</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-p</span>
   </summary>
   
   <div style="margin-left: 12px">
      Prompt template to be used for generating tests. You can substitute the following variables in the template:
        <ul>
         <li>fileName: The name of the file being tested.</li>
         <li>content: The content of the file being tested.</li>
         <li>techs: The technologies to be used.</li>
         <li>instructions: General Instructions for generating tests.</li>
        </ul>

To substitute a variable, use the following syntax: `{variableName}`

Here is an example:
```js
Please provide unit tests for the file {fileName} using {techs}
{instructions}

Please begin your response with \`\`\` and end it with \`\`\` directly.

Here is the file content:
\`\`\`{content}\`\`\`
```
   </div>
</details>

<details>
   <summary>
   <b>--techs</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-t</span>
    <span style="margin: 0 6px">|</span> 
    <span style="color: #bbbb8b">[ Default: Auto Detected ]</span>
   </summary>
   
   <div style="margin-left: 12px">
      The technologies to be used.
   </div>
</details>

<details>
   <summary>
   <b>--examples</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-e</span>
    <span style="margin: 0 6px">|</span> 
   </summary>
   
   <div style="margin-left: 12px">
      Example snippets to guide the AI test generation process.
   </div>
</details>

<details>
   <summary>
   <b>--moduleEndpoint</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-e</span>
    <span style="margin: 0 6px">|</span> 
   </summary>
   
   <div style="margin-left: 12px">
      An API endpoint for a custom model to send the request to. Only use this if you have a custom model deployed and you want to use it instead of OpenAI.
   </div>
</details>

<details>
   <summary>
   <b>--instructions</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-n</span>
    
   </summary>
   
   <div style="margin-left: 12px">
      General Instructions for generating tests.
   </div>
</details>

<details>
   <summary>
   <b>--config</b>
    <span style="margin: 0 6px">|</span> 
    <span style="color: currentColor">-c</span>
    
   </summary>
   
   <div style="margin-left: 12px">
      Path to config file.
   </div>
</details>
</div>

<br />

Here is an example command that uses more options like those mentioned above:

```zsh
testgpt -i ./Button.tsx -o ./Button.spec.tsx -m gpt-4 --techs "jest, testing-library" --apiKey "Your OpenAI API Key"
```

### <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="16px" height="16px" /> Locally / Config-based

For extra flexibility, having `testgpt.config.yaml` at your project's root allows for running shorter commands, quicker, and more friendly for repetitive usage.

An example of a `testgpt.config.yaml` file:
```yaml
.tsx:
   techs:
      - jest
      - react-testing-library
   instructions: |-
      Wrap test groups in 'describe' blocks
   examples:
      - fileName: file1.tsx
        code: <code for file1.tsx>
        tests: <tests for file1.tsx>
      - fileName: file2.tsx
        code: <code for file2.tsx>
        tests: <tests for file2.tsx>
```

> More and longer examples enhance the test quality. This will be more possible with high-context length models like gpt-3.5-turbo-16k or gpt-4-32k.

## <img style="padding-right: 4px;" src="https://storage.googleapis.com/fayeznazzal/TestGPT-logo.svg" width="24px" height="24px" /> License

This software is licensed under the MIT License, which permits you to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the software.
- The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.
- In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

Please feel free to use this software in any way you see fit, and contributions are always welcome :)