let AWS = require("aws-sdk");

//Create instance of Comprehend
let comprehend = new AWS.Comprehend();

function analyseSentiment(tweets) {
    for (let record of tweets.Records.Record) {
        let tweet = record.dynamodb.NewImage.text;
        let tweetId = record.dynamodb.NewImage.id.N;
        let currency = record.dynamodb.NewImage.currency.S;
        let sentimentTS = Math.round((new Date()).getTime() / 1000);

//Parameters for call to AWS Comprehend
        let params = {
            LanguageCode: "en",//Possible values include: "en", "es", "fr", "de", "it", "pt"
            Text: tweet
        };

        let result = comprehend.detectSentiment(params).promise();
        console.log(JSON.stringify(result));
    }
}



//Function that will be called
exports.handler = (event) => {
    console.log(event.Records);
   analyseSentiment(event.Records)
};