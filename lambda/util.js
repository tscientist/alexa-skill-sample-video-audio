const AWS = require('aws-sdk');
const stringSimilarity = require('string-similarity');
const got = require('got');
require('dotenv/config');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60 * 1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

async function getSessionToken(accessToken) {
    const auth0Response = await got(process.env.URL_AUTH0 + '/userinfo',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json();

    return auth0Response["https://uoledtech.com.br/new_token"]
}

async function getUserCourses(accessToken) {
    const response = await got(process.env.URL_API_EDUCA + '/users/my-courses',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json();

    const coursesNames = response.data.map((course) => {
        return course.course_name;
    })

    return { 'coursesNames': coursesNames.join(", "), 'coursesData': coursesNames.join(". "), 'coursesInfo': response.data };
}

async function getContact(accessToken) {
    const response = await got(process.env.URL_API_EDUCA + '/contact',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json();

    let contact = response.data.contact;

    let number = contact.substring(42, 50);

    let ddd = contact.substring(39, 41);

    return { 'type': response.data.type, 'number': number, 'ddd': ddd };
}

async function getProfile(accessToken) {
    const response = await got(process.env.URL_API_EDUCA + '/users/my-profile',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json();

    let profile = response.data;

    return profile;
}

async function getNotifications(accessToken) {
    const response = await got(process.env.URL_API_EDUCA + '/users/notifications',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json();

    if (response.data.length === 0) return { 'notifications': 'Você não possui novas notificações.' };

    return { 'notifications': 'Você tem uma nova notificação.' + response.data[0].title };
}

async function verifyNotifications(accessToken) {
    await got(process.env.URL_API_EDUCA + '/users/notifications/all-viewed',
        {
            headers: {
                'authorization': `Bearer ${accessToken}`
            }
        }).json()
        .then(response => {
            if (response.data.allViewed) return true;

            return false;
        })
        .catch(err => {
            console.log(err);
            return false;
        })
}

async function resetPassword(userEmail) {
    try {
        const response = await got.post(process.env.URL_API_EDUCA + '/recovery-password', {
            json: {
                'email': userEmail
            },
            responseType: 'json',
        });
        return response.body;
    } catch (error) {
        console.log(error.response.body);   
        return error
    }
}

const audioData = [
    {
        title: 'Aula 40 - Parte 1',
        url: 'https://educa.s3.amazonaws.com/pucrs/Audio/387727676.mp3',
    },
    {
        title: 'Aula 40 - Parte 2',
        url: 'https://educa.s3.amazonaws.com/pucrs/Audio/387727676.mp3',
    },
];
function listCourses(courses) {
    let coursesList = [];

    for(let i = 0; i < courses.length; i++ ) { 
        coursesList[i] = `Para o curso ${courses[i].course_name}<break time="200ms"/>, diga ${i + 1}`;
    }
                   
    return coursesList.join(", ");
}

async function getDisciplines(course_id, accessToken) {
    const disciplines = await got(process.env.URL_API_EDUCA + '/courses/' + course_id + '/sections',
    {
        headers: {
            'authorization': `Bearer ${accessToken}`
        }
    }).json();

    let disciplineList = [];

    for (let i = 0; i < disciplines.data.length; i++ ) { 
        disciplineList[i] = `Para a disciplina ${disciplines.data[i].description}<break time="200ms"/>, diga ${i + 1}`;
    }
        
    return { 'disciplinesInfo': disciplines.data, 'disciplinesNames': disciplineList.join(", ")};
}

async function getLessons (discipline_id, accessToken) {
    const lessons = await got(process.env.URL_API_EDUCA + '/sections/' + discipline_id + '/lessons',
    {
        headers: {
            'authorization': `Bearer ${accessToken}`
        }
    }).json();

    let disciplineList = [];

    if (lessons.data) {
        return lessons.data;
    } else {
        return null
    } 
}

function formatLessonsJson(lessons) {
    let array = [];

    for (let i = 0; i < lessons.portions.length; i++) {
        let x = {
            'title': lessons.portions[i].description,
            'url': lessons.portions[i].medias.url_audio
        }
        array.push(x);
    }
    
    return array;
}

module.exports = {
    getS3PreSignedUrl,
    getSessionToken,
    getUserCourses,
    getContact,
    getProfile,
    getNotifications,
    verifyNotifications,
    resetPassword,
    audioData,
    listCourses,
    getDisciplines,
    getLessons,
    formatLessonsJson
}