var watson = require('watson-developer-cloud');
var Botkit = require('../lib/Botkit.js');
var os = require('os');
var fs = require('fs');
var qs = require('qs');
var resultData = '';

var retrieve_and_rank = watson.retrieve_and_rank({
  username: '<username>',
  password: '<password>',
  version: 'v1'
});


function rr_search(msgin) {
  
  solrClient = retrieve_and_rank.createSolrClient({
  cluster_id: '<cluster_id>',
  collection_name: '<collection_name>',
  wt: 'json'
});

  var ranker_id = '<ranker_id>';
  var question  = 'q=' + msgin;
  var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,body'});

  solrClient.get('fcselect', query, function(err, searchResponse) {
    if(err) {
      console.log('Error searching for documents: ' + err);
    }
      else {
        var result = JSON.stringify(searchResponse.response.docs, null, 2);
        resultData = result;
      }
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

        convo.ask('Ask something on CUB Q&A?', function (response, convo) {
            console.log(response.text);
            rr_search(response.text);
            

            setTimeout(function() {
                var jsonData = JSON.parse(resultData);
                console.log(jsonData);
                var body = jsonData[0].body;

                convo.say('Suggestions: ' + body);
                convo.next();
            }, 1500);
        });

    });
});