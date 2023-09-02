<script lang="ts">
  import type { EventHandler } from "svelte/elements";

  export let setValue: (value: string) => void;

  const onChange: EventHandler<any, any> = (event) => {
    setValue(event.currentTarget.value);
  };

  export let options: string[];
</script>

<vscode-dropdown on:change={onChange}>
  {#each options as option}
    <vscode-option>{option}</vscode-option>
  {/each}
</vscode-dropdown>
