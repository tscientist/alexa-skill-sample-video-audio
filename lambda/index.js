/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
const util = require('./util');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');
const persistenceAdapter = getPersistenceAdapter();

const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};

function getPersistenceAdapter(tableName) {
    // This function is an indirect way to detect if this is part of an Alexa-Hosted skill
    function isAlexaHosted() {
        return process.env.S3_PERSISTENCE_BUCKET;
    }
    if (isAlexaHosted()) {
        const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({
             bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    }
}

const BACKGROUND_IMAGE_URL = 'https://s3.amazonaws.com/cdn.dabblelab.com/img/echo-show-bg-blue.png',
  VIDEO_URL = 'https://player.vimeo.com/external/382451257.hd.mp4?s=6278c472863626a3544b94ddabfd5791b6e47efd&profile_id=169&oauth2_token_id=1238288412',
  VIDEO_TITLE = "Teste de video",
  VIDEO_SUBTITLE = "Reproduzindo video em uma Alexa Skill",
  TITLE = 'Skill de video',
  TEXT = `Reproduzindo aula`;

const PlayVideoIntentHandler = {
  async canHandle(handlerInput) {
        const playbackInfo = await getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;
        console.log('cheguei aqui')
        if (!playbackInfo.inPlaybackSession) {
                    console.log('cheguei aqui1')

            return request.type === 'IntentRequest' && request.intent.name === 'PlayAudio' || handlerInput.requestEnvelope.request.type === 'LaunchRequest' || request.type === 'IntentRequest' && request.intent.name === 'PlayVideoIntent';
        }
        
        if (request.type === 'PlaybackController.PlayCommandIssued') {
                    console.log('cheguei aqui2')

            return true;
        }
    
        if (request.type === 'IntentRequest') {
                    console.log('cheguei aqui3')

            return request.intent.name === 'PlayAudio' || request.intent.name === 'AMAZON.ResumeIntent' || request.intent.name === 'PlayVideoIntent'
        }
        
        if (request.type === 'LaunchRequest') {
                    console.log('cheguei aqui3ss')
            return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
        }

  },
  async handle(handlerInput) {
    console.log('cheguei ate aqui')
    if (supportsDisplay(handlerInput)) {

      let backgroundImage = new Alexa.ImageHelper()
        .withDescription(TITLE)
        .addImageInstance(BACKGROUND_IMAGE_URL)
        .getImage();

      let primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(TEXT)
        .getTextContent();

      let myTemplate = {
        type: 'BodyTemplate1',
        token: 'Welcome',
        backButton: 'HIDDEN',
        backgroundImage: backgroundImage,
        title: TITLE,
        textContent: primaryText,
      }

      handlerInput.responseBuilder
        .addVideoAppLaunchDirective(VIDEO_URL, VIDEO_TITLE, VIDEO_SUBTITLE)
        .addRenderTemplateDirective(myTemplate)
        .withSimpleCard(TITLE, VIDEO_SUBTITLE);
        
        return handlerInput.responseBuilder
          .getResponse();

    } else {
        console.log('oi')
        return controller.play(handlerInput);
/*
      handlerInput.responseBuilder
        .withSimpleCard(TITLE, "This skill requires a device with the ability to play videos.")
        .speak("The video cannot be played on your device. To watch this video, try launching this skill from an echo show device.");*/
    }


  },
};


const AudioPlayerEventHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
    },
    async handle(handlerInput) {
        const {
            requestEnvelope,
            attributesManager,
            responseBuilder
        } = handlerInput;
        const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
        const {
            playbackSetting,
            playbackInfo
        } = await attributesManager.getPersistentAttributes();
    
        switch (audioPlayerEventName) {
            case 'PlaybackStarted':
                playbackInfo.token = getToken(handlerInput);
                playbackInfo.index = await getIndex(handlerInput);
                playbackInfo.inPlaybackSession = true;
                playbackInfo.hasPreviousPlaybackSession = true;
                console.log('comecou', playbackInfo)
    
                break;
            case 'PlaybackFinished':
                playbackInfo.inPlaybackSession = false;
                playbackInfo.hasPreviousPlaybackSession = false;
                playbackInfo.nextStreamEnqueued = false;
                break;
            case 'PlaybackStopped':
                console.log('Playback stoped :', handlerInput.requestEnvelope.request);
    
                playbackInfo.token = getToken(handlerInput);
                playbackInfo.index = await getIndex(handlerInput);
                playbackInfo.offsetInMilliseconds = getOffsetInMilliseconds(handlerInput);
                break;
            case 'PlaybackNearlyFinished':
                {
                    if (playbackInfo.nextStreamEnqueued) {
                        break;
                    }
    
                    const enqueueIndex = (playbackInfo.index + 1) % util.audioData.length;
    
                    if (enqueueIndex === 0 && !playbackSetting.loop) {
                        break;
                    }
    
                    playbackInfo.nextStreamEnqueued = true;
    
                    const enqueueToken = playbackInfo.playOrder[enqueueIndex];
                    const playBehavior = 'ENQUEUE';
                    const podcast = util.audioData[playbackInfo.playOrder[enqueueIndex]];
                    const expectedPreviousToken = playbackInfo.token;
                    const offsetInMilliseconds = 0;
    
                    responseBuilder.addAudioPlayerPlayDirective(
                        playBehavior,
                        podcast.url,
                        enqueueToken,
                        offsetInMilliseconds,
                        expectedPreviousToken,
                    );
                    break;
                }
            case 'PlaybackFailed':
                playbackInfo.inPlaybackSession = false;
                console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
                return;
            default:
                throw new Error('Should never reach here!');
        }
    
        return responseBuilder.getResponse();
    },
};

const CheckAudioInterfaceHandler = {
    async canHandle(handlerInput) {
        const audioPlayerInterface = ((((handlerInput.requestEnvelope.context || {}).System || {}).device || {}).supportedInterfaces || {}).AudioPlayer;
        return audioPlayerInterface === undefined
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Desculpe, essa skill não é suportada nesse dispositivo')
            .withShouldEndSession(true)
            .getResponse();
    },
};


const NextPlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            (request.type === 'PlaybackController.NextCommandIssued' ||
                (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent'));
    },
    handle(handlerInput) {
        return controller.playNext(handlerInput);
    },
};

const PreviousPlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            (request.type === 'PlaybackController.PreviousCommandIssued' ||
                (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent'));
    },
    handle(handlerInput) {
        return controller.playPrevious(handlerInput);
    },
};

const PausePlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.StopIntent' ||
                request.intent.name === 'AMAZON.CancelIntent' ||
                request.intent.name === 'AMAZON.PauseIntent');
    },
    handle(handlerInput) {
        console.log('Playback stoped intent:', handlerInput.requestEnvelope.request);

        return controller.stop(handlerInput);
    },
};


const ExitHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return !playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.StopIntent' ||
                request.intent.name === 'AMAZON.CancelIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Goodbye!')
            .getResponse();
    },
};


async function getPlaybackInfo(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    console.log('PlayAudio: ', attributes.playbackInfo);
    return attributes.playbackInfo
}

const controller = {
 async play(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;

    const playbackInfo = await getPlaybackInfo(handlerInput);
    const {
      playOrder,
      offsetInMilliseconds,
      index
    } = playbackInfo;

    const playBehavior = 'REPLACE_ALL';
    const podcast = util.audioData[playOrder[index]];
    const token = playOrder[index];
    playbackInfo.nextStreamEnqueued = false;

    responseBuilder
      .speak(`Agora tocando ${podcast.title}`)
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, podcast.url, token, offsetInMilliseconds, null);

    return responseBuilder.getResponse();
 },
    stop(handlerInput) {
        console.log('Playback stoped controller :', handlerInput.requestEnvelope.request);
    
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    },
    async playNext(handlerInput) {
        const {
            playbackInfo,
            playbackSetting,
        } = await handlerInput.attributesManager.getPersistentAttributes();
    
        const nextIndex = (playbackInfo.index + 1) % util.audioData.length;
    
        if (nextIndex === 0 && !playbackSetting.loop) {
            return handlerInput.responseBuilder
                .speak('Você chegou ao final da aula. Para reproduzir assistir aula diga: tocar aula.')
                .addAudioPlayerStopDirective()
                .getResponse();
        }
    
        playbackInfo.index = nextIndex;
        playbackInfo.offsetInMilliseconds = 0;
        playbackInfo.playbackIndexChanged = true;
    
        return this.play(handlerInput);
    },
    async playPrevious(handlerInput) {
        const {
            playbackInfo,
            playbackSetting,
        } = await handlerInput.attributesManager.getPersistentAttributes();
    
        let previousIndex = playbackInfo.index - 1;
    
        if (previousIndex === -1) {
            if (playbackSetting.loop) {
                previousIndex += util.audioData.length;
            } else {
                return handlerInput.responseBuilder
                    .speak('Você chegou ao início da aula.')
                    .addAudioPlayerStopDirective()
                    .getResponse();
            }
        }
    
        playbackInfo.index = previousIndex;
        playbackInfo.offsetInMilliseconds = 0;
        playbackInfo.playbackIndexChanged = true;
    
        return this.play(handlerInput);
    },
};

function getToken(handlerInput) {
    // Extracting token received in the request.
    return handlerInput.requestEnvelope.request.token;
}

async function getIndex(handlerInput) {
    // Extracting index from the token received in the request.
    const tokenValue = parseInt(handlerInput.requestEnvelope.request.token, 10);
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();

    return attributes.playbackInfo.playOrder.indexOf(tokenValue);
}

function getOffsetInMilliseconds(handlerInput) {
    // Extracting offsetInMilliseconds received in the request.
    return handlerInput.requestEnvelope.request.offsetInMilliseconds;
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Te ajudando';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is a video app starter template.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Opa deu erro')
      .reprompt('Opa deu erro')
      .getResponse();
  },
};

function supportsDisplay(handlerInput) {
  const hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
  return hasDisplay;
}

const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

        // Check if user is invoking the skill the first time and initialize preset values
        if (!persistentAttributes.playbackInfo && !persistentAttributes.playbackSetting) {
            console.log('persistentAttributes', persistentAttributes)
            handlerInput.attributesManager.setPersistentAttributes({
                firstAccess : true,
                audioLessons : [],
                playbackSetting: {
                    loop: false,
                    shuffle: false,
                },
                playbackInfo: {
                    course_name : '',
                    playOrder: [...Array(util.audioData.length).keys()],
                    index: 0,
                    offsetInMilliseconds: 0,
                    playbackIndexChanged: true,
                    token: '',
                    nextStreamEnqueued: false,
                    inPlaybackSession: false,
                    hasPreviousPlaybackSession: false,
                    firstRun: true,
                    audioData: []
                },
            });
        }
    }
};

// If you disable the skill and reenable it the userId might change and you loose the persistent attributes saved below as userId is the primary key
const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

        console.log('persistentAttributes para salvar', persistentAttributes);

        await handlerInput.attributesManager.savePersistentAttributes();
    }
};
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayVideoIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    AudioPlayerEventHandler,
    CheckAudioInterfaceHandler,
    PausePlaybackHandler,
    NextPlaybackHandler,
    PreviousPlaybackHandler,
    ExitHandler
  )
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LoadAttributesRequestInterceptor,
        LocalisationRequestInterceptor)
    .addResponseInterceptors(
        SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
