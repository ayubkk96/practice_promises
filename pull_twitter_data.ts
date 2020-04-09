//Node Twitter library
const Twitter = require('twitter');

//Module that reads keys from .env file
const dotenvfile = require('dotenv');

const AWSVariable = require("aws-sdk");

AWSVariable.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

//Create new DocumentClient
let docClientVariable = new AWSVariable.DynamoDB.DocumentClient();

//Copy variables in file into environment variables
dotenvfile.config();

//Set up the Twitter client with the credentials
let client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


//Save data function algorithm, that saves the tweets into my AWS Dynamo DB database
function saveData(tweetId: number, tweetText: string, tweetCreatedAt: number, keyword: string) : Promise<string> {
    let params = {
        TableName: "Twitter",
        Item: {
            id: tweetId,
            text: tweetText,
            CreatedAt: tweetCreatedAt,
            Currency: keyword,
        }
    };

    //return promise to store data in DynamoDB
    return new Promise<string>((resolve, reject) => {
        docClientVariable.put(params, (err, data) => {
            if (err) {
                reject("unable to add item: " + JSON.stringify(err));
            }
            else {
                resolve("Item added to table with id: " + tweetId);
            }
        })
    });
};



//Function downloads and outputs tweet text
async function storeTweets(keyword: string){
    try{
        //Set up parameters for the search
        let searchParams = {
            q: keyword,
            count: 5,
            lang: "en"
        };

        //Wait for search to execute asynchronously
        let twitterResult = await client.get('search/tweets', searchParams);

        //Output the result
        let promiseArray: Array< Promise<string> > = [];
        twitterResult.statuses.forEach((tweet)=>{
            console.log("Tweet id: " + tweet.id + ". Tweet text: " + tweet.text + " Created at: " + tweet.created_at + "Currency: " + keyword);

            //Algorithm that converts the created_at json string that represents the time the tweet was created into unix time,
            //Could be a function...
            let tweetDate = tweet.created_at;
            let date = new Date(tweetDate);
            let unix = date.valueOf();
            let newUnix = unix/1000;

            console.log("This is the console printing out the unix time of created at: " + newUnix);

            //Store save data promise in array
            promiseArray.push(saveData(tweet.id, tweet.text, newUnix, keyword));
        });

        //Execute all of the save data promises
        let databaseResult: Array<string> = await Promise.all(promiseArray);
        console.log("Database result: " + JSON.stringify(databaseResult));
    }
    catch(error){
        console.log(JSON.stringify(error));
    }
}

//Call function to search for tweets with specified subject
//storeTweets("Bitcoin");
//storeTweets("XRP");
 storeTweets("BCH");
// storeTweets("Ethereum");
// storeTweets("DASH crypto");


/* let stringifyData = (data) => {
    let dataStr = JSON.stringify(data, (key, value) => {
        if(typeof value === 'bigint')
            return value.toString();
        else
            return value; // return everything else unchanged
    });
    return dataStr;
}
*/