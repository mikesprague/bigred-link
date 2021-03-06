# bigred.link

[![Vercel Deployment Status](https://img.shields.io/github/deployments/mikesprague/bigred-link/production?label=Vercel%20%28build%20%26%20deploy%29&logo=Vercel&logoColor=white)](https://vercel.com/m5ls5e/bigred-link/deployments)
[![Known Vulnerabilities](https://snyk.io/test/github/mikesprague/bigred-link/badge.svg?targetFile=package.json)](https://snyk.io/test/github/mikesprague/bigred-link?targetFile=package.json)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link?ref=badge_shield)

A big red link shortener

## Requirements

This project uses [Yarn](https://yarnpkg.com/) for dependency management. [Npm](https://npmjs.com) will
work but you will need to modify the `package.json` file to use `npm` commands instead of `yarn` commands.

You will need to have MongoDB running (install locally or use remotely via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
or another provider of your choice).

This project uses [Bugsnag](https://bugsnag.com) for error reporting. You will need to create a free account and set up a project to get a Bugsnag key.

### Uses (incoplete list)

- React 17.x
- Tailwind CSS 2.x
- Webpack 5.x
- Font Awesome 5.x
- Bugsnag
- Logrocket
- Snyk
- MongoDB
- Vercel

## Running locally

1. Clone this repo and go into the directory
1. Rename `sample.env` to .`.env` and edit the file to set the required values for:
    - `MONGO_DB_COLLECTION`
    - `MONGO_DB_NAME`
    - `MONGO_DB_URL`
    - `BUGSNAG_KEY`
    - `FONT_AWESOME_TOKEN`
1. Install dependencies by running: `yarn`
1. Start the project: `yarn dev`
1. Visit [http://localhost:3000](http://localhost:3000) in your browser

---

### License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmikesprague%2Fbigred-link?ref=badge_large)

MIT License

Copyright (c) 2021 Michael Sprague

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
