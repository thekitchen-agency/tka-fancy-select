# TKA Fancy Select

A premium, accessible, and highly customizable vanilla JavaScript select replacement.

## Features

- **Vanilla JS**: No dependencies (no jQuery).
- **Accessible**: ARIA support and full keyboard navigation.
- **Searchable**: Built-in search for large lists.
- **Multiple Select**: Supports native multiple select with tags/pills.
- **Customizable**: Easy to style with CSS variables.
- **Performant**: Efficient DOM management.
- **Lightweight**: Small footprint.

## Installation

```bash
npm install tka-fancy-select
```

Or use the CDN version:

```html
<link rel="stylesheet" href="https://unpkg.com/tka-fancy-select/dist/tka-fancy-select.css">
<script src="https://unpkg.com/tka-fancy-select/dist/tka-fancy-select.umd.cjs"></script>
```

## Development

This project uses **Vite** for a modern development experience.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Publishing

This project uses **Semantic Versioning** and **Conventional Commits**. To release a new version:

1.  Commit your changes using the Conventional Commits format:
    *   `feat: add new feature` (Minor bump)
    *   `fix: resolve bug` (Patch bump)
    *   `feat!: breaking change` (Major bump)
2.  Run the release script:
    ```bash
    npm run release
    ```
    This will bump the version in `package.json`, generate `CHANGELOG.md`, and create a git tag.
3.  Push the changes and tags:
    ```bash
    git push --follow-tags origin main
    ```

The **GitHub Action** will automatically pick up the new tag, build the library, and publish it to npm.

> [!IMPORTANT]
> Ensure you have added your `NPM_TOKEN` to your GitHub Repository Secrets.

## Usage

### Basic

```html
<select id="my-select">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

<script>
  new TKAFancySelect('#my-select', {
    title: 'Wählen Sie eine Option'
  });
</script>
```

### Auto-Initialization

Add `data-tka-fancy-select` to your selects and call `initAll()`:

```html
<select data-tka-fancy-select data-title="Kategorie">...</select>

<script>
  TKAFancySelect.initAll();
</script>
```

## Configuration

| Option | Default | Description |
| --- | --- | --- |
| `title` | `'Select'` | Default text for the trigger. |
| `selectAllText` | `'Alle auswählen'` | Text for select all button. |
| `resetText` | `'Zurücksetzen'` | Text for reset button. |
| `closeText` | `'Schliessen'` | Text for close button. |
| `hasSearch` | `true` | Show search input. |
| `showActions` | `multiple ? true : false` | Show select all/reset buttons. |
| `showCount` | `true` | Show count next to options (if `data-count` exists). |
| `showTags` | `true` | Show selected options as pills in the trigger. |
| `maxTags` | `2` | Maximum number of pills to show before "+N". |
| `closeOnSelect` | `!multiple` | Close dropdown after selection. |
| `dropdownZIndex` | `9999` | Z-index of the open dropdown. |

## Methods

- `open()`: Opens the dropdown.
- `close()`: Closes the dropdown.
- `refresh()`: Syncs the UI with the original select (useful if options change dynamically).
- `destroy()`: Removes the fancy select and restores the original.

## Events

The component emits custom events on the wrapper element:

- `tfs:open`: Fired when the dropdown opens.
- `tfs:close`: Fired when the dropdown closes.
- `tfs:change`: Fired when selection changes.

```javascript
document.querySelector('.tka-fancy-select-wrapper').addEventListener('tfs:change', (e) => {
  console.log('Selection changed!', e.detail);
});
```

## License

MIT
# tka-fancy-select
