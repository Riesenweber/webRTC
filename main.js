function hasUserMedia() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.msGetUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    return !!navigator.getUserMedia;
}

function hasRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection;
    return !!window.RTCPeerConnection;
}

var yourVideo = document.getElementById("yours");
var theirVideo = document.getElementById("theirs");
var yourConnection, theirConnection;

if (hasUserMedia()) {
    navigator.getUserMedia({ video: true, audio: false },
        stream => {
            yourVideo.src = window.URL.createObjectURL(stream);
            if (hasRTCPeerConnection()) {
                startPeerConnection(stream);
            } else {
                alert("没有RTCPeerConnection API");
            }
        },
        err => {
            console.log(err);
        })
} else {
    alert("没有userMedia API")
}


function startPeerConnection(stream) {
    var config = {
        'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stunserver.org' }, { 'url': 'stun:stun.l.google.com:19302' }]
    };
    yourConnection = new RTCPeerConnection(config);
    theirConnection = new RTCPeerConnection(config);

    yourConnection.onicecandidate = function(e) {
        if (e.candidate) {
            theirConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
        }
    }
    theirConnection.onicecandidate = function(e) {
        if (e.candidate) {
            yourConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
        }
    }

    theirConnection.onaddstream = function(e) {
        theirVideo.src = window.URL.createObjectURL(e.stream);
    }
    yourConnection.addStream(stream);

    yourConnection.createOffer().then(offer => {
        yourConnection.setLocalDescription(offer);
        theirConnection.setRemoteDescription(offer);
        theirConnection.createAnswer().then(answer => {
            theirConnection.setLocalDescription(answer);
            yourConnection.setRemoteDescription(answer);
        })
    });
}