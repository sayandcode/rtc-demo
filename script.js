const sdpInput = document.querySelector('textarea.sdp');
const iceInput = document.querySelector('textarea.ice');
const createOfferBtn = document.getElementById('create-offer');
const submitSdpBtn = document.querySelector('button.sdp');
const submitIceBtn = document.querySelector('button.ice');
const localVid = document.getElementById('local-vid')
const remoteVid = document.getElementById('remote-vid')

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const pc = new RTCPeerConnection(configuration);
let isInitiator = false;

(async()=>{
  const localStream = await navigator.mediaDevices.getUserMedia({video: true});
  console.log(localStream)
  localVid.srcObject = localStream;
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  
  // add listeners
  pc.ontrack = e => {
    const [remoteStream] = e.streams
    console.log("new track", remoteStream)
    remoteVid.srcObject = remoteStream;
  }
  pc.onicecandidate = e => {
    const ice = encodeURI(JSON.stringify(e.candidate))
    console.log({ice});
  }
  submitIceBtn.onclick = async e => {
    const iceObj = JSON.parse(decodeURI(iceInput.value));
    if(!iceObj) throw new Error("Put something in ice input box")
    const newIce = new RTCIceCandidate(iceObj)
    await pc.addIceCandidate(newIce)
  }
  
  // Offer and answer
  createOfferBtn.onclick =async e => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer)
    isInitiator = true;
    const offerStr = encodeURI(JSON.stringify(offer))
    console.log({offerStr})
  }
  submitSdpBtn.onclick = async e => {
    const offerObj = JSON.parse(decodeURI(sdpInput.value));
    if(!offerObj) throw new Error("Put something in sdp input box");
    const offer = new RTCSessionDescription(offerObj);
    await pc.setRemoteDescription(offer)
    if(isInitiator) return;

    // only for responder
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const answerStr = encodeURI(JSON.stringify(answer))
    console.log({answerStr})
  }

})()