const dotenv = require('dotenv');

const axios = require('axios');

const momemnt = require('moment');

const baseURL = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=";
const historicalDataLimit = "&tsym=USD&limit=2000&aggregate=3&e=CCCAGG";
dotenv.config();



interface CryptoPrice {
    time: number,
    open: number
}


interface CryptoCompare {
    Data: {
        Data: Array<CryptoPrice>
    }
}

const AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

//Create new DocumentClient
let docClient = new AWS.DynamoDB.DocumentClient();


export async function downloadData(currency: string) {
    let axiosData = await axios.get( baseURL +
        currency + historicalDataLimit);

    let cryptoArray: Array<CryptoPrice> = axiosData.data.Data.Data;

    console.log(cryptoArray);

    let cryptArray: Array<CryptoData> = [];
    cryptoArray.forEach(data => {

        cryptArray.push({timestamp: data.time, price: data.open});
    });

    //Calling the 'storeData' function to store my data.
    storeData(currency, cryptArray);

}

//A function that adds the pulled data to my database.
async function storeData(currency: string, cryptoArray: Array<CryptoData>) {
    cryptoArray.forEach(async cryptDatItem => {
        console.log("currency: " + currency + "; time: " + cryptDatItem.timestamp + "; price " + cryptDatItem.price)
        try {
            //Create params for my table to hold
            let params = {
                TableName: "CryptoChecker",
                Item: {
                    "price": cryptDatItem.price,
                    "currency": currency,
                    "time": cryptDatItem.timestamp
                }
            };

            await docClient.put(params).promise();
        } catch (err) {
            console.error(err);
        }


    });

}

interface CryptoData {
    timestamp: number,
    price: number
}

//Five cryptos
downloadData("BTC");//Bitcon
downloadData("ETH");//Ethereum
downloadData("XRP");//XRP
downloadData("BCH");//Bitcoin Cash
downloadData("EOS");//EOS
