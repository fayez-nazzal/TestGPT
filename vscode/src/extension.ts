import { window, ExtensionContext } from "vscode";
import { TestGPTWebviewProvider } from "./TestGPTProvider";

export function activate(context: ExtensionContext) {
	const provider = new TestGPTWebviewProvider(context.extensionUri);

	context.subscriptions.push(
		window.registerWebviewViewProvider(TestGPTWebviewProvider.viewType, provider));
}
