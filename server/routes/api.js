"use strict";
var express = require("express");
var router = express.Router();
var request = require("request");

var db = require("../db");

router.use("/latestPrice", function(req, res) {
  request(
    "https://api.jdjygold.com/gw/generic/hj/h5/m/latestPrice?reqData={}",
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);
        var resultData = data.resultData.datas;
        var time = new Date(parseInt(resultData.time));
        // #如需写入数据库中记录，解除注释，记得修改db.js中的数据库连接信息
        // db.query(
        //   "select * from history order by id desc limit 1",
        //   time,
        //   function(err, rows) {
        //     if (
        //       !err &&
        //       (rows.length == 0 || rows[0].Price != resultData.price)
        //     ) {
        //       db.query(
        //         "insert into history (Time,Price,PriceNum) values (?,?,?)",
        //         [time, resultData.price, resultData.priceNum]
        //       );
        //     }
            res.contentType("application/json");
            res.send(body);
        //   }
        // );
      } else {
        res.end();
      }
    }
  );
});

router.use("/historyPrices", function(req, res) {
  request(
    "https://api.jdjygold.com/gw/generic/hj/h5/m/historyPrices?reqData=%7B%22period%22:%22" +
      req.query.type +
      "%22%7D",
    {},
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.contentType("application/json");
        res.send(body);
      } else {
        res.end();
      }
    }
  );
});
router.use("/send", function(req, res) {
  //发送短信，sms.js中要修改
  require("../sms").send(req.query.m, [req.query.n], function(err, response) {
    if (err) {
      console.log(response.to_json_string());
      res.json(false);
      return;
    }
    console.log(response.to_json_string());
    res.contentType("application/json");
    res.send(response);
  });
});
router.use("/todayPrices", function(req, res) {
  request("https://api.jdjygold.com/gw/generic/hj/h5/m/todayPrices", function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      res.contentType("application/json");
      res.send(body);
    } else {
      res.end();
    }
  });
});

module.exports = router;
