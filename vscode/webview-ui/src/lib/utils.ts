import type { IPreset } from "../types";
import { vscode } from "../utilities/vscode";

export const getWebviewState = () => {
  let presets = ((window as any).presets as IPreset[]) || [];
  let activePreset = ((window as any).activePreset as IPreset) || {
    name: "Default Preset",
    config: {},
  };
  let advanced = ((window as any).advanced as boolean) || false;

  const newState = vscode.getState();

  if (newState?.presets) {
    presets = newState.presets;
  }

  if (newState?.activePreset) {
    activePreset = newState.activePreset;
  }

  if (newState?.advanced) {
    advanced = newState.advanced;
  }

  return {
    presets,
    activePreset,
    advanced,
  };
};

export const setWebviewState = (key: string, value: any) => {
  vscode.setState({
    ...getWebviewState(),
    [key]: value,
  });

  window[key] = value;
};
