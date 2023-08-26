import * as vscode from "vscode";
import * as cp from "child_process";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "testgpt.runTestGpt",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return vscode.window.showErrorMessage("No active editor found");
      }

      const apiKey = vscode.workspace
        .getConfiguration()
        .get<string>("testgpt.apiKey");

      if (!apiKey) {
        const inputApiKey = await vscode.window.showInputBox({
          prompt: "Enter your OpenAI API Key:",
          ignoreFocusOut: true,
        });

        if (!inputApiKey) {
          return vscode.window.showErrorMessage("OpenAI API Key is required");
        }

        await vscode.workspace
          .getConfiguration()
          .update(
            "testgpt.apiKey",
            inputApiKey,
            vscode.ConfigurationTarget.Global
          );
      }

      const model = vscode.workspace
        .getConfiguration()
        .get<string>("testgpt.model");

      const filePath = editor.document.fileName;
      const command = `npx testgpt -- -i "${filePath}" -k "${apiKey}" -m "${model}" -s`;

      vscode.window.showInformationMessage(
        `Generating unit tests for ${filePath}`
      );

      cp.exec(command, (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
          return;
        }

        if (stderr) {
          vscode.window.showErrorMessage(`Error: ${stderr}`);
          return;
        }

        vscode.window.showInformationMessage(
          `Unit tests for file ${filePath} generated inside the same directory!`
        );
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
