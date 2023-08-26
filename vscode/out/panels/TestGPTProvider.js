"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGPTPanel = void 0;
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
class TestGPTPanel {
    /**
     * The TestGPTPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(extensionUri) {
        this._disposables = [];
        this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        this._setWebviewMessageListener(webviewView.webview);
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode_1.Uri.joinPath(this._extensionUri, "out"),
                vscode_1.Uri.joinPath(this._extensionUri, "app/build"),
            ],
        };
        webviewView.webview.html = this._getWebviewContent(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => {
            var _a;
            switch (data.type) {
                case "colorSelected": {
                    (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.insertSnippet(new vscode_1.SnippetString(`#${data.value}`));
                    break;
                }
            }
        });
    }
    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    dispose() {
        TestGPTPanel.currentPanel = undefined;
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
    _getWebviewContent(webview) {
        // The CSS file from the React build output
        const stylesUri = (0, utils_1.getUri)(webview, this._extensionUri, [
            "app",
            "build",
            "assets",
            "index.css",
        ]);
        // The JS file from the React build output
        const scriptUri = (0, utils_1.getUri)(webview, this._extensionUri, [
            "app",
            "build",
            "assets",
            "index.js",
        ]);
        const nonce = (0, utils_1.getNonce)();
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>TestGPT</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
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
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage((message) => { }, undefined, this._disposables);
    }
}
exports.TestGPTPanel = TestGPTPanel;
TestGPTPanel.viewType = "testgpt";
//# sourceMappingURL=TestGPTProvider.js.map