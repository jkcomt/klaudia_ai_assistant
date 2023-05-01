const synth = window.speechSynthesis;
const audioChunks = [];
const btnSendName = document.getElementById("btnSendName");
const btnStart    = document.getElementById("btnStart");
const btnCloseChat    = document.getElementById("btnCloseChat");
const btnStopRecording = document.getElementById("btnStopRecording");
const txtUserName = document.getElementById("txtUserName");
const chatContent = document.getElementById("chat-content");

let mediaRecorder;
let userName = "Guest";
let timeLeft = 30;
let socket = null;

//Modal para obtener nombre del usuario
$('#askNameModalCenter').modal('show');

//Captura el input de username
txtUserName.addEventListener("keyup",()=>{
    if(txtUserName.value && txtUserName.value.length >= 3){
        btnSendName.disabled = false;
    }else{
        btnSendName.disabled = true;
    }
});

//Guarda el username y conecta el socket
btnSendName.addEventListener("click",async ()=>{
    userName = txtUserName.value;
    textToSpeach(`Hola ${userName}. ¿En qué puedo ayudarte?`);
    connectarSocket();
});

//Inicia el tiempo de grabación
btnStart.addEventListener("click", () => {
    btnStart.disabled = true;
    if (timeLeft > 0) {
        $('#countDownModalCenter').modal('show');        
		setTimeout(countdown, 1000);
	}
    audioChunks.length = 0;
    mediaRecorder.start();
});

//Detiene la grabación
btnStopRecording.addEventListener("click",()=>{
    timeLeft=0;
    btnStart.disabled = false;
});

//Cerrar Chat
btnCloseChat.addEventListener("click",()=>{
    socket.disconnect();
    location.reload();
});

//Gestiona el audio
const handleSuccess = (stream) => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);

        // Crear objeto FormData y agregar audio Blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');

        // Enviar FormData a Node.js
        fetch("/api/audio", { 
        method: "POST", body: formData 
        })
        .then((response) =>{
            // console.log('response.status ',response.status);
            socket.emit('obtener-transcripcion');
        })
        .catch((error)=>{
            console.error("Error:", error);
        })
    });
}

//Captura el audio grabado del micro
navigator.mediaDevices.getUserMedia({ audio: true }).then(handleSuccess);

//Lee el texto y lo asigna a la vista del chat
const textToSpeach = (text)=>{
    const utterThis = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices()
    utterThis.voice = voices[259];
    synth.speak(utterThis);
    chatContent.innerHTML += answerIA(text);
}

//Contador atrás para tiempo de grabación
const countdown= ()=>{
    document.getElementById("seconds").innerHTML = String( timeLeft );
	timeLeft--;
	if (timeLeft > 0) {
		setTimeout(countdown, 1000);
	}else{
        timeLeft=30;
        mediaRecorder.stop();
        $('#countDownModalCenter').modal('hide');
        btnStart.disabled = false;
    }
};

// Items de chat | Respuesta de IA
const answerIA=(message)=>{    
    let item = `<div class="media media-chat" data-toggle="modal" data-target="#assistantModalCenter">
                    <img
                        class="avatar"
                        src="img/00067-578282106.png"
                        alt="..."
                    />
                    <div class="media-body">
                        <p>${message}</p>
                        
                    </div>
                </div>`
    return item;
}

// Items de chat | Respuesta de Usuario
const answerUser=(message)=>{
    let item = `<div class="media media-chat media-chat-reverse">
                    <img
                        class="avatar"
                        src="https://img.icons8.com/color/36/000000/administrator-male.png"
                        alt="..."
                    />
                    <div class="media-body">
                        <p>${message}</p>
                    </div>
                </div>`

    return item;
}

//sockets
const connectarSocket = ()=>{

    socket = io();
    
    socket.on('connect',()=>{
       console.log('Sockets online');
    });

    socket.on('disconnect', ()=>{
        console.log('Sockets offline');
    });

    socket.on("recibir-transcripcion",(message)=>{
        chatContent.innerHTML += answerUser(message);
    });

    socket.on("recibir-completion",(completion)=>{        
        textToSpeach(`${userName}. ${completion.messages.content}`);
    });
}