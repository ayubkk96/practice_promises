const dotenv = require('dotenv');

const axios = require('axios');

const baseURL = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=";
const historicalDataLimit = "&tsym=USD&limit=2000&aggregate=3&e=CCCAGG";

const AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


//Create new DocumentClient
let docClient = new AWS.DynamoDB.DocumentClient();

dotenv.config();


//Interfaces to define the object's data
interface FirstCryptoObject {
    time: number,
    open: number
}

interface SecondCryptoObject {
    timestamp: number,
    price: number
}

let secondArrayOfCurrencies: Array<SecondCryptoObject> = [];

async function dbPut(currency: string, cryptoArray: Array<SecondCryptoObject>) {
    cryptoArray.forEach(async cryptDatItem => {
        console.log("cryptocurrency: " + currency + "; price: " + cryptDatItem.price + "; time " + cryptDatItem.timestamp);
        try {
            //Create params for my table to hold
            let params = {
                TableName: "CryptoData",
                Item: {
                    "PriceTimeStamp": cryptDatItem.timestamp,
                    "Currency": currency,
                    "Price": cryptDatItem.price
                }
            };

            await docClient.put(params).promise();
        } catch (err) {
            console.error(err);
        }


    });

}

//Get the historical data about the current and store it into an array.
async function getHistoricalData(currency: string) {

    let dataOfCurrency = await axios.get(baseURL +
        currency + historicalDataLimit);

    //Push each pulled from the API into the array as an object, now each object will hold data about the currency at that particular
    //timestamp. I want the timestamp and price.

    let firstArrayOfCurrencies: Array<FirstCryptoObject> = dataOfCurrency.data.Data.Data;

    //A simple forEach loop to retrieve the timestamp and price from the item,
    //The elements that I want are in the Class interface I have created above.
    //I will store it into an another array of objects of those elements.
    firstArrayOfCurrencies.forEach(result => {
        secondArrayOfCurrencies.push({timestamp: result.time, price: result.open});
    });

    await dbPut(currency, secondArrayOfCurrencies)
}



getHistoricalData("BTC"); //Bitcoin
getHistoricalData("ETC"); //Ethereum classic
getHistoricalData("BCH"); //Bitcoin cash
getHistoricalData("XRP"); //XRP
getHistoricalData("DASH"); //DASH