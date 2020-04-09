const AWSVariablee = require("aws-sdk");


//Create new DocumentClient
let docClientVariablee = new AWSVariablee.DynamoDB.DocumentClient();


//Create instance of Comprehend
let comprehend = new AWSVariablee.Comprehend();

const sentiTS = Math.round((new Date()).getTime() / 1000);

//Function that will be called
exports.handler = (event) => {

    loopThroughTweets(event.Records);

    function loopThroughTweets(records) {
    records.forEach(record =>{

//Parameters for call to AWS Comprehend
        let params = {
            LanguageCode: "en",//Possible values include: "en", "es", "fr", "de", "it", "pt"
            Text: record.dynamodb.NewImage.tweet
        };
        //Call comprehend to detect sentiment of text
        comprehend.detectSentiment(params, (err, data) => {
            //Log result or error
            if (err) {
                console.log("\nError with call to Comprehend:\n" + JSON.stringify(err));
            } else {
                console.log("\nSuccessful call to Comprehend:\n" + JSON.stringify(data));
                let sentiTs = Math.round((new Date()).getTime() / 1000);
                let sentimentParams = {
                    TableName: "TweetSentiment",
                    Item: {
                        id: record.dynamodb.NewImage.tweetId,
                        tweet: record.dynamodb.NewImage.tweet,
                        SentimentAt: sentiTs,
                        Currency: record.dynamodb.NewImage.currency,
                    }
                };
                docClientVariablee.put(sentimentParams)
            }

        });
    })
}
};