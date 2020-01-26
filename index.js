require('dotenv').config();

const bugsnag = require('@bugsnag/js');
const bugsnagExpress = require('@bugsnag/plugin-express');
const bodyParser = require('body-parser');
const dns = require('dns');
const express = require('express');
const { MongoClient } = require('mongodb');
const nanoid = require('nanoid');
const path = require('path');

const databaseUrl = process.env.MONGO_DB_URL;

const bugsnagClient = bugsnag(process.env.BUGSNAG_KEY);
bugsnagClient.use(bugsnagExpress);

const app = express();
const bugsnagMiddleware = bugsnagClient.getPlugin('express');

app.use(bugsnagMiddleware.requestHandler);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

MongoClient.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    app.locals.db = client.db('big-red-link');
  })
  .catch((error) => {
    console.error('Failed to connect to the database');
    bugsnagClient.notify(error);
  });

const shortenURL = (db, url) => {
  const shortenedLinks = db.collection('shortenedLinks');
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

const checkIfShortIdExists = async (db, code) => {
  const result = await db.collection('shortenedLinks')
    .findOne({ short_id: code });

  return result;
};

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');

  return res.sendFile(htmlPath);
});

// eslint-disable-next-line consistent-return
app.post('/new', (req, res) => {
  let originalUrl;
  try {
    originalUrl = new URL(req.body.url);
  } catch (error) {
    bugsnagClient.notify(error);
    return res.status(400).send({ error: 'invalid URL' });
  }

  // eslint-disable-next-line consistent-return
  dns.lookup(originalUrl.hostname, (err) => {
    if (err) {
      return res.status(404).send({ error: 'Address not found' });
    }
    const { db } = req.app.locals;
    shortenURL(db, originalUrl.href)
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
  const { db } = req.app.locals;

  checkIfShortIdExists(db, shortId)
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
});

app.set('port', process.env.PORT || 3000);
app.use(bugsnagMiddleware.errorHandler);

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
