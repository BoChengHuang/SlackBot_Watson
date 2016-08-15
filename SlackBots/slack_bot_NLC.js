var watson = require('watson-developer-cloud');
var Botkit = require('../lib/Botkit.js');
var os = require('os');
var natural_language_classifier = watson.natural_language_classifier({
  url: 'https://gateway.watsonplatform.net/natural-language-classifier/api',
  username: '<username>',
  password: '<password>',
  version: 'v1'
});
var resultData = '';
var fs = require('fs');

function classify(data) {
    natural_language_classifier.classify({
    text: data,
    classifier_id: '<classifier_id>' },
    function(err, response) {
      if (err)
        console.log('error:', err);
      else
        var result = JSON.stringify(response, null, 2);
        resultData = result;
    });
}


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}


var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['<event>'], 'direct_message,direct_mention,mention,ambient', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Ask something Q&A?', function (response, convo) {
            console.log(response.text);
            classify(response.text);
            

            setTimeout(function() {
                var jsonData = JSON.parse(resultData);
                var classesData = jsonData.classes[0].class_name;
                var confidenceData = jsonData.classes[0].confidence;

                console.log(resultData);
                convo.say(classesData + '\nConfidence Rate: ' + (confidenceData*100) + '%');
                convo.next();
            }, 1500);
        });

    });
});