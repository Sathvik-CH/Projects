// JavaScript for modal and basic interactivity

function openModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === "user" && password === "pass") {
        alert("Login successful!");
        closeModal();
    } else {
        alert("Invalid credentials. Please try again.");
    }
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeModal();
    }
}
// JavaScript to implement "Go to Top" functionality
document.addEventListener('DOMContentLoaded', () => {
    const goToTopBtn = document.getElementById('goToTopBtn');

    if (goToTopBtn) {
        goToTopBtn.addEventListener('click', () => {
            // Smoothly scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
// Variables for WebRTC
// Variables for WebRTC
// Initialize PeerJS
const peer = new Peer(); // Automatically generates a peer ID
let localStream;
let currentCall;

// Display the generated peer ID
peer.on('open', id => {
    document.getElementById('peerId').textContent = id;
});

// Get access to the camera and microphone
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        document.getElementById('localVideo').srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera or microphone. Please check your device settings and permissions.');
    });

// Handle incoming calls
peer.on('call', call => {
    currentCall = call;
    call.answer(localStream); // Answer the call with the local video stream
    call.on('stream', remoteStream => {
        document.getElementById('remoteVideo').srcObject = remoteStream;
    });
    call.on('close', () => {
        endCall();
    });
});

// Function to start a call with another peer
function startCall() {
    const remotePeerId = document.getElementById('remotePeerId').value;
    if (!remotePeerId) {
        alert('Please enter a remote peer ID.');
        return;
    }
    const call = peer.call(remotePeerId, localStream);
    currentCall = call;
    call.on('stream', remoteStream => {
        document.getElementById('remoteVideo').srcObject = remoteStream;
    });
    call.on('close', () => {
        endCall();
    });
}

// Function to end the call
function endCall() {
    if (currentCall) {
        currentCall.close();
    }
    document.getElementById('remoteVideo').srcObject = null;
}
// main.js

// Function to open the logout confirmation modal
function openModal() {
    document.getElementById('logoutModal').style.display = 'block';
}

// Function to close the logout confirmation modal
function closeModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

// Logout function
function logout() {
    // Clear the authentication token from localStorage
    localStorage.removeItem('token');

    // Redirect to the login page
    window.location.href = 'login.html';
}

// Go to Top functionality
document.getElementById('goToTopBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Close the modal if user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('logoutModal');
    if (event.target === modal) {
        closeModal();
    }
};
