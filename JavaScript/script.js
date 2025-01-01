let currentSong=new Audio();
let songs;
let currFolder;

async function getSongs(folder){
    currFolder=folder;
    let a=await fetch(`/${currFolder}/`);
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let as=div.getElementsByTagName("a");
    songs=[];
    for(let i=0;i<as.length;i++){
        const element=as[i];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    
    //Show songs in playlist
    let songUl=document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML=""
    for (const song of songs) {
        songUl.innerHTML=songUl.innerHTML+`<li>
              <img src="svg/music.svg" class="invert">
              <div class="info" style="width:180px">
                <div>${song.replaceAll("%20"," ").replaceAll(".mp3","")}</div>
              </div>
              <img src="svg/playnow.svg" class="invert">
            </li>`;
    }

   //Attach an event listner to each song
   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
   });
   return songs
}

const playMusic=(track,pause=false)=>{
    // let audio=new Audio(`http://127.0.0.1:3000/${folder}/`+track+".mp3")
    // audio.play()
    currentSong.src=`/${currFolder}/`+track+".mp3"
    if(!pause){
        currentSong.play()
        play.src="svg/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=track.replaceAll("%20"," ").replaceAll(".mp3","")
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

// Function to format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function displayAlbums(){
    let a=await fetch(`/public/songs/`);
    let response=await a.text();
    let div=document.createElement("div");
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
        for(let i=0;i<array.length;i++){
            const e=array[i];

        if(e.href.includes("/songs")&&e.href.endsWith("/")){
            let folder=e.href.split("/").splice(-2)[0]
            //Get the metadata of the folder
            let a=await fetch(`/public/songs/${folder}/info.json`);
            let response=await a.json();
            cardContainer.innerHTML+=`<div data-folder="${folder}" class="card">
              <span class="play">
                <img src="svg/play.svg" class="triangle">
              </span>
              <img src="/public/songs/${folder}/cover.jpeg">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }

     //Load the playlist  when card is clicked
   Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async item=>{
        songs=await getSongs(`public/songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0].replace(".mp3",""))
    })
   })
}

async function main(){

    //List of all the songs in playlist
    await getSongs("public/songs/EnglishLofiSong");
    playMusic(songs[0].replace(".mp3",""),true)

    //Display all the albums on the page
    displayAlbums()

   //Attach an event listener to play, next and previous
   play.addEventListener("click",()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src="svg/pause.svg"
    }
    else{
        currentSong.pause()
        play.src="svg/play.svg"
    }
   })

   // Attach an event listener to update the song time
    currentSong.addEventListener("timeupdate", () => {
    const currentTime = formatTime(currentSong.currentTime);
    const duration = formatTime(currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${currentTime} / ${duration}`;
    document.querySelector(".circle").style.left=currentSong.currentTime/currentSong.duration*100+"%";
});

    //Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let x=e.clientX
        let rect = e.target.getBoundingClientRect();
        let width = rect.right - rect.left;
        let percentage=(x-rect.left)/width
        currentSong.currentTime=percentage*currentSong.duration
    })

    //Add an event listener to the hamburger
    document.querySelector("#hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    //Add an event listener to the close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    //Add an event listner to previous ans next
    previous.addEventListener("click",()=>{
        let idx=songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if(idx-1>=0){
            playMusic(songs[idx-1].replace(".mp3",""))
        }
    })

    next.addEventListener("click",()=>{
        let idx=songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if(idx+1<songs.length){
            playMusic(songs[idx+1].replace(".mp3",""))
        }
    })

    //Add an event to volume
    document.querySelector("#volumeBar").addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100
    })

    //Add an event to the mute the track
document.querySelector(".volume>img").addEventListener("click",(e)=>{
        if(e.target.src.includes("svg/volume.svg")){
            e.target.src=e.target.src.replace("svg/volume.svg","svg/mute.svg")
            currentSong.volume=0
            document.querySelector("#volumeBar").value=0
        }
        else{
            e.target.src=e.target.src.replace("svg/mute.svg","svg/volume.svg")
            currentSong.volume=0.2
            document.querySelector("#volumeBar").value=20
        }
    });
}
main();