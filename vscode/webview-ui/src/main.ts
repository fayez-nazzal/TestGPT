import App from "./App.svelte";

const app = new (App as any)({
  target: document.body,
});

export default app;
