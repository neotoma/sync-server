# sync-server

[![Codeship badge](https://codeship.com/projects/00364600-b0b2-0133-c9a4-72e14e42ee1c/status?branch=master)](https://app.codeship.com/projects/132772)
[![Code Climate](https://codeclimate.com/github/neotoma/sync-server/badges/gpa.svg)](https://codeclimate.com/github/neotoma/sync-server)
[![Code Climate issues badge](https://codeclimate.com/github/neotoma/sync-server/badges/issue_count.svg)](https://codeclimate.com/github/neotoma/sync-server/issues)
[![David badge](https://david-dm.org/neotoma/sync-server.svg)](https://david-dm.org/neotoma/sync-server)

This repository contains the source code for an app that synchronizes data from sources to storage on behalf of users.

See also documentation for [the JavaScript source code](http://neotoma.github.io/sync-server/) or [the Neotoma project](https://github.com/neotoma/documentation).

## Setup

SSL certificates and the following environment variables are managed by [Park Ranger](https://github.com/markmhx/park-ranger):

- `SYNC_SERVER_DIR`: Local path to app base directory (e.g. `/var/www/sync-server`; required to run tasks)
- `SYNC_SERVER_HOST`: Host address for the app (e.g. `127.0.0.1`; required to run app)
- `SYNC_SERVER_HTTPS_PORT`: Port through which to run the app with HTTPS (e.g. `1234`; required to run app)
- `SYNC_SERVER_HTTP_PORT`: Port through which to run the app with HTTP (e.g. `1235`; required to run app)
- `SYNC_SERVER_SESSION_SECRET`: Secret, non-obvious string used to prevent session tampering (e.g. `oc]7kwM)R*UX3&` but *generate your own*; required to run app)
- `SYNC_SERVER_DEPLOY_HOST_USERNAME`: User name with which to SSH into remote deployment server (e.g. `root`; required to deploy app)
- `SYNC_SERVER_WEB_HOST`: Host address for the web client intended to communicate with the app exclusively via cross-origin HTTP requests; used to set HTTP access control (CORS) (e.g. `http://example.com:9019`; optional)
- `SYNC_SERVER_DEPLOY_CERTS_DIR`: Local system path to a directory with the SSL certificate files `key`, `crt` and `ca` needed by the app to serve HTTPs requests *remotely on the deployment server* (e.g. `/var/www/sync-server/.certs-deploy`; required to deploy app). This directory will be copied to `.certs` within the base directory of the app on the deployment server so the environment variable `SYNC_SERVER_CERTS_DIR` must be set to `.certs` in the deployment environment unless this directory is later moved.
- `SYNC_SERVER_DEPLOY_HOST`: Host address for the remote deployment server (e.g. `example.com`; required to deploy app)
- `SYNC_SERVER_DEPLOY_HOST_DIR`: Remote system path to app directory on deployment server (e.g. `/var/www/sync-server`; required to deploy app)
- `SYNC_SERVER_DEPLOY_SYSTEMD_SERVICE`: Name of systemd service on host that should be restarted or started upon app deployment (e.g. `syncserver`; optional to deploy app)
- `SSH_AUTH_SOCK`: Socket used by system for SSH agent forwarding (required to deploy app)
- `SYNC_SERVER_MONGODB_DATABASE`: Name of a [MongoDB](http://www.mongodb.org/) database (e.g. `sync_server`)
- `SYNC_SERVER_MONGODB_HOST`: Host address for a MongoDB service (e.g. `127.0.0.1`; required to run app)
- `SYNC_SERVER_MONGODB_PORT`: Port through which to access a MongoDB service (e.g. `27017`; required to run app)
- `SYNC_SERVER_MAILER_LOGGER_EMAIL`: Email to which logger errors should be sent (optional to run app)
- `SYNC_SERVER_LOGGER_MAILER_LEVEL`: Numeric value between 0 and 5 to designate level of errors to email to SYNC_SERVER_MAILER_LOGGER_EMAIL (optional to run app)
- `SYNC_SERVER_NAME`: Name used by the app to identity itself with users (e.g. `Neotoma`; required to run app)
- `SYNC_SERVER_MAILER_SENDER_EMAIL`: Email address used by app to send email (e.g. `support@example.com`; required to run app)
- `SYNC_SERVER_MAILER_DEV_RECIPIENT_EMAIL`: Email address used by the app to manually test the delivery of email (e.g. `developer@example.com`; required to run app in the development environment but not required to run it in other environments nor to deploy)
- `SYNC_SERVER_MAILER_LOGGER_EMAIL`: Email address used by the app to report high-priority log events by email (e.g. `developer-support@example.com`; optional)
- `SYNC_SERVER_LOGGER_FILE_PATH`: File system path where to store log events (e.g. `/tmp/sync-server.log`; optional)
- `SYNC_SERVER_CERTS_DIR`: Local system path to a directory with the SSL certificate files `key`, `crt` and `ca` needed by the app to serve HTTPs requests (e.g. `/var/www/sync-server/.certs`; required to run app)
- `SYNC_SERVER_SENDGRID_API_KEY`: API key for SendGrid account for delivering email (optional to run app)
- `SYNC_SERVER_MAILER_RECIPIENT_EMAIL`: Email address to which to restrict all email delivery for testing purposes (optional to run app)

Tests will use Park Ranger to establish environment variables available for the "test" environment after loading those for whatever environment initially indicated upon execution. 

Be sure to set any of the above variables to a different value within `.env-test` if you don't want the tests to use the variables available for the indicated environment. 

For example, set a different `SYNC_SERVER_MONGODB_DATABASE` to prevent your development database from getting reset every time you run tests, and `SYNC_SERVER_SENDGRID_API_KEY` to "null" to prevent email delivery.

## Running the server

Once the environment is ready per above, and [Node.js](http://nodejs.org/) with [NPM](https://www.npmjs.com/) is installed, simply run `npm install` to install dependencies in the `node_modules` directory and `node server.js` to fire the server up.

## Developing and deploying the server

Deployment scripts are available through [Hoist](https://github.com/markmhx/grunt-hoist). The following are also supported:

- `npm run dev`: Runs the app and automatically reloads it when code changes are made during development
- `npm run test`: Runs all tests locally