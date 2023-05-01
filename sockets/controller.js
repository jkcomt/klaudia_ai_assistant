const { Socket } = require("socket.io");
const { callWhisper,gptChatCompletion } = require('../controllers/openai.controller');

let prompt;
let completion;
const socketController = async( socket = new Socket(), io ) => {
    
      console.log('Un usuario se ha conectado');

      socket.on('obtener-transcripcion', async()=>{
        prompt = await callWhisper();
        socket.emit('recibir-transcripcion', prompt);

        completion = await gptChatCompletion(prompt);
        socket.emit('recibir-completion', completion);
      });

      socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
      });
}

module.exports = {
    socketController
}