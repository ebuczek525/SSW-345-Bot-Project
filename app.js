var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var JiraClient = require("jira-connector");
const database = require('./database.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

database.connect("users", (success) => {
    if (success) {
        console.log("=Database Connected");
    } else {
        console.log("Database Connection Failed")
    }
})

const userSchema = new mongoose.Schema({
    username: String,
    goal: Number,
    current_points: Number
});

const user = mongoose.model('users', userSchema);

var clientId = '1057370358868.1070775925077';
var clientSecret = '8b70616e59ebc57bd03d6a005962731e';

var app = express();

app.use(bodyParser.json({
    limit: '256mb'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const PORT = 3000;

app.listen(PORT, function () {
    console.log("We've now got a server!");
    console.log("App running on port " + PORT);
});

var jira = new JiraClient({
    host: "stevens-345-bot.atlassian.net",
    basic_auth: {
        email: "ebuczek@stevens.edu",
        api_token: "zEcjUpuhfLMkEcb1iHYvA47A"
    }
});

app.get('/', function (req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

app.get('/jira', async function (req, res) {
    //const issue = await jira.issue.getIssue({ issueKey: 'BOT-1' });
    const board = await jira.board.getIssuesForBoard({
        boardId: "1"
    })
    res.send(board);
});

app.get('/oauth', function (req, res) {
    if (!req.query.code) {
        res.status(500);
        res.send({
            "Error": "Looks like we're not getting code."
        });
        console.log("Looks like we're not getting code.");
    } else {

        request({
            url: 'https://slack.com/api/oauth.access',
            qs: {
                code: req.query.code,
                client_id: clientId,
                client_secret: clientSecret
            },
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

app.post('/setgoal', async function (req, res) {

    console.log(req.body.user_name);
    console.log(req.body.text);

    const sentData = new user({
        username: req.body.user_name,
        goal: req.body.text,
        current_points: 0
    });

    console.log('got to post');

    sentData.save()
        .then((item) => {
            console.log('test saved to database');
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log('errored out');
            res.status(400);
            res.send('got here db');
        });
    console.log('Bottom of server post');

    res.send({

        "blocks": [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":muscle: Hey " + req.body.user_name + "! Your goal has been set! :muscle:"
            }
        }]
    });
});

app.post('/myprod', async function (req, res) {

    console.log(req.body);

    user_name = req.body.user_name;
    goal = JSON.stringify(await user.findOne({
        username: user_name
    }, 'goal', function (err, user) {})).split('"goal":')[1].replace('}', '');

    const task_list = await jira.board.getIssuesForBacklog({
        boardId: 1
    });

    test1 = Object.values(task_list);
    test2 = Object.values(test1)[4];

    let availTasks = [];
    let availStoryPoints = [];

    let userTasks = [];
    let userStoryPoints = [];

    for (i = 0; i < test2.length; i++) {

        values = Object.values(test2)[i];
        fields = Object.values(values)[4];
        taskName = ' ' + Object.values(fields)[48];
        sPoints = ' ' + fields.customfield_10026 + ' points';
        console.log(fields.assignee);
        assignee = (fields.assignee != null || fields.assignee != undefined ? JSON.stringify(fields.assignee.emailAddress).replace(/"/g, '').replace('@stevens.edu', '') : null);

        console.log("Assignee: " + assignee);
        console.log("Username: " + user_name);

        if (assignee === user_name) {
            userTasks.push(taskName);
            userStoryPoints.push(sPoints);
        } else if (assignee === null) {
            availTasks.push(taskName);
            availStoryPoints.push(sPoints);
        }

        var available = availTasks.map((e, i) => `${e}:${availStoryPoints[i]}`);
        var assigned = userTasks.map((e, i) => `${e}:${userStoryPoints[i]}`);
    }

    availResult = JSON.stringify(available).replace(/"/g, '').replace('[', ' ').replace(']', ' ');
    userResult = JSON.stringify(assigned).replace(/"/g, '').replace('[', ' ').replace(']', ' ');

    res.send({

        "blocks": [{
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
                    "text": "*Your Assigned Tasks:*\n" + userResult
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Available Tasks:*\n" + availResult
                }
            }
        ]
    });
});

app.post('/reminder', async function (req, res) {

    console.log(req.body);

    issue_id = req.body.text;

    const issue = await jira.issue.getIssue({
        issueKey: issue_id
    });

    user_name = req.body.user_name;
    task_name = issue.fields.summary;
    link = 'https://stevens-345-bot.atlassian.net/secure/RapidBoard.jspa?rapidView=1&view=planning&selectedIssue=' + issue_id;
    story_points = issue.fields.customfield_10026;
    due_date = issue.fields.duedate;

    res.send({

        "blocks": [{
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
                    "text": "*Task:*\n" + task_name + "\n<" + link + ">"
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

app.post('/complete', async function (req, res) {

    console.log(req.body);

    issue_id = req.body.text;

    const issue = await jira.issue.getIssue({
        issueKey: issue_id
    });

    user_name = req.body.user_name;
    task_name = issue.fields.summary;
    link = 'https://stevens-345-bot.atlassian.net/secure/RapidBoard.jspa?rapidView=1&view=planning&selectedIssue=' + issue_id;
    user_points = parseInt(JSON.stringify(await user.findOne({
        username: user_name
    }, 'current_points', function (err, user) {})).split('"current_points":')[1].replace('}', '')) + parseInt(issue.fields.customfield_10026);
    user.findOneAndUpdate({
            username: user_name
        }, {
            current_points: user_points,
        },
        function (err, result) {
            if (err) {
                res.send(err);
                console.log(err, result);
            } else {
                console.log(err, result);
            }
        }
    );
    goal_progress = parseInt(JSON.stringify(await user.findOne({
        username: user_name
    }, 'current_points', function (err, user) {})).split('"current_points":')[1].replace('}', '')) / parseInt(JSON.stringify(await user.findOne({
        username: user_name
    }, 'goal', function (err, user) {})).split('"goal":')[1].replace('}', '')) * 100 + '%';

    res.send({

        "blocks": [{
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
                    "text": "*Task:*\n" + task_name + "\n<" + link + ">"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Current User Points:*\n" + parseInt(JSON.stringify(await user.findOne({
                        username: user_name
                    }, 'current_points', function (err, user) {})).split('"current_points":')[1].replace('}', ''))
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Delta User Points:*\n" + "+" + issue.fields.customfield_10026
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
