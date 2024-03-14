let recognition;
let isSpeaking = false;
let isEndingCall = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;

    const chatBox = document.getElementById('chat-box');
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');

    startButton.addEventListener('click', () => {
        startRecognition();
    });

    endButton.addEventListener('click', () => {
        isEndingCall = true;
        stopRecognition();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (!isSpeaking && !isEndingCall) {
            sendMessage(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        restartRecognition();
    };

    recognition.onend = () => {
        if (!isEndingCall) {
            restartRecognition();
        }
    };
} else {
    console.log('Web Speech API is not supported in this browser.');
}

function startRecognition() {
    try {
        recognition.start();
        startButton.style.display = 'none';
        endButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        restartRecognition();
    }
}

function stopRecognition() {
    try {
        recognition.stop();
        startButton.style.display = 'inline-block';
        endButton.style.display = 'none';
        isEndingCall = false;
    } catch (error) {
        console.error('Error stopping speech recognition:', error);
        restartRecognition();
    }
}

function restartRecognition() {
    stopRecognition();
    startRecognition();
}

function sendMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('p');
    messageElement.textContent = 'You: ' + message;
    chatBox.appendChild(messageElement);

    fetch('/response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        const responseElement = document.createElement('p');
        responseElement.textContent = 'AI: ' + data.response;
        chatBox.appendChild(responseElement);
        speak(data.response);
    })
    .catch(error => {
        console.error('Error fetching response:', error);
    });
}

function speak(text) {
    isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    speechSynthesis.speak(utterance);
    utterance.onend = () => {
        isSpeaking = false;
        if (!isEndingCall) {
            startRecognition();
        }
    };
}
