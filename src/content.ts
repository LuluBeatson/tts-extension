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

        // Create audio player UI
        createAudioPlayerUI(audio, statusElement, audioUrl);

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

// Function to create audio player UI with controls
function createAudioPlayerUI(audio: HTMLAudioElement, statusElement: HTMLDivElement, audioUrl: string) {
    // Remove the status text
    statusElement.textContent = '';
    statusElement.style.width = '300px';
    statusElement.style.padding = '15px';

    // Create player container
    const playerContainer = document.createElement('div');
    playerContainer.style.display = 'flex';
    playerContainer.style.flexDirection = 'column';
    playerContainer.style.gap = '10px';

    // Create title
    const title = document.createElement('div');
    title.textContent = 'TTS Player';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '5px';

    // Create timeline container
    const timelineContainer = document.createElement('div');
    timelineContainer.style.display = 'flex';
    timelineContainer.style.alignItems = 'center';
    timelineContainer.style.gap = '8px';

    // Create current time display
    const currentTimeDisplay = document.createElement('span');
    currentTimeDisplay.textContent = '0:00';
    currentTimeDisplay.style.fontSize = '12px';
    currentTimeDisplay.style.minWidth = '35px';

    // Create timeline slider
    const timeline = document.createElement('input');
    timeline.type = 'range';
    timeline.min = '0';
    timeline.max = '100';
    timeline.value = '0';
    timeline.style.flex = '1';
    timeline.style.height = '4px';
    timeline.style.accentColor = '#4285f4';

    // Create duration display
    const durationDisplay = document.createElement('span');
    durationDisplay.textContent = '0:00';
    durationDisplay.style.fontSize = '12px';
    durationDisplay.style.minWidth = '35px';
    durationDisplay.style.textAlign = 'right';

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.alignItems = 'center';

    // Create play/pause button
    const playPauseButton = document.createElement('button');
    playPauseButton.textContent = '⏸️';
    playPauseButton.style.background = 'none';
    playPauseButton.style.border = 'none';
    playPauseButton.style.color = 'white';
    playPauseButton.style.fontSize = '18px';
    playPauseButton.style.cursor = 'pointer';
    playPauseButton.style.padding = '5px';

    // Create speed selector
    const speedSelector = document.createElement('select');
    speedSelector.style.background = 'rgba(255, 255, 255, 0.2)';
    speedSelector.style.color = 'white';
    speedSelector.style.border = 'none';
    speedSelector.style.borderRadius = '3px';
    speedSelector.style.padding = '2px 5px';
    speedSelector.style.fontSize = '12px';

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    speeds.forEach(speed => {
        const option = document.createElement('option');
        option.value = speed.toString();
        option.textContent = `${speed}x`;
        if (speed === 1.0) option.selected = true;
        speedSelector.appendChild(option);
    });

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '14px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '5px';

    // Assemble the UI
    timelineContainer.appendChild(currentTimeDisplay);
    timelineContainer.appendChild(timeline);
    timelineContainer.appendChild(durationDisplay);

    controlsContainer.appendChild(playPauseButton);
    controlsContainer.appendChild(speedSelector);
    controlsContainer.appendChild(closeButton);

    playerContainer.appendChild(title);
    playerContainer.appendChild(timelineContainer);
    playerContainer.appendChild(controlsContainer);

    statusElement.appendChild(playerContainer);

    // Event listeners
    let isPlaying = true;

    // Format time function
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Update timeline as audio plays
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        timeline.value = percent.toString();
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    // Set duration once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(audio.duration);

        // Try to play audio after metadata is loaded
        playAudio();
    });

    // Timeline scrubbing
    timeline.addEventListener('input', () => {
        const seekTime = (parseFloat(timeline.value) / 100) * audio.duration;
        audio.currentTime = seekTime;
    });

    // Play/pause button
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseButton.textContent = '▶️';
        } else {
            playAudio();
        }
        isPlaying = !isPlaying;
    });

    // Speed selector
    speedSelector.addEventListener('change', () => {
        audio.playbackRate = parseFloat(speedSelector.value);
    });

    // Close button
    closeButton.addEventListener('click', () => {
        audio.pause();
        URL.revokeObjectURL(audioUrl);
        statusElement.remove();
    });

    // Handle audio ending
    audio.addEventListener('ended', () => {
        playPauseButton.textContent = '▶️';
        isPlaying = false;
    });

    // Function to handle audio playback with user interaction awareness
    const playAudio = async () => {
        try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Playback started successfully
                        playPauseButton.textContent = '⏸️';
                        console.log('Audio playback started successfully');
                    })
                    .catch(error => {
                        // Auto-play was prevented
                        console.error('Audio playback failed:', error);
                        isPlaying = false;
                        playPauseButton.textContent = '▶️';

                        // Add a message to inform the user they need to interact
                        const message = document.createElement('div');
                        message.textContent = 'Click play to start audio';
                        message.style.fontSize = '12px';
                        message.style.textAlign = 'center';
                        message.style.marginTop = '5px';
                        message.style.color = '#ffcc00';
                        playerContainer.insertBefore(message, playerContainer.firstChild);

                        // Remove the message after 5 seconds
                        setTimeout(() => {
                            if (message.parentNode === playerContainer) {
                                playerContainer.removeChild(message);
                            }
                        }, 5000);
                    });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    // Start playing the audio
    playAudio();

    // Add debug info
    console.log('Audio player created, attempting to play audio');
    audio.addEventListener('playing', () => {
        console.log('Audio is now playing');
    });

    audio.addEventListener('waiting', () => {
        console.log('Audio is waiting for data');
    });

    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });
}
