const fs = require('fs');
const { response, request} = require("express");
const { Configuration, OpenAIApi } = require("openai");

const _configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const _openai = new OpenAIApi(_configuration);

const gptChatCompletion = async(prompt)=>{

    try {
        let queryObj = {
            model: "gpt-3.5-turbo",
            messages: [
                {"role":"system","content":`
                 Eres una asistente muy amable.
                 Respondes al nombre de KlaudIA.
                 Tus respuestas empezarán con el enunciado de lo que se te pidió seguido de la respuesta.`},
                {"role":"user","content": prompt}
            ],
            max_tokens: 1000,
            temperature:1
        }

        const completion = await _openai.createChatCompletion(queryObj);
        const messages = completion.data.choices[0].message;
        const usage = completion.data.usage;
        // console.log(`message: ${JSON.stringify(messages)}`);
        return {messages,usage};

    } catch (error) {
        console.log(JSON.stringify(error));
    }

}

const callWhisper = async()=>{

    const result = await _openai.createTranscription(
		fs.createReadStream("./uploads/audio.wav"),
		"whisper-1"
	  );
	return result.data.text;

}

const handlerRequest = async(req = request, res = response)=>{
    try {
		// Obtener el archivo de audio que se envió
		const audioFile = req.file;

		// Guardar el archivo de audio en un directorio
		fs.rename(audioFile.path, './uploads/' + audioFile.originalname, async (error) => {
			if (error) {				
				res.status(500).send('Error al guardar el archivo de audio');
			} else {
				console.log('¡Audio guardado con éxito!');
                res.json("ok");
			}
		});

	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

module.exports = {
    handlerRequest,
    callWhisper,
    gptChatCompletion
}