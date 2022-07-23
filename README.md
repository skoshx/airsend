## TODO

-> `$ peerjs --port 9000 --key peerjs --allow_discovery`

-> improve `deriveUsernameFromId()`
-> paste file from clipboard:
```typescript
_onPaste(e) {
    const files = e.clipboardData.files || e.clipboardData.items
        .filter(i => i.type.indexOf('image') > -1)
        .map(i => i.getAsFile());
    const peers = document.querySelectorAll('x-peer');
    // send the pasted image content to the only peer if there is one
    // otherwise, select the peer somehow by notifying the client that
    // "image data has been pasted, click the client to which to send it"
    // not implemented
    if (files.length > 0 && peers.length === 1) {
        Events.fire('files-selected', {
            files: files,
            to: $$('x-peer').id
        });
    }
}
```

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte

# create a new project in my-app
npm init svelte my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
