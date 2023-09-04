/* eslint-disable curly */
import {
  Disposable,
  Webview,
  window,
  Uri,
  WebviewViewProvider,
  CancellationToken,
  WebviewView,
  WebviewViewResolveContext,
} from "vscode";
import { getUri, getNonce } from "./utils";
import { parse, stringify } from "yaml";
import * as fs from "fs";
import * as cp from "child_process";

export class TestGPTWebviewProvider implements WebviewViewProvider {
  public static currentPanel: TestGPTWebviewProvider | undefined;
  public static readonly viewType = "testgpt";

  private _view?: WebviewView;
  private _disposables: Disposable[] = [];
  private _extensionUri: Uri;

  /**
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  constructor(extensionUri: Uri) {
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(this._extensionUri, "out"),
        Uri.joinPath(this._extensionUri, "webview-ui/public/build"),
      ],
    };

    webviewView.webview.html = this._getWebviewContent(webviewView.webview);

    this._setWebviewMessageListener(webviewView.webview);
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    TestGPTWebviewProvider.currentPanel = undefined;

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "public", "build", "bundle.css"]);

    // The JS file from the React build output
    const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "public", "build", "bundle.js"]);

    // Read yaml file from resources folder
    const presetsUri = getUri(webview, this._extensionUri, ["resources", "presets.yaml"]);
    const presets = parse(fs.readFileSync(presetsUri.fsPath, "utf8"));

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>TestGPT</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
            webview.cspSource
          }; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <script nonce="${nonce}">
            window.presets = ${JSON.stringify(presets)};
            window.activePreset = ${JSON.stringify(presets[0])};
          </script>
          <script defer nonce="${nonce}" src="${scriptUri}"></script>
        </head>
        <body>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        console.log("message", message);
        if (message.type === "preset") {
          const presetsUri = getUri(webview, this._extensionUri, ["resources", "presets.yaml"]);
          const presets = parse(fs.readFileSync(presetsUri.fsPath, "utf8"));
          const presetIndex = presets.findIndex((p: any) => p.name === message.data.name);
          presets[presetIndex] = message.data;
          const strPresets = stringify(presets);

          fs.writeFileSync(presetsUri.fsPath, strPresets);
        } else if (message.type === "test") {
          // get active file path
          const activeFilePath = window.visibleTextEditors[0]?.document.fileName;
          if (!activeFilePath) {
            window.showErrorMessage("No active file");
            return;
          }

          // use input file name only
          const inputFile = activeFilePath.split("/").pop();

          const defaultOutputFile = activeFilePath.replace(/\.[^/.]+$/, (ext) => `.spec${ext}`);
          const outputFilePath = message.data.outputFile || defaultOutputFile;
          const outputFile = outputFilePath.split("/").pop();

          const stringifyData = (data: any) => {
            return JSON.stringify(data).replace(/"/g, '\\"').replace(/`/g, "\\`");
          };

          const model = message.data.model;
          const streaming = message.data.streaming;
          const systemMessage = stringifyData(message.data.systemMessage);
          const promptTemplate = stringifyData(message.data.promptTemplate);
          const instructions = stringifyData(message.data.instructions);
          const techs = message.data.autoTechs ? "" : stringifyData(message.techs.join(", "));
          const examples = stringifyData(message.data.examples);
          const key = process.env.OPENAI_API_KEY;

          if (!model || !outputFile || !systemMessage || !promptTemplate || !examples || !key) {
            console.error("Missing required fields");
            window.showErrorMessage("Missing required fields");
            return;
          }

          let command = `npx --yes testgpt@latest`;

          if (inputFile) command += ` -i "${inputFile}"`;

          if (outputFile) command += ` -o "${outputFile}"`;

          if (model) command += ` -m "${model}"`;

          if (key) command += ` -k "${key}"`;

          if (systemMessage) command += ` -y "${systemMessage}"`;

          if (promptTemplate) command += ` -p "${promptTemplate}"`;

          if (techs) command += ` -t "${techs}"`;

          if (examples) command += ` -x "${examples}"`;

          if (streaming) command += ` -s`;

          if (instructions) command += ` -n "${instructions}"`;

          // create output file if it doesn't exist
          if (!fs.existsSync(outputFilePath)) {
            fs.writeFileSync(outputFilePath, "");
          }

          const terminal = window.createTerminal("TestGPT Terminal");
          terminal.sendText(command);
          terminal.show();

          if (streaming) {
            window.showTextDocument(Uri.file(outputFilePath));
          }
        }
      },
      undefined,
      this._disposables
    );
  }
}
