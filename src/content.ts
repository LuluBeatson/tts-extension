// This file can be used to interact with the webpage content
console.log("Content script running");

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "readText" && message.text) {
        readTextWithTTS(message.text);
    }
    return true; // Keep the message channel open for asynchronous responses
});

// Function to call OpenAI's TTS API and play the audio
async function readTextWithTTS(text: string) {
    try {
        // Create a status element to show the user something is happening
        const statusElement = document.createElement('div');
        statusElement.style.position = 'fixed';
        statusElement.style.bottom = '20px';
        statusElement.style.right = '20px';
        statusElement.style.padding = '10px';
        statusElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        statusElement.style.color = 'white';
        statusElement.style.borderRadius = '5px';
        statusElement.style.zIndex = '10000';
        statusElement.textContent = 'Generating audio...';
        document.body.appendChild(statusElement);

        // Get API key from storage
        const storageData = await new Promise<{ [key: string]: any }>((resolve) => {
            chrome.storage.sync.get('openaiApiKey', (result) => {
                resolve(result);
            });
        });

        const apiKey = storageData.openaiApiKey as string | undefined;

        if (!apiKey) {
            throw new Error("Please set your OpenAI API key in the extension options");
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: 'alloy'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        // Get audio blob and play it
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            statusElement.remove();
        };

        statusElement.textContent = 'Playing audio...';
        audio.play();

    } catch (error: unknown) {
        console.error('Error with TTS:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
        alert(`Error: ${errorMessage}`);

        // Remove status element if it exists
        const statusElement = document.querySelector('div[style*="position: fixed"][style*="bottom: 20px"]');
        if (statusElement) {
            statusElement.remove();
        }
    }
}
