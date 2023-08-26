"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const TestGPTProvider_1 = require("./TestGPTProvider");
function activate(context) {
    const provider = new TestGPTProvider_1.TestGPTWebviewProvider(context.extensionUri);
    context.subscriptions.push(vscode_1.window.registerWebviewViewProvider(TestGPTProvider_1.TestGPTWebviewProvider.viewType, provider));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map