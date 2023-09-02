<script lang="ts">
  import type { EventHandler } from "svelte/elements";

  export let value: string;
  export let name: string;
  export let label: string;
  export let placeholder: string;
  export let setValue: (value: string) => void;
  export let rows = 5;

  const onChange: EventHandler<InputEvent, HTMLTextAreaElement> = (event) => {
    setValue(event.currentTarget.value);
  };
</script>

<vscode-text-area {rows} {name} {value} on:input={onChange} {placeholder}>
  {label}
</vscode-text-area>
