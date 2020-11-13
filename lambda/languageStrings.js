/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    "pt-BR": {
        translation: {
            WELCOME_MSG: `<speak> Olá. Estou aqui para resolver dúvidas sobre suas aulas e auxiliar você em sua jornada acadêmica com a PUC RS. Como posso te ajudar? <break time="700ms"/> </speak>`,
            RETURN_WELCOME_MSG: `<speak> Olá! Fico feliz que você tenha voltado. <break time="200ms"/> Como posso te ajudar? <break time="700ms"/> </speak>`,
            HELP_MSG: `<speak> Claro! Posso te ajudar com reprodução de aulas<break time="200ms"/>, porcentagem de conclusão do seu curso<break time="200ms"/>, matrículas<break time="200ms"/>, telefone de contato<break time="200ms"/>, troca de senha<break time="200ms"/> e meu perfil<break time="200ms"/>. Sobre qual destes assuntos você gostaria de saber?  </speak>`,
            GOODBYE_MSG: `<speak> Tudo bem, se precisar de ajuda pode me chamar. Estarei sempre aqui para te ajudar. Até mais! </speak>`,
            FALLBACK_MSG: `<speak> Desculpa, mas eu não entendi. <break time="300ms"/> Você pode a qualquer momento falar “Preciso de ajuda” para obter mais informações sobre os assuntos que já posso te responder. Então. <break time="300ms"/> no que posso te ajudar agora? </speak>`,
            ERROR_MSG: `<speak> Desculpa, mas eu não entendi. Poderia repetir por favor? </speak>`,
            COURSE_PERCENTAGE_MSG: `<speak> Parabéns! Você já concluiu <break time="200ms"/> <prosody rate="medium">{{courses}}</prosody>. <break time="300ms"/> </speak>`,
            NOTIFICATION_MSG: `<speak> {{notificationsList.notifications}}. </speak>`,
            GET_IN_CONTACT_MSG: `<speak> Você pode entrar em contato através do {{contact.type}} usando o <break time="200ms"/> DDD <break time="200ms"/> <prosody rate="slow"><say-as interpret-as="digits"> {{contact.ddd}} </say-as></prosody> <break time="200ms"/> <prosody rate="slow"><say-as interpret-as="digits"> 9 </say-as></prosody> <break time="200ms"/> <prosody rate="slow"><say-as interpret-as="digits"> {{firstPart}} </say-as></prosody> <break time="200ms"/> <prosody rate="slow"><say-as interpret-as="digits"> {{lastPart}} </say-as></prosody> <break time="1s"/> </speak>`,
            EXAMS_MSG: `<speak> Você não tem exames para fazer. </speak>`,
            SHOW_COURSES_MSG: `<speak> Tudo bem, vamos lá! Acabei de analisar seu perfil e identifiquei algumas informações da sua conta. <break time="200ms"/>Você está cursando <prosody rate="medium"> {{courses}}. </prosody> </speak>`,
            SHOW_COURSES_PLAY_AUDIO_MSG: `<speak>Você está cursando <prosody rate="medium"> {{courses}}. </prosody> <break time="200ms"/> Você possui aulas disponíveis de {{course_name}}.  <break time="200ms"/> </speak>`,
            PROFILE_INFORMATION_MSG: `<speak> Tudo bem, vamos lá! <break time="200ms"/> Acabei de analisar seu perfil e identifiquei algumas informações da sua conta. <break time="200ms"/> Nome, E-mail, telefone e endereço. <break time="200ms"/> Qual informação você deseja saber? </speak>`,
            SHOW_PROFILE_ADDRESS_MSG: `<speak> Você cadastrou seu endereço como: <break time="200ms"/> Rua: {{location.street}} <break time="200ms"/> Número: {{location.street_number}} <break time="200ms"/> Bairro: {{location.neighborhood}} <break time="200ms"/> Cidade: {{location.city}} <break time="200ms"/> UF: {{location.state}}. <break time="200ms"/> </speak>`,
            SHOW_PROFILE_NO_ADDRESS_MSG: `<speak> Você não cadastrou seu endereço no sistema. <break time="200ms"/> </speak>`,
            SHOW_PROFILE_EMAIL_MSG: `<speak> Você cadastrou seu email como: <break time="200ms"/> {{email}}. <break time="200ms"/> </speak>`,
            SHOW_PROFILE_NAME_MSG: `<speak> Você cadastrou seu nome como: <break time="200ms"/> {{name}}. <break time="200ms"/> </speak>`,
            SHOW_PROFILE_PHONE_MSG: `<speak> Você cadastrou seu telefone como: <break time="200ms"/> {{phone}}. <break time="200ms"/> </speak>`,
            RESET_PASSWORD: `<speak> Quer resetar sua senha? Sem problema, vou te ajudar nisso. <break time="400ms"/> Estou enviando um passo a passo com todas as informações que você precisa ao e-mail vinculado a sua conta. </speak>`,
            RESET_ERROR_PASSWORD: `<speak> Desculpe, essa funcionalidade não está disponível no momento. Posso te ajudar com outro assunto? </speak>`
        }
    }
}