async function saveOptions() {
    const apiKey = (document.getElementById('apiKey') as HTMLInputElement).value.trim();

    if (!apiKey) {
        showStatus('Please enter your OpenAI API key', 'error');
        return;
    }

    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
        return;
    }

    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        if (chrome.runtime.lastError) {
            showStatus(`Error: ${chrome.runtime.lastError.message}`, 'error');
        } else {
            showStatus('API key saved successfully!', 'success');
        }
    });
}

async function verifyApiKey(apiKey: string): Promise<boolean> {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            const errorData = await response.json();
            showStatus(`Verification failed: ${errorData.error.message}`, 'error');
            return false;
        }
    } catch (error: any) {
        showStatus(`Verification error: ${error.message}`, 'error');
        return false;
    }
}

// Restore options from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get('openaiApiKey', (result) => {
        if (result.openaiApiKey) {
            (document.getElementById('apiKey') as HTMLInputElement).value = result.openaiApiKey;
        }
    });
}

// Show status message
function showStatus(message: string, type: 'success' | 'error') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';

        // Shorter timeout for popup
        const timeout = type === 'success' ? 1500 : 2000;
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, timeout);
    }
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton')?.addEventListener('click', saveOptions); 