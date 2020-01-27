require('dotenv').config();

const bugsnag = require('@bugsnag/js');
const bugsnagExpress = require('@bugsnag/plugin-express');
const bodyParser = require('body-parser');
const dns = require('dns');
const express = require('express');
const { MongoClient } = require('mongodb');
const nanoid = require('nanoid');
const path = require('path');
const forceSsl = require('ssl-express-www');

const {
  BUGSNAG_KEY,
  MONGO_DB_COLLECTION,
  MONGO_DB_NAME,
  MONGO_DB_URL,
} = process.env;

const bugsnagClient = bugsnag(BUGSNAG_KEY);
bugsnagClient.use(bugsnagExpress);

const app = express();
const bugsnagMiddleware = bugsnagClient.getPlugin('express');

app.use(forceSsl);
app.use(bugsnagMiddleware.requestHandler);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// helper functions
const shortenURL = (dbClient, url) => {
  const shortenedLinks = dbClient.collection(MONGO_DB_COLLECTION);
  return shortenedLinks.findOneAndUpdate({ original_url: url },
    {
      $setOnInsert: {
        original_url: url,
        short_id: nanoid(7),
      },
    },
    {
      returnOriginal: false,
      upsert: true,
    });
};

const checkIfShortIdExists = async (dbClient, shortId) => {
  const result = await dbClient.collection(MONGO_DB_COLLECTION)
    .findOne({ short_id: shortId });

  return result;
};
// end helper functions

MongoClient.connect(MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    app.locals.dbClient = client.db(MONGO_DB_NAME);
  })
  .catch((error) => {
    console.error('Failed to connect to the database');
    bugsnagClient.notify(error);
  });

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');

  return res.sendFile(htmlPath);
});

// eslint-disable-next-line consistent-return
app.post('/new', (req, res) => {
  let originalUrl;
  try {
    originalUrl = new URL(req.body.link);
  } catch (error) {
    bugsnagClient.notify(error);
    return res.status(400).send({ error: 'invalid URL' });
  }

  // eslint-disable-next-line consistent-return
  dns.lookup(originalUrl.hostname, (err) => {
    if (err) {
      return res.status(404).send({ error: 'Address not found' });
    }
    const { dbClient } = req.app.locals;
    shortenURL(dbClient, originalUrl.href)
      .then((result) => {
        const doc = result.value;
        return res.json({
          original_url: doc.original_url,
          short_id: doc.short_id,
        });
      })
      .catch((error) => {
        console.error(error);
        bugsnagClient.notify(error);
      });
  });
});

app.get('/:short_id', (req, res) => {
  const shortId = req.params.short_id;
  if (shortId && shortId.length === 7) {
    const { dbClient } = req.app.locals;

    checkIfShortIdExists(dbClient, shortId)
      .then((doc) => {
        if (doc === null) {
          return res.send('Uh oh. We could not find a link at that URL');
        }
        return res.redirect(doc.original_url);
      })
      .catch((error) => {
        console.error(error);
        bugsnagClient.notify(error);
      });
  }
});

app.set('port', process.env.PORT || 3000);
app.use(bugsnagMiddleware.errorHandler);

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
