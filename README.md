# sync-server

[![Codeship badge](https://codeship.com/projects/00364600-b0b2-0133-c9a4-72e14e42ee1c/status?branch=master)](https://app.codeship.com/projects/132772)
[![Code Climate](https://codeclimate.com/github/neotoma/sync-server/badges/gpa.svg)](https://codeclimate.com/github/neotoma/sync-server)
[![Code Climate issues badge](https://codeclimate.com/github/neotoma/sync-server/badges/issue_count.svg)](https://codeclimate.com/github/neotoma/sync-server/issues)
[![David badge](https://david-dm.org/neotoma/sync-server.svg)](https://david-dm.org/neotoma/sync-server)

This repository contains the source code for an app that synchronizes data from sources to storage on behalf of users.

See also documentation for [the JavaScript source code](http://neotoma.github.io/sync-server/) or [the Neotoma project](https://github.com/neotoma/documentation).

## Setting up the environment

The code requires several environment variables to run or deploy the app. The following environment variables can be declared by adding a file named `.env` (in [INI format](https://en.wikipedia.org/wiki/INI_file)) to the base directory, assuming they're not declared elsewhere in the system already. Such a file will be ignored by Git.

- `SYNC_SERVER_DIR`: Local path to app base directory (e.g. `/var/www/sync-server'; required to run tasks)
- `SYNC_SERVER_HOST`: Host address for the app (e.g. `127.0.0.1`; required to run app)
- `SYNC_SERVER_PORT`: Port through which to run the app (e.g. `1234`; required to run app)
- `SYNC_SERVER_SESSION_SECRET`: Secret, non-obvious string used to prevent session tampering (e.g. `oc]7kwM)R*UX3&` but *generate your own*; required to run app)
- `SYNC_SERVER_DEPLOY_HOST_USERNAME`: User name with which to SSH into remote deployment server (e.g. `root`; required to deploy app)
- `SYNC_SERVER_WEB_HOST`: Host address for the web client intended to communicate with the app exclusively via cross-origin HTTP requests; used to set HTTP access control (CORS) (e.g. `http://example.com:9019`; optional)
- `SYNC_SERVER_DEPLOY_CERTS_DIR`: Local system path to a directory with the SSL certificate files `key`, `crt` and `ca` needed by the app to serve HTTPs requests *remotely on the deployment server* (e.g. `/var/www/sync-server/.certs-deploy`; required to deploy app). This directory will be copied to `.certs` within the base directory of the app on the deployment server so the environment variable `SYNC_SERVER_CERTS_DIR` must be set to `.certs` in the deployment environment unless this directory is later moved.
- `SYNC_SERVER_DEPLOY_HOST`: Host address for the remote deployment server (e.g. `example.com`; required to deploy app)
- `SYNC_SERVER_DEPLOY_HOST_DIR`: Remote system path to app directory on deployment server (e.g. `/var/www/sync-server`; required to deploy app)
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

Note that you can create directories called `.certs` and `.certs-deploy` within the base directory to satisfy the `SYNC_SERVER_CERTS_DIR` and `SYNC_SERVER_DEPLOY_CERTS_DIR` variables and they will be ignored by Git.

If you intend to deploy the server to another system using scripts within the "Developing and deploying the server" section below, you can also create a `.env-deploy` file in the base directory, one that will be ignored by Git and used upon deployment to create an `.env` file remotely, thereby setting environment variables on the deployment server.

Environment variables intended for running tests should be added to an `.env-test` file in the base directory. It will be ignored by Git as well.

## Running the server

Once the environment is ready per above, and [Node.js](http://nodejs.org/) with [NPM](https://www.npmjs.com/) is installed, simply run `npm install` to install dependencies in the `node_modules` directory and `node server.js` to fire the server up.

## Developing and deploying the server

The following commands can be executed to help with development and deployment:

- `npm run dev`: Runs the app and automatically reloads it when code changes are made during development
- `npm run test`: Runs all tests locally
- `npm run deploy-all`: Runs all tests locally, deploys environment and certificate file dependencies, deploys the app remotely, and runs `npm install` remotely to ensure the installation of dependencies
- `npm run deploy-dependencies`: Deploys environment and certificate file dependencies.
- `npm run deploy-app`: Deploys the app remotely and runs `npm install` remotely to ensure the installation of dependencies

If you add `restart-forever` to any of the deployment scripts (e.g. `grunt deploy-all restart-forever`), [forever](https://github.com/foreverjs/forever) will be used to start or restart the app remotely post-deployment. Ensure that Node with NPM and forever are installed remotely before appending this script.

If you add `restart-systemd` to any of the deployment scripts (e.g. `grunt deploy-all restart-systemd`), [systemd](https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal) will be used to start or restart the app remotely post-deployment. Ensure that Node and systemd with a service for the app called `syncserver` are installed remotely before running this script.