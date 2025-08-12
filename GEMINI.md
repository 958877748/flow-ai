# GEMINI.md - Flow AI Project Context

## Project Overview

This project is a **flow-based AI task execution system** called "Flow AI". It allows users to define and execute tasks by creating a flow of interconnected nodes. These nodes can perform various actions, such as calling Large Language Models (LLMs) for text generation or structured data output, and performing simple data processing.

The core technologies used are:
- **JavaScript**: The primary programming language.
- **PocketFlow**: A library for flow-based programming.
- **@guolei1994/fast-ai**: A library for interacting with AI models, specifically Qwen models via ModelScope.
- **Zod**: Used for schema declaration and validation, particularly for defining and validating the structure of AI-generated flow definitions.
- **Webpack**: Used for bundling the JavaScript code for the browser.

## Building and Running

The project uses NPM scripts for common development tasks, defined in `package.json`.

- **Install dependencies**:
  ```bash
  npm install
  ```
- **Build the project** (bundles the JavaScript into `dist/bundle.js`):
  ```bash
  npm run build
  ```
- **Run the development server** (starts a local server, usually on `http://localhost:9000`):
  ```bash
  npm run dev
  ```
- **Test**: The `test` script is currently a placeholder.
  ```bash
  npm run test # (Currently not implemented)
  ```

## Key Files and Directories

- **`src/script.js`**: The main application logic. This file:
  - Initializes the AI client.
  - Defines different types of nodes (`LLMTextNode`, `LLMObjectNode`, `DataProcessNode`).
  - Defines a Zod schema (`FlowDefinitionSchema`) for the structure of a flow definition.
  - Contains functions to create a `PocketFlow` instance from a definition (`createFlowFromDefinition`).
  - Includes a function to ask the LLM to design a flow for a given task (`designFlowByLLM`).
  - Sets up the user interface interaction in the `main` function and the `DOMContentLoaded` event listener.
- **`index.html`**: The main HTML file providing the user interface with an input field, a run button, and an output container.
- **`styles.css`**: Contains the styling for the HTML interface.
- **`webpack.config.js`**: Configuration for Webpack, specifying the entry point (`src/script.js`), output (`dist/bundle.js`), and development server settings.
- **`package.json`**: Contains project metadata, dependencies, and NPM scripts.
- **`README.md`**: Provides a general overview, setup instructions, usage guide, and a list of dependencies.

## Development Conventions

- **Frontend Development**: The project is a client-side JavaScript application bundled with Webpack for browser execution.
- **AI Interaction**: The `@guolei1994/fast-ai` library is used to communicate with LLMs. API keys are expected to be provided (though a mock mode exists for development).
- **Flow-Based Programming**: Logic is structured using the PocketFlow library, where tasks are broken down into a sequence of nodes connected by data flow.
- **Schema Validation**: Zod is used to define and validate the structure of data, especially the JSON schema for dynamically generated flow definitions.