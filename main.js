const APP_ID = "20c913fd80d644d788b4827aa081446a"
const TOKEN = "007eJxTYPh09Imm0aHgnrc3bJlfhyjuzKvIcQ3gUd70QWXdvohvR7MUGIwMki0NjdNSLAxSzExMUswtLJJMLIzMExMNLAxNTMwSly+WSG0IZGS492U2MyMDBIL43AzmBqYKIanFJZl56QwMAHpIInE="
const CHANNEL = "705 Testing"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)
    
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('set-btn').style.display = 'none'
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('set-btn').style.display = 'block'
    document.getElementById('item1').checked = false; 
    document.getElementById('item2').checked = false;
    document.getElementById('item3').checked = false; 
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

// let toggleMic = async (e) => {
//     if (localTracks[0].muted){
//         await localTracks[0].setMuted(false)
//         e.target.innerText = 'Mic on'
//         e.target.style.backgroundColor = 'cadetblue'
//     }else{
//         await localTracks[0].setMuted(true)
//         e.target.innerText = 'Mic off'
//         e.target.style.backgroundColor = '#EE4B2B'
//     }
// }

let toggleMic = async (e = null) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false);
        if (e) {
            e.target.innerText = 'Mic on';
            e.target.style.backgroundColor = 'cadetblue';
        }
    }else{
        await localTracks[0].setMuted(true);
        if (e) {
            e.target.innerText = 'Mic off';
            e.target.style.backgroundColor = '#EE4B2B';
        }
    }
}

let toggleCamera = async (e = null) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        if (e) {
            e.target.innerText = 'Camera on'
            e.target.style.backgroundColor = 'cadetblue'
        }
    }else{
        await localTracks[1].setMuted(true)
        if (e) {
            e.target.innerText = 'Camera off'
            e.target.style.backgroundColor = '#EE4B2B'
        }
    }
}

document.getElementById('join-btn').addEventListener('click', async function() {
    // Check the status of checkboxes
    let isMicOn = document.getElementById('item1').checked;
    let isVolumeOn = document.getElementById('item2').checked;
    let isCommentsOn = document.getElementById('item3').checked;

    await joinStream()

    // // Configure the video conference based on the checkbox selections
    if (!isMicOn) {
        await toggleMic()
        document.getElementById('mic-btn').innerText = 'Mic off';
        document.getElementById('mic-btn').style.backgroundColor = '#EE4B2B';
    }
    if (!isVolumeOn) {
        await toggleCamera()
        document.getElementById('camera-btn').innerText = 'Camera off'
        document.getElementById('camera-btn').style.backgroundColor = '#EE4B2B'
    }
    // if (isCommentsOn) {
        
    // }
});


// document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)