'use strict'

const axios = require('axios');
const {Parser} = require('json2csv');

const BASEURL = 'https://api.bitflyer.com';
const PATH = '/v1/getboard';
const METHOD = 'GET';
//
const fields =['price', 'size'];
const opts = {fields, header: false};
const parser = new Parser(opts);
//
var params = {
    product_code: "BTC_JPY",
};
// 
// --- function getData --
async function getData(params,json_csv_swtch) {
        // API CALL
    let res = await axios({
        method: METHOD,
        baseURL: BASEURL,
        url: PATH,
        params: params
    });
    // JSON -> CSV
    let bid0 = res.data['bids'][0];
    for (let i = 0; i < 10; i++){
        if (json_csv_swtch == 'csv'){
            let bid = parser.parse(res.data['bids'][i]);
            console.log('bid', bid);    
        } else{
            let bid = res.data['bids'][i];
            console.log('bid', bid);    
        }
    }
//
    let mid = res.data['mid_price'];
    console.log('mid', mid);
//
    let ask0 = res.data['asks'][0];
    for (let i = 0; i < 10; i++){
        if (json_csv_swtch == 'csv'){
            let ask = parser.parse(res.data['asks'][i]);
            console.log('ask', ask);
        } else{
            let ask = res.data['asks'][i];
            console.log('ask', ask);    
        }
    }
//
    return { 
        price: ask0.price,
        size: ask0.size
    };
}
//
(async () => {
//
    let res = await getData(params,'csv');
    console.log('best_ask=',res);
//
})();
