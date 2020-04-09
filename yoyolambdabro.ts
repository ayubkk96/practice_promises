let AWSs = require("aws-sdk");

//Create new DocumentClient
let docClientVariableee = new AWS.DynamoDB.DocumentClient();

let stringifyData = (data) => {
    let dataStr = JSON.stringify(data, (key, value) => {
        if(value === 'bigint')
            return value.toString();
        else
            return value; // return everything else unchanged
    });
    return dataStr;
};

//Output the result
let promiseArray: Array< Promise<string> > = [];

//Save data function algorithm, that saves the tweets into my AWS Dynamo DB database
function saveDataa(tweetId: number, tweetText: string, tweetCreatedAt: number) : Promise<string> {
    let params = {
        TableName: "SentimentTwitter",
        Item: {
            id: tweetId,
            text: tweetText,
            SentimentAt: tweetCreatedAt,
            Currency: "",
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

//Go through event.Records and for each tweet object, conduct a sentiment analysis
async function analyseSentiment(tweets) {
    try {
        console.log(stringifyData(tweets));
        tweets.forEach(tweet => {

            let sentiParams = {
                LanguageCode: 'en',
                Text: tweet.dynamodb.NewImage.text.S
            }
            //Call comprehend to detect sentiment of text
            comprehend.detectSentiment(sentiParams, (err, tweets) => {
                //Log result or error
                if (err) {
                    console.log("\nError with call to Comprehend:\n" + JSON.stringify(err));
                } else {
                    //Print the sentiment analysis of each tweet
                    console.log("\nSuccessful call to Comprehend:\n" + stringifyData(tweets));

                    //Store that sentiment analysis as a number in my table
                    console.log("This is the sentiment analysis number inside: " + stringifyData(tweets.Sentiment))
                    let sentiTs = Math.round((new Date()).getTime() / 1000);


                    promiseArray.push(saveDataa(tweet.dynamodb.NewImage.id, tweets.Sentiment, sentiTs));


                }
            });
        });
        //Execute all of the save data promises
        let databaseResult: Array<string> = await Promise.all(promiseArray);
        console.log("Database result: " + JSON.stringify(databaseResult));
    } catch (error) {
        console.log(JSON.stringify(error));

    }
}

//Create instance of Comprehend
    let comprehendd = new AWSs.Comprehend();


//Function that will be called
    exports.handler = (event) => {


        console.log(stringifyData(event));

        analyseSentiment(event.Records)

    };
