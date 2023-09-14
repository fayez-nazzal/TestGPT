import { window, ExtensionContext } from "vscode";
import { TestGPTWebviewProvider } from "./TestGPTProvider";

export const activate = async (context: ExtensionContext) => {
  const provider = new TestGPTWebviewProvider(context.extensionUri, context);

  context.subscriptions.push(window.registerWebviewViewProvider(TestGPTWebviewProvider.viewType, provider));
};
