# Flow AI

A flow-based AI task execution system.

## Project Structure

- `src/` - Source code
- `dist/` - Build outputs
- `styles.css` - Stylesheet
- `index.html` - Main HTML file
- `webpack.config.js` - Webpack configuration
- `package.json` - Project metadata and dependencies
- `.gitignore` - Git ignore file

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open the application in your browser (http://localhost:9000 by default)
2. Enter a task in the input field
3. Click "执行任务" to run the task
4. View the execution logs in the output section

## Dependencies

- [@guolei1994/fast-ai](https://github.com/guolei1994/fast-ai) - AI utilities
- [PocketFlow](https://github.com/The-Pocket/PocketFlow-Typescript) - Flow-based programming library
- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema declaration and validation library
- [Zod to JSON Schema](https://github.com/StefanTerdell/zod-to-json-schema) - Convert Zod schemas to JSON Schema

## Development

This project uses Webpack for bundling and webpack-dev-server for development.