# OpenAI TTS Chrome Extension

This is a Chrome extension that allows you to use OpenAI's Text-to-Speech (TTS) API to read selected text on any webpage.

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable Developer mode
6. Click on "Load unpacked" and select the `dist` folder in the repository

## Setup

1. Click on the extension icon in your browser toolbar
2. Enter your OpenAI API key in the settings popup
3. Click Save

Your API key is stored locally in your browser and is only sent to OpenAI's servers when generating speech.

## Usage

1. Select any text on a webpage
2. Right-click and select "Read with OpenAI TTS" from the context menu
3. The extension will convert the selected text to speech using OpenAI's TTS API
4. Audio will play automatically and a status indicator will appear on the page

## Development

-   `npm run build` - Build the extension
-   `npm run watch` - Watch for changes and rebuild automatically
-   `npm run start` - Build and then watch for changes

## Technologies Used

-   TypeScript
-   OpenAI
-   esbuild for bundling
-   npm
