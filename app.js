var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var JiraClient = require("jira-connector");

var clientId = '1057370358868.1070775925077';
var clientSecret = '8b70616e59ebc57bd03d6a005962731e';

var app = express();

app.use(bodyParser.json({limit: '256mb'}));
app.use(bodyParser.urlencoded({extended: true}));

const PORT=3000;

app.listen(PORT, function () {
    console.log("We've now got a server!");
    console.log("App running on port " + PORT);
});

var jira = new JiraClient({
    host: "jenjinstudios.atlassian.net",
    basic_auth: {
      email: "ebuczek@stevens.edu",
      api_token: "zEcjUpuhfLMkEcb1iHYvA47A"
    }
});

app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

app.get('/jira', async function(req, res) {
    const issue = await jira.issue.getIssue({ issueKey: "BOT-1" });
    res.send(issue);
});

app.get('/oauth', function(req, res) {
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {

        request({
            url: 'https://slack.com/api/oauth.access',
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret},
            method: 'GET',

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);

            }
        })
    }
});

app.post('/myprod', function(req, res) {

    console.log(req.body);
    
    user_name = req.body.user_name;
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

app.post('/reminder', function(req, res) {

    console.log(req.body);

    user_name = req.body.user_name;
    link = 'https://stevens-345-bot.atlassian.net/secure/RapidBoard.jspa?rapidView=1&modal=detail&selectedIssue=BOT-1';
    story_points = '5'
    due_date = '1 week';

    res.send({

        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":male-construction-worker: :female-construction-worker: Hey " + user_name + "! Don't you have a Jira task to do? :female-construction-worker: :male-construction-worker:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Task:*\n<" + link + ">"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Story Points:*\n" + story_points
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Due Date:*\n" + due_date
                }
            }
        ]
    });
});

app.post('/complete', function(req, res) {

    console.log(req.body);

    user_name = req.body.user_name;
    link = 'https://stevens-345-bot.atlassian.net/secure/RapidBoard.jspa?rapidView=1&modal=detail&selectedIssue=BOT-1';
    user_points = '10'
    goal_progress = '5/10 points';

    res.send({

        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": ":confetti_ball: Hey " + user_name + "! Congrats on completing a Jira task! :confetti_ball:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Task:*\n<" + link + ">"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Current User Points:*\n" + user_points + " (+5)"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Productivity Goal Progress:*\n" + goal_progress
                }
            }
        ]
    });
});
