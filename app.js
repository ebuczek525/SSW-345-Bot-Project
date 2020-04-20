var express = require('express');
var request = require('request');

var clientId = '1057370358868.1070775925077';
var clientSecret = '8b70616e59ebc57bd03d6a005962731e';

var app = express();

const PORT=3000;

app.listen(PORT, function () {
    console.log("We've now got a server!");
    console.log("App running on port " + PORT);
});

app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

// app.get('/oauth', function(req, res) {
//     if (!req.query.code) {
//         res.status(500);
//         res.send({"Error": "Looks like we're not getting code."});
//         console.log("Looks like we're not getting code.");
//     } else {

//         request({
//             url: 'https://slack.com/api/oauth.access',
//             qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret},
//             method: 'GET',

//         }, function (error, response, body) {
//             if (error) {
//                 console.log(error);
//             } else {
//                 res.json(body);

//             }
//         })
//     }
// });

app.post('/myprod', function(req, res) {

    user_name = 'Erik';
    goal = '10 pts/Week';
    task_avg = '5 points'
    task_list = 'BOT-1';
    pace = '5 pts/Week';

    res.send({

        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":muscle: Hey " + user_name + "! Please see your productivity goal below! :muscle:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Current Goal:*\n" + goal
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Average Task Value:*\n" + task_avg
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Available Tasks:*\n" + task_list
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Suggested Pace:*\n" + pace
                }
            }
        ]
    });
});