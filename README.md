# OpenAI TTS Chrome Extension

This is a Chrome extension that allows you to use OpenAI's TTS API to read text on any webpage.

## Installation

1. Clone this repository
2. Create a `.env` file in the root of the repository with the following content:

```
OPENAI_API_KEY=<your-openai-api-key>
```

3. Run `npm install`
4. Run `npm run build`
5. Open Chrome and go to `chrome://extensions/`
6. Enable Developer mode
7. Click on "Load unpacked" and select the `dist` folder in the repository

## Usage

1. Select the text you want to read
2. Right click and select "Read with OpenAI TTS"
3. Wait for the audio to be generated. It will start playing automatically.
4. Use the controls in the popup to pause, resume, or stop the audio.
