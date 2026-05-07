# Whiteboard For Fun

Whiteboard For Fun is a browser-based whiteboard playground I built just for fun, before the current AI era, as an experiment in drawing tools, geometry helpers, and lightweight local file handling.

The app is written in TypeScript and bundled with webpack. It focuses on direct interaction in the browser with pointer events, a canvas-based drawing surface, and SVG-driven toolbox controls.

## Features

- Multiple pen presets with different colors and thicknesses
- Eraser support
- Geometry helpers including ruler, protractor, set square, and compass tools
- New, open, save, and clear whiteboard actions
- Local whiteboard file support using the `.w4fun` format
- Toolbox-driven UI built for mouse, touchpad, touch, and digital pen input

## Browser Notes

This project works best in Chromium-based browsers such as Edge, Chrome, and Opera. Firefox support is limited, and file open/save depends on the File System Access API available in compatible browsers.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run develop
```

Open the local URL shown by webpack-dev-server, typically `http://localhost:8080`.

### Create a production build

```bash
npm run build
```

The production bundle is emitted to the `dist/` folder.

## Project Notes

This repository reflects an earlier personal experiment rather than a polished product. The goal was to explore browser-based whiteboard interactions and geometry tooling in a compact codebase.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.