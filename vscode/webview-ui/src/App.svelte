<script lang="ts">
  import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";
  import { vscode } from "./utilities/vscode";
  import type { IPreset } from "./types";
  import type { EventHandler } from "svelte/elements";
  import TextArea from "./lib/TextArea.svelte";
  import Dropdown from "./lib/Dropdown.svelte";

  provideVSCodeDesignSystem().register(allComponents);

  let presets = ((window as any).presets as IPreset[]) || [];
  let activePreset = ((window as any).activePreset as IPreset) || {
    name: "Default Preset",
    config: {},
  };

  let systemMessage = activePreset.config.systemMessage;
  let promptTemplate = activePreset.config.promptTemplate;
  let instructions = activePreset.config.instructions;

  let autoTechs = activePreset.config.autoTechs;
  const handleAutoTestClick = () => {
    autoTechs = !autoTechs;
  };

  let techs: string[] = activePreset.config.techs || [];
  let techInput = "";
  const handleTechInputChange: EventHandler<InputEvent, HTMLInputElement> = (event) => {
    techInput = event.currentTarget?.value;
  };

  const handleAddTechClick = () => {
    techs = [...techs, techInput];
    techInput = "";
  };

  let examples = activePreset.config.examples || [];

  const onNewExampleClick = () => {
    examples = [...examples, { fileName: "", code: "", tests: "" }];
  };

  let streaming = activePreset.config.streaming;

  const handleStreamingClick = () => {
    streaming = !streaming;
  };

  const onExampleFileNameChange = (
    event: InputEvent & { currentTarget: HTMLTextAreaElement },
    index: number
  ) => {
    examples[index].fileName = event.currentTarget.value;
  };

  const onExampleCodeChange = (event: InputEvent & { currentTarget: HTMLTextAreaElement }, index: number) => {
    examples[index].code = event.currentTarget.value;
  };

  const onExampleTestsChange = (
    event: InputEvent & { currentTarget: HTMLTextAreaElement },
    index: number
  ) => {
    examples[index].tests = event.currentTarget.value;
    examples = [...examples];
  };

  let model = activePreset.config.model;

  $: {
    activePreset.config.streaming = streaming;
    activePreset.config.promptTemplate = promptTemplate;
    activePreset.config.systemMessage = systemMessage;
    activePreset.config.instructions = instructions;
    activePreset.config.examples = examples;
    activePreset.config.autoTechs = autoTechs;
    activePreset.config.techs = techs;
    activePreset.config.model = model;

    vscode.postMessage({
      type: "preset",
      data: activePreset,
    });
  }

  const onPresetChange = (preset: string) => {
    activePreset = presets.find((p) => p.name === preset)!;
    streaming = activePreset.config.streaming;
    systemMessage = activePreset.config.systemMessage;
    promptTemplate = activePreset.config.promptTemplate;
    instructions = activePreset.config.instructions;
    examples = activePreset.config.examples || [];
    autoTechs = activePreset.config.autoTechs;
    techs = activePreset.config.techs as string[];
    model = activePreset.config.model;
  };

  const onSubmit = (event: Event) => {
    event.preventDefault();
    document.documentElement.style.cursor = "wait";
    vscode.postMessage({
      type: "test",
      data: {
        streaming,
        systemMessage,
        promptTemplate,
        instructions,
        examples,
        autoTechs,
        techs,
        model,
      },
    });
  };
</script>

<main class="flex-col">
  <Dropdown options={presets.map((p) => p.name)} setValue={onPresetChange} />

  <form on:submit={onSubmit}>
    <div class="flex-col">
      <span class="label">Generate tests for the active file</span>
      <vscode-button appearance="primary" on:click={onSubmit}> Generate Tests </vscode-button>
    </div>

    <Dropdown options={["gpt-3.5-turbo-16k", "gpt-3.5-turbo", "gpt-4"]} setValue={(val) => (model = val)} />

    <vscode-checkbox on:click={handleStreamingClick} checked={streaming}>Enable Streaming</vscode-checkbox>
    <TextArea
      name="systemMessage"
      value={systemMessage}
      setValue={(value) => (systemMessage = value)}
      placeholder="Base system message sent to the AI model"
    >
      System Message
    </TextArea>
    <TextArea
      rows={7}
      name="promptTemplate"
      value={promptTemplate}
      setValue={(value) => (promptTemplate = value)}
      placeholder="The prompt sent to the AI model"
    >
      Prompt Template
    </TextArea>
    <TextArea
      rows={7}
      name="instructions"
      value={instructions}
      setValue={(value) => (instructions = value)}
      placeholder="General instrutions for writing tests"
    >
      Instructions
    </TextArea>
    <div class="flex-col">
      <span class="label">Techs</span>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vscode-checkbox
        role="checkbox"
        tabindex="0"
        aria-checked={streaming}
        on:click={handleAutoTestClick}
        checked={autoTechs}>Auto Detect</vscode-checkbox
      >
      <div class="flex {autoTechs && 'disabled-group'}">
        {#each techs as tech}
          <vscode-tag>
            <div class="flex items-center">
              {tech}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div
                role="button"
                tabindex="0"
                class="remove-button flex items-center"
                on:click={() => (techs = techs.filter((t) => t !== tech))}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
                >
              </div>
            </div>
          </vscode-tag>
        {/each}
      </div>
      <div class="flex items-end {autoTechs && 'disabled-group'}">
        <vscode-text-field disabled={autoTechs} on:input={handleTechInputChange} value={techInput} />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <vscode-button role="button" tabindex="0" disabled={autoTechs} on:click={handleAddTechClick}
          >Add</vscode-button
        >
      </div>
    </div>
    <div class="flex-col">
      <span class="label">Examples</span>
      {#each examples as example, i}
        {#if i > 0}
          <vscode-divider role="separator" />
        {/if}
        <vscode-text-field
          name="fileName-{i}"
          placeholder="File name containing the example code"
          value={example.fileName}
          on:input={(e) => onExampleFileNameChange(e, i)}>File Name</vscode-text-field
        >
        <vscode-text-area
          rows={10}
          name="code-{i}"
          placeholder="Example code snippet"
          value={example.code}
          on:input={(e) => onExampleCodeChange(e, i)}>Code</vscode-text-area
        >
        <vscode-text-area
          rows={10}
          name="tests-{i}"
          placeholder="Example tests output"
          value={example.tests}
          on:input={(e) => onExampleTestsChange(e, i)}>Tests</vscode-text-area
        >
      {/each}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vscode-button tabindex="0" role="button" on:click={onNewExampleClick}>Add New Example</vscode-button>
    </div>
  </form>
</main>

<style>
  form,
  .flex-col {
    display: flex;
    flex-direction: column;
  }

  .flex {
    display: flex;
  }

  .flex,
  .flex-col {
    gap: 6px;
  }

  .items-end {
    align-items: flex-end;
  }

  .items-center {
    align-items: center;
  }

  form {
    gap: 8px;
  }

  .label {
    color: var(--foreground);
  }

  .disabled-group {
    filter: grayscale(40%);
    opacity: 0.5;
  }

  .remove-button {
    padding: 5px;
    border-radius: 50%;
    background: transparent;
    padding: 0;
  }

  .remove-button:hover {
    background: #ff3a3a70;
    cursor: pointer;
  }
</style>