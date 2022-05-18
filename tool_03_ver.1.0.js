// Research and Development 01 取引所APIについて
// ベストプライス価格差のリアルタイム表示
'use strict'
const axios = require('axios');
const { clearInterval } = require('timers');
//coincheck
const BASEURL_CC = 'https://coincheck.com';
const PATH_CC = '/api/order_books';
//bitflyer
const BASEURL_BF = 'https://api.bitflyer.com';
const PATH_BF = '/v1/getboard';
//kraken
const BASEURL_KR = 'https://api.kraken.com';
const PATH_KR = '/0/public/Depth?pair=XBTJPY';
//
const METHOD = 'GET';

var price_diff = 50000;
// リアルタイム表示間隔（ミリ秒）
//var Interval = 1000; //1秒間隔
var Interval = 1000*5; //5秒間隔
//var Interval = 1000*60; //1分間隔

// --- function bestprice(coincheck) --
async function bestPriceCC() {
    // API CALL
    let res = await axios({
        method: METHOD,
        baseURL: BASEURL_CC,
        url: PATH_CC
    })
    let price_bid = res.data['bids'][0][0];
    let amount_bid = res.data['bids'][0][1];
    let price_ask = res.data['asks'][0][0];
    let amount_ask = res.data['asks'][0][1];
    //
    return { 
        price_bid: Math.round(price_bid),
        amount_bid: Number(amount_bid),
        price_ask: Math.round(price_ask),
        amount_ask: Number(amount_ask)
    };
}
//
// --- function bestprice(bitflyer) --
async function bestPriceBF() {
        // API CALL
    let res = await axios({
        method: METHOD,
        baseURL: BASEURL_BF,
        url: PATH_BF
    });
//    
    let price_bid = res.data['bids'][0]['price'];
    let size_bid = res.data['bids'][0]['size'];
    let price_ask = res.data['asks'][0]['price'];
    let size_ask = res.data['asks'][0]['size'];
//
    return { 
        price_bid: Math.round(price_bid),
        size_bid: Number(size_bid),
        price_ask: Math.round(price_ask),
        size_ask: Number(size_ask),

    };
}
// --- function bestprice(bitflyer) --
async function bestPriceKR() {
    // API CALL
    let res = await axios({
        method: METHOD,
        baseURL: BASEURL_KR,
        url: PATH_KR
    });
    //    
    let price_bid = res.data['result']['XXBTZJPY']['bids'][0][0];
    let volume_bid = res.data['result']['XXBTZJPY']['bids'][0][1];
    let price_ask = res.data['result']['XXBTZJPY']['asks'][0][0];
    let volume_ask = res.data['result']['XXBTZJPY']['asks'][0][1];
    //
    return { 
        price_bid: Math.round(price_bid),
        volume_bid: Number(volume_bid),
        price_ask: Math.round(price_ask),
        volume_ask: Number(volume_ask),
    };
}

//The following code is the execution logic for testing
var timerid = setInterval(async () => {
    try {
//
        let now = new Date();

        let resCC = await bestPriceCC();
        let resBF = await bestPriceBF();
        let resKR = await bestPriceKR();
        var best_diff_cc_sell = resCC.price_bid - resBF.price_ask;
        var best_diff_bf_SELL = resBF.price_bid - resCC.price_ask;
//coincheck-kraken price diff        
        var best_diff_cc_sell_kr = resCC.price_bid - resKR.price_ask;
//
        if(best_diff_cc_sell > 0){
            var best_price_sell =  resCC.price_bid;
            var best_price_buy =  resBF.price_ask;
            var best_diff = best_diff_cc_sell;
        } else {
            var best_price_sell =  resBF.price_bid;
            var best_price_buy =  resCC.price_ask;
            var best_diff = best_diff_bf_SELL;
        }
//
        if(resCC.amount_bid > resBF.size_ask){
            var min_amount1 = resBF.size_ask;
        } else {
            var min_amount1 = resCC.amount_bid;
        }
        if(resBF.size_bid > resCC.amount_ask){
            var min_amount2 = resCC.amount_ask;
        } else {
            var min_amount2 = resBF.size_bid;
        }
        //kraken volume
        if(resCC.amount_bid > resKR.volume_ask){
            var min_amount3 = resKR.volume_ask;
        } else {
            var min_amount3 = resCC.amount_bid;
        }
//
        console.log(now.toLocaleString(), '/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
        console.log(now.toLocaleString(), '[best price cc_sell(bid)=', resCC.price_bid, 'bf_BUY(ask)=', resBF.price_ask, 'best_diff=',best_diff_cc_sell, 'min_amount1=', min_amount1, ']');
        console.log(now.toLocaleString(), '[best price bf_SELL(bid)=', resBF.price_bid, 'cc_buy(ask)=', resCC.price_ask, 'best_diff=',best_diff_bf_SELL, 'min_amount2=', min_amount2, ']');
        console.log(now.toLocaleString(), '            ------/_/_/coincheck(sell) - kraken(buy)_/_/_/-------');
        console.log(now.toLocaleString(), '[best price cc_sell(bid)=', resCC.price_bid, 'kr_BUY(ask)=', resKR.price_ask, 'best_diff=',best_diff_cc_sell_kr, 'min_amount3=', min_amount3, ']');

        if(best_diff > price_diff){
            console.log(now.toLocaleString(), '/_/_/_/_/_/_/_/_/ < best_sell=', best_price_sell, 'best_buy=', best_price_buy, 'price diff=',best_diff,'> /_/_/_/_/_/_/_/_/_/_/');
//            clearInterval(timerid);
        }
//
    } catch(error) {
        console.error(error.message);
        // 繰り返しタイマーリセット
        clearInterval(timerid);
    }
}, Interval);