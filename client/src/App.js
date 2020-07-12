import React from 'react';
import { connect, createLocalVideoTrack } from 'twilio-video';
import './App.css';
const tokenGenerator = require('./tokenGenerator');

const usernameInput = document.getElementById('username');
const button = document.getElementById('join_leave');
const container = document.getElementById('container');
const count = document.getElementById('count');
var connected = false;
var room;

function addLocalVideo() {
  createLocalVideoTrack().then(track => {
      var video = document.getElementById('local').firstChild;
      var trackElement = track.attach();
      trackElement.addEventListener('click', () => { zoomTrack(trackElement); });
      video.appendChild(trackElement);
  });
};

function connectButtonHandler(e) {
  e.preventDefault();
  if (!connected) {
    var username = usernameInput.value;
    if (!username) {
        alert('Enter your name before connecting');
        return;
    }
    button.disabled = true;
    button.innerHTML = 'Connecting...';
    handleConnection(username).then(() => {
      button.innerHTML = 'Leave call';
      button.disabled = false;
    }).catch(() => {
      alert('Connection failed. Is the backend running?');
      button.innerHTML = 'Join call';
      button.disabled = false;      
    })
  }
  else {
    disconnect();
    button.innerHTML = 'Join call';
    connected = false;
  }
}

function handleConnection(username) {
  var promise = new Promise((resolve, reject) => {
    // fetch('/login', {
    //   method: 'POST',
    //   body: JSON.stringify({'username': username})
    // }).then(res => res.json()).then(data => {
    //   return connect(data)
    // })
    new Promise((resolve, reject) => {
      var token = tokenGenerator(username, 'ROOM')
      resolve(token);
    })
    .then(data => {
      connect(data)
      .then(_room => {
        room = _room
        console.log(`Successfully joined a Room: ${room}`);
        room.participants.forEach(participantConnected);
        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);
        connected = true;
        updateParticipantCount();
        resolve();
      }, error => {
        console.error(`Unable to connect to Room: ${error.message}`);
        reject();
      });
    })
  })
  return promise;  
}

function updateParticipantCount() {
  if (!connected)
      count.innerHTML = 'Disconnected.';
  else
      count.innerHTML = (room.participants.size + 1) + ' participants online.';
};

function participantConnected(participant) {
  var participant_div = document.createElement('div');
  participant_div.setAttribute('id', participant.sid);
  participant_div.setAttribute('class', 'participant');

  var tracks_div = document.createElement('div');
  participant_div.appendChild(tracks_div);

  var label_div = document.createElement('div');
  label_div.setAttribute('class', 'label');
  label_div.innerHTML = participant.identity;
  participant_div.appendChild(label_div);

  container.appendChild(participant_div);

  participant.tracks.forEach(publication => {
      if (publication.isSubscribed)
          trackSubscribed(tracks_div, publication.track);
  });
  participant.on('trackSubscribed', track => trackSubscribed(tracks_div, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);

  updateParticipantCount();
};

function participantDisconnected(participant) {
  document.getElementById(participant.sid).remove();
  updateParticipantCount();
};

function trackSubscribed(div, track) {
  var trackElement = track.attach();
  trackElement.addEventListener('click', () => { zoomTrack(trackElement); });
  div.appendChild(trackElement);
};

function trackUnsubscribed(track) {
  track.detach().forEach(element => {
      if (element.classList.contains('participantZoomed')) {
          zoomTrack(element);
      }
      element.remove()
  });
};

function disconnect() {
  room.disconnect();
  while (container.lastChild.id != 'local')
      container.removeChild(container.lastChild);
  button.innerHTML = 'Join call';
  connected = false;
  updateParticipantCount();
};

function zoomTrack(trackElement) {
  if (!trackElement.classList.contains('participantZoomed')) {
      // zoom in
      container.childNodes.forEach(participant => {
          if (participant.className == 'participant') {
              participant.childNodes[0].childNodes.forEach(track => {
                  if (track === trackElement) {
                      track.classList.add('participantZoomed')
                  }
                  else {
                      track.classList.add('participantHidden')
                  }
              });
              participant.childNodes[1].style.display = 'none';
          }
      });
  }
  else {
      // zoom out
      container.childNodes.forEach(participant => {
          if (participant.className == 'participant') {
              participant.childNodes[0].childNodes.forEach(track => {
                  if (track === trackElement) {
                      track.classList.remove('participantZoomed');
                  }
                  else {
                      track.classList.remove('participantHidden');
                  }
              });
              participant.childNodes[1].style.display = '';
          }
      });
  }
};

function App() {
  addLocalVideo();
  button.addEventListener('click', connectButtonHandler);

  return (
    <div className="App"></div>
  );
}

export default App;
