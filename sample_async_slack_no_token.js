'use strict'
const axios = require('axios');
const { clearInterval } = require('timers');
//
const Slack = require('slack')
//
function sendSlackMessage(message,price_diff) { 
  const slackInstance = new Slack()
  let SLACK_BOT_TOKEN = 'xoxb-xxxxxxxxxx';
  slackInstance.chat.postMessage({
    token: SLACK_BOT_TOKEN,
    channel: 'arbitrage',   // 今回は、caica_researchのarbitrageチャンネルにメッセージを送ります
    text: `message : ${message} price_diff=${price_diff}` // メッセージ
  }).then(() => {
        console.log(message,price_diff);
  })
}
//
const URLCH = 'https://coincheck.com/api/ticker';
const URLBF = 'https://api.bitflyer.com/v1/ticker';
const key_ch = 'last';
const key_bf = 'ltp';
//
var w_coin,w_bitf,w_comp = 0;
// リアルタイム表示間隔（ミリ秒）
//var Interval = 1000; //1秒間隔
var Interval = 1000*5; //5秒間隔
//
var timerid = setInterval(async () => {
    try {
//
        let now = new Date();
        let coincheck = await axios.get(URLCH);
        w_coin = coincheck.data[key_ch]
        let bitflyer = await axios.get(URLBF);
        w_bitf = bitflyer.data[key_bf];
        w_comp = w_coin - w_bitf;
//
        console.log(now.toLocaleString(), w_coin, w_bitf, w_comp);
//coincheckとbitflyerの最終取引価格差が1000以上離れたらslackにメッセージが送信されます。
        if (w_comp > 1000 || w_comp < -1000){
            sendSlackMessage('価格差=',w_comp);
            clearInterval(timerid);
        }
//
    } catch(error) {
        console.error(error.message);
        // 繰り返しタイマーリセット
        clearInterval(timerid);
    }
}, Interval);