/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    "pt-BR": {
        translation: {
            WELCOME_MSG: `<speak> Olá. Estou aqui para resolver dúvidas sobre suas aulas e auxiliar você em sua jornada acadêmica com a PUC RS. Como posso te ajudar? <break time="700ms"/> </speak>`
        }
    }
}