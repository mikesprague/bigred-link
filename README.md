# bigred.link

A big red link shortener

## Requirements

This project uses [Yarn](https://yarnpkg.com/) for dependency management. [Npm](https://npmjs.com) will
work but you will need to modify the `package.json` file to use `npm` commands instead of `yarn` commands.

You will need to have MongoDB running (install locally or use remotely via [mLab](https://mlab.com/), [MongoDB](https://www.mongodb.com/cloud/atlas),
or another provider of your choice).

This project uses [Bugsnag](https://bugsnag.com) for error reporting. You will need to create a free account and set up a project to get a Bugsnag key.

## Running locally

1. Clone this repo and go into the directory
1. Rename `sample.env` to .`.env` and edit the file to set the required values for: `MONGO_DB_COLLECTION`, `MONGO_DB_NAME`, `MONGO_DB_URL`, `BUGSNAG_KEY`
1. Install dependencies by running: `yarn`
1. Start the project: `yarn dev`
1. Visit [http://localhost:3000](http://localhost:3000) in your browser
