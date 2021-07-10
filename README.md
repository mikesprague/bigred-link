# bigred.link

[![Known Vulnerabilities](https://snyk.io/test/github/mikesprague/bigred-link/badge.svg?targetFile=package.json)](https://snyk.io/test/github/mikesprague/bigred-link?targetFile=package.json)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link?ref=badge_shield)

A big red link shortener

## Requirements

This project uses [Yarn](https://yarnpkg.com/) for dependency management. [Npm](https://npmjs.com) will
work but you will need to modify the `package.json` file to use `npm` commands instead of `yarn` commands.

You will need to have MongoDB running (install locally or use remotely via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
or another provider of your choice).

This project uses [Bugsnag](https://bugsnag.com) for error reporting. You will need to create a free account and set up a project to get a Bugsnag key.

## Running locally

1. Clone this repo and go into the directory
1. Rename `sample.env` to .`.env` and edit the file to set the required values for:
    - `MONGO_DB_COLLECTION`
    - `MONGO_DB_NAME`
    - `MONGO_DB_URL`
    - `BUGSNAG_KEY`
1. Install dependencies by running: `yarn`
1. Start the project: `yarn dev`
1. Visit [http://localhost:3000](http://localhost:3000) in your browser

---

### License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link?ref=badge_large)
