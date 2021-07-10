const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');
const Bugsnag = require('@bugsnag/js');

const { MONGO_DB_NAME, MONGO_DB_COLLECTION, MONGO_DB_URL } = process.env;

exports.initMongoDb = async (mongoDbUrl) => {
  const dbClient = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((mongoClient) => mongoClient.db(MONGO_DB_NAME))
    .catch((error) => {
      console.error(error);
      Bugsnag.notify(error);
    });
  return dbClient;
};

exports.shortenURL = async (url) => {
  const dbClient = await exports.initMongoDb(MONGO_DB_URL);
  const shortenedLinks = dbClient.collection(MONGO_DB_COLLECTION);
  return shortenedLinks.findOneAndUpdate(
    { original_url: url },
    {
      $setOnInsert: {
        original_url: url,
        short_id: nanoid(7),
      },
    },
    {
      returnDocument: false,
      upsert: true,
    },
  );
};

exports.checkIfShortIdExists = async (dbClient, shortId) => {
  const result = await dbClient
    .collection(MONGO_DB_COLLECTION)
    .findOne({ short_id: shortId });
  return result;
};
