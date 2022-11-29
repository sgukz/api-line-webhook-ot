const express = require("express");
const bodyParser = require("body-parser");
// const axios = require("axios");
const moment = require("moment");
const request = require("request");
moment.locale("th");
const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.status(200).json({
        status: 200,
        msg: "ok"
    });
});


app.post("/body", function (req, res) {
    let userId = "U0ce66a9d268b3f1d81d04b30631acc87";
    // if (req.body.events[0].source.groupId != undefined) {
    //     userId = req.body.events[0].source.groupId;
    // } else {
    //     userId = req.body.events[0].source.userId;
    // }

    let formatMessage = {
        type: "text",
        text: JSON.stringify(req.body),
    };
    reply(userId, formatMessage);
    res.sendStatus(200);
});

function reply(userId, formatMessage) {
    let headers = {
        "Content-Type": "application/json",
        Authorization:
            "Bearer {5cq1A8h1FPtIL92Bm8/QSvhR9R1Lw5x/u7aAmI0MUEFnQa9aRTmbAb25X/1YL1p/hRidBLAcqYF53LDWrqi/aNpSM8brObimFH/n3qh4PcXoiaZtnaiip5rIfXnWywayJZOYfF8W2AKdVsvnNiQlAQdB04t89/1O/w1cDnyilFU=}", // Channel access token
    };
    let body = JSON.stringify({
        to: userId,
        messages: [formatMessage],
    });
    request.post(
        {
            url: "https://api.line.me/v2/bot/message/push",
            headers: headers,
            body: body,
        },
        (err, res, body) => {
            console.log("status = " + res.statusCode);
        }
    );
}
app.listen(process.env.PORT || 8000, function () {
    console.log("Server up and listening");
});
