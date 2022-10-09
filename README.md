# bigred.link

[![Vercel Deployment Status](https://img.shields.io/github/deployments/mikesprague/bigred-link/production?label=Vercel%20%28build%20%26%20deploy%29&logo=Vercel&logoColor=white)](https://vercel.com/m5ls5e/bigred-link/deployments)  [![Automated Safe Browsing Checks](https://github.com/mikesprague/bigred-link/actions/workflows/safebrowsing-url-check.yml/badge.svg)](https://github.com/mikesprague/bigred-link/actions/workflows/safebrowsing-url-check.yml)  

A big red link shortener

## Requirements

You will need a free [Subabase](https://supabase.com/) account to use for the database.

This project uses [Bugsnag](https://bugsnag.com) for error reporting. You will need to create a free account and set up a project to get a Bugsnag key.

You will also need a Google Developer account with a free [Safe Browsing](https://developers.google.com/safe-browsing) API key.

### Uses (incomplete list)

- React
- Tailwind CSS
- Vite
- Font Awesome
- Bugsnag
- Vercel
- Supabase
- Google Safe Browsing API

## Running locally

1. Clone this repo and go into the directory
1. Rename `sample.env` to `.env` and edit the file to set the required values for:
    - `SUPABASE_DB_TABLE`
    - `SUPABASE_ANON_PUB_KEY`
    - `SUPABASE_URL`
    - `BUGSNAG_KEY`
    - `VITE_BUGSNAG_KEY` (same as `BUGSNAG_KEY`)
    - `GOOGLE_SAFE_BROWSING_API_KEY`
1. Install dependencies by running: `npm install`
1. Start the project: `npm start`
1. Get localhost URL provided in terminal and visit in your browser

---

### License

MIT License

Copyright (c) 2022 Michael Sprague

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
