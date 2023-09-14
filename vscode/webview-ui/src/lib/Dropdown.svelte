<script lang="ts">
  import type { EventHandler } from "svelte/elements";

  export let setValue: (value: string) => void;
  export let value: string;

  const onChange: EventHandler<any, any> = (event) => {
    setValue(event.currentTarget.value);
  };

  export let options: string[];
</script>

<vscode-dropdown {value} on:change={onChange}>
  {#each options as option}
    <vscode-option>{option}</vscode-option>
  {/each}
</vscode-dropdown>
