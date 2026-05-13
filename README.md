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

The project is configured to publish automatically to npm via **GitHub Actions** when a new tag is pushed.

1.  Update version in `package.json`.
2.  Commit and push changes.
3.  Create a new tag: `git tag v1.0.1`.
4.  Push the tag: `git push origin v1.0.1`.

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
