const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const moment = require("moment");
const request = require("request");
const cors = require("cors");
moment.locale("th");
const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.all("/", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, PATCH, POST, DELETE, OPTIONS"
    );
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

const BASE_PATH = 'http://api.reh.go.th:9000'
// const BASE_PATH = 'http://192.168.77.207:8001'
const KEY_API = "8OXo1lEsX-1W5BFoL4LMZJdyOnPUStiwOE_2FRvzp6A"

app.get("/", cors(), function (req, res) {
    res.status(200).json({
        status: 200,
        msg: "ok"
    });
});



app.post("/body", cors(), function (req, res) {
    let userId = "";
    if (req.body.events[0].source.groupId != undefined) {
        userId = req.body.events[0].source.groupId;
    } else {
        userId = req.body.events[0].source.userId;
    }

    let formatMessage = {
        type: "text",
        text: JSON.stringify(req.body),
    };
    reply(userId, formatMessage);
    res.sendStatus(200);
});

app.post("/webhook", cors(), function (req, res) {
    const toTwoDigits = (num) => (num < 10 ? "0" + num : num);
    let today = new Date();
    let year = today.getFullYear();
    let month = toTwoDigits(today.getMonth() + 1);
    let day = toTwoDigits(today.getDate());
    let date_now = `${year}-${month}-${day}`;
    let Months = formateDateTH(date_now, 1);
    let userId = "";
    let userMessage = req.body.events[0].message.text;
    let subString = userMessage.split(",");
    if (req.body.events[0].source.groupId != undefined) {
        userId = req.body.events[0].source.groupId;
    } else {
        userId = req.body.events[0].source.userId;
    }

    if (subString.length === 2) {
        if (subString[0].trim() === "เวรบ่าย" || subString[0].trim() === "บ่าย") {
            let nameUser = subString[1].trim();
            let URL = `${BASE_PATH}/ot/getOTbyName?token=${KEY_API}&nameComcenter=${nameUser}`
            const header = {
                "Content-Type": "application/json",
            };
            axios
                .get(URL, { headers: header })
                .then((resp) => {
                    let data = resp.data.data;
                    let fullnameUser = data[0].name_comcenter;
                    let listDate = [
                        {
                            type: "text",
                            text: Months,
                            size: "md",
                            weight: "bold",
                        },
                    ];
                    data.forEach((val) => {
                        let chkToday = val.date_time === date_now ? "วันนี้" : "     ";
                        let chkColor = val.status_ot === 1 ? "#28b463" : "#F33B3B";
                        listDate.push({
                            type: "text",
                            text: "วันที่ ",
                            margin: "10px",
                            contents: [
                                {
                                    type: "span",
                                    text: "" + chkToday,
                                    size: "16px",
                                    color: "#28b463",
                                },
                                {
                                    type: "span",
                                    text: " " + formateDateTH(val.date_time, 2),
                                    size: "18px",
                                },
                                {
                                    type: "span",
                                    text: " " + val.st_ot,
                                    size: "18px",
                                    color: "" + chkColor,
                                },
                            ],
                        });
                    });
                    let formatMessage = {
                        type: "flex",
                        altText: "เวรบ่ายศูนย์คอมพิวเตอร์ ",
                        contents: {
                            type: "bubble",
                            styles: {
                                header: {
                                    backgroundColor: "#0367D3",
                                },
                            },
                            header: {
                                type: "box",
                                layout: "baseline",
                                contents: [
                                    {
                                        type: "text",
                                        text: "" + fullnameUser,
                                        weight: "bold",
                                        color: "#FFFFFF",
                                        size: "xl",
                                        flex: 1,
                                    },
                                ],
                            },
                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: listDate,
                            },
                        },
                    };
                    //   console.log(formatMessage);
                    reply(userId, formatMessage);
                    res.status(200).json({ msg: "ok" });
                })
                .catch((error) => console.log("Error :", error));
        }
    }
    if (userMessage == "เวรบ่าย" || userMessage == "บ่าย") {
        let URL = `${BASE_PATH}/ot/getOTtoDay?token=${KEY_API}`
        const header = {
            "Content-Type": "application/json",
        };
        axios
            .get(URL, { headers: header })
            .then((resp) => {
                let admin = [];
                let tech = [];
                let data = resp.data;
                data.data.forEach((element) => {
                    admin.push(element.nameAdmin, element.date_time);
                    tech.push(element.nameTech, element.date_time);
                });
                let Tomorrow = typeof admin[2] === "undefined" ? "-" : admin[2];
                let adminTomorrow = typeof admin[3] === "undefined" ? "-" : admin[3];
                let techTomorrow = typeof tech[2] === "undefined" ? "-" : tech[2];
                let formatMessage = {
                    type: "flex",
                    altText: "เวรบ่ายศูนย์คอมพิวเตอร์ ",
                    contents: {
                        type: "bubble",
                        size: "mega",
                        header: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "เวรบ่ายศูนย์คอมพิวเตอร์ ",
                                            color: "#ffffff",
                                            size: "xl",
                                            flex: 1,
                                            weight: "bold",
                                        },
                                    ],
                                },
                            ],
                            paddingAll: "20px",
                            backgroundColor: "#0367D3",
                            spacing: "md",
                            paddingTop: "22px",
                        },
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: Months,
                                    size: "md",
                                    weight: "bold",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "วันนี้",
                                            size: "sm",
                                            color: "#8c8c8c",
                                            gravity: "center",
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                                {
                                                    type: "box",
                                                    layout: "vertical",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    cornerRadius: "30px",
                                                    height: "12px",
                                                    width: "12px",
                                                    borderColor: "#EF454D",
                                                    borderWidth: "2px",
                                                },
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 0,
                                        },
                                        {
                                            type: "text",
                                            text: admin[0],
                                            gravity: "center",
                                            flex: 4,
                                            size: "md",
                                            weight: "bold",
                                        },
                                    ],
                                    spacing: "lg",
                                    cornerRadius: "30px",
                                    margin: "xl",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 1,
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "box",
                                                    layout: "horizontal",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                        {
                                                            type: "box",
                                                            layout: "vertical",
                                                            contents: [
                                                                {
                                                                    type: "filler",
                                                                },
                                                            ],
                                                            width: "2px",
                                                            backgroundColor: "#B7B7B7",
                                                        },
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    flex: 1,
                                                },
                                            ],
                                            width: "12px",
                                        },
                                        {
                                            type: "text",
                                            text: "ผู้ดูแลระบบและช่างเทคนิค",
                                            gravity: "center",
                                            flex: 4,
                                            size: "sm",
                                            color: "#8c8c8c",
                                        },
                                    ],
                                    spacing: "lg",
                                    height: "40px",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "" + admin[1] + "",
                                            size: "sm",
                                            color: "#8c8c8c",
                                            gravity: "center",
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                                {
                                                    type: "box",
                                                    layout: "vertical",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    cornerRadius: "30px",
                                                    width: "12px",
                                                    height: "12px",
                                                    borderWidth: "2px",
                                                    borderColor: "#6486E3",
                                                },
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 0,
                                        },
                                        {
                                            type: "text",
                                            text: tech[0],
                                            gravity: "center",
                                            flex: 4,
                                            size: "md",
                                            weight: "bold",
                                        },
                                    ],
                                    spacing: "lg",
                                    cornerRadius: "30px",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "พรุ่งนี้",
                                            size: "sm",
                                            color: "#8c8c8c",
                                            gravity: "center",
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                                {
                                                    type: "box",
                                                    layout: "vertical",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    cornerRadius: "30px",
                                                    width: "12px",
                                                    height: "12px",
                                                    borderWidth: "2px",
                                                    borderColor: "#EF454D",
                                                },
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 0,
                                        },
                                        {
                                            type: "text",
                                            text: Tomorrow,
                                            gravity: "center",
                                            flex: 4,
                                            size: "md",
                                            weight: "bold",
                                        },
                                    ],
                                    spacing: "lg",
                                    cornerRadius: "30px",
                                    margin: "xl",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 1,
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "box",
                                                    layout: "horizontal",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                        {
                                                            type: "box",
                                                            layout: "vertical",
                                                            contents: [
                                                                {
                                                                    type: "filler",
                                                                },
                                                            ],
                                                            width: "2px",
                                                            backgroundColor: "#B7B7B7",
                                                        },
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    flex: 1,
                                                },
                                            ],
                                            width: "12px",
                                        },
                                        {
                                            type: "text",
                                            text: "ผู้ดูแลระบบและช่างเทคนิค",
                                            gravity: "center",
                                            flex: 4,
                                            size: "sm",
                                            color: "#8c8c8c",
                                        },
                                    ],
                                    spacing: "lg",
                                    height: "40px",
                                },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "" + adminTomorrow + "",
                                            size: "sm",
                                            color: "#8c8c8c",
                                            gravity: "center",
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "filler",
                                                },
                                                {
                                                    type: "box",
                                                    layout: "vertical",
                                                    contents: [
                                                        {
                                                            type: "filler",
                                                        },
                                                    ],
                                                    cornerRadius: "30px",
                                                    width: "12px",
                                                    height: "12px",
                                                    borderWidth: "2px",
                                                    borderColor: "#6486E3",
                                                },
                                                {
                                                    type: "filler",
                                                },
                                            ],
                                            flex: 0,
                                        },
                                        {
                                            type: "text",
                                            text: "" + techTomorrow + "",
                                            gravity: "center",
                                            flex: 4,
                                            size: "md",
                                            weight: "bold",
                                        },
                                    ],
                                    spacing: "lg",
                                    cornerRadius: "30px",
                                },
                            ],
                        },
                        footer: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "button",
                                    style: "link",
                                    action: {
                                        type: "uri",
                                        label: "ดูเพิ่มเติม",
                                        uri: "https://reh.go.th/views-ot/",
                                    },
                                },
                            ],
                        },
                    },
                };
                reply(userId, formatMessage);
                res.sendStatus(200);
            })
            .catch((error) => console.log("Error :", error));
    }
});

function formateDateTH(dateTime, style) {
    let date = dateTime.split("-");
    let day = parseInt(date[2]);
    let month = parseInt(date[1]);
    let strMonthCut = [
      "",
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    let year = parseInt(date[0]) + 543;
  
    let createdDate =
      style === 1
        ? strMonthCut[month] + " " + year
        : day + " " + strMonthCut[month] + " " + year;
    //console.log(createdDate);
    return createdDate;
  }

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
