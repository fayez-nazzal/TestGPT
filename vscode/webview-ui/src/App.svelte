<script lang="ts">
  import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
  import { vscode } from "./utilities/vscode";
  import Advanced from "./Advanced.svelte";
  import Dropdown from "./lib/Dropdown.svelte";
  import Logo from "./lib/Logo.svelte";
  import { getWebviewState, setWebviewState } from "./lib/utils";

  provideVSCodeDesignSystem().register(allComponents);

  let { presets, activePreset, advanced } = getWebviewState();

  const onPresetChange = (preset: string) => {
    activePreset = presets.find((p) => p.name === preset)!;
    setWebviewState("activePreset", activePreset);
  };

  const onSubmit = (event: Event) => {
    event.preventDefault();
    vscode.postMessage({
      type: "test",
      data: {
        ...activePreset.config,
      },
    });
  };

  const onAdvancedToggle = () => {
    advanced = !advanced;
    setWebviewState("advanced", advanced);
  };
</script>

<main class="flex-col">
  {#if !advanced}
    <div class="flex-col">
      <span class="label">Choose a preset</span>
      <Dropdown options={presets.map((p) => p.name)} setValue={onPresetChange} />
    </div>

    <div class="flex-col">
      <span class="label">Generate tests for the active file</span>
      <vscode-button appearance="primary" on:click={onSubmit}> Generate Tests </vscode-button>
    </div>
  {:else}
    <Advanced />
  {/if}

  <vscode-divider />

  <vscode-button appearence="secondary" on:click={onAdvancedToggle}>
    {#if !advanced}
      Advanced Mode
    {:else}
      Simple Mode
    {/if}
  </vscode-button>

  <vscode-divider />

  <div class="flex-col items-center" style="margin-bottom: 16px;">
    <Logo />
    <span style="color: #ffd650;">Enjoy the automation!</span>
  </div>
</main>

<style>
  :global(form),
  :global(.flex-col) {
    display: flex;
    flex-direction: column;
  }

  :global(.flex) {
    display: flex;
  }

  :global(.flex),
  :global(.flex-col) {
    gap: 6px;
  }

  :global(.items-end) {
    align-items: flex-end;
  }

  :global(.items-center) {
    align-items: center;
  }
</style>
