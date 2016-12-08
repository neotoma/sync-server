# Sync server

This repository contains the source code for an app that synchronizes data from sources to storage on behalf of users per the [Asheville project specification](https://github.com/asheville/spec).

## Setting up the environment

The code requires several environment variables to run or deploy the app. The following environment variables can be declared by adding a file named `.env` (in [INI format](https://en.wikipedia.org/wiki/INI_file)) to the base directory, assuming they're not declared elsewhere in the system already. Such a file will be ignored by Git.

- `SYNC_SERVER_ENV`: Type of environment within which to run the app, affecting the behavior of services such as database, logging, and mailing. Must be assigned value `development`, `test`, or `production` (e.g. `development`; required to run app)
- `SYNC_SERVER_NAME`: Name used by the app to identity itself with users (e.g. "Asheville"; required to run app)
- `SYNC_SERVER_MAILER_SENDER_EMAIL`: Email address used by app to send email (e.g. `support@example.com`; required to run app)
- `SYNC_SERVER_MAILER_DEV_RECIPIENT_EMAIL`: Email address used by the app to manually test the delivery of email (e.g. `developer@example.com`; required to run app in the development environment but not required to run it in other environments nor to deploy)
- `SYNC_SERVER_MAILER_LOGGER_EMAIL`: Email address used by the app to report high-priority log events by email (e.g. `developer-support@example.com`; optional)
- `SYNC_SERVER_CERTS_DIR`: Local system path to a directory with the SSL certificate files `key`, `crt` and `ca` needed by the app to serve HTTPs requests (e.g. `/Users/me/sync-server/.certs`; required to run app)
- `SYNC_SERVER_HOST`: Host address for the app (e.g. `127.0.0.1`; required to run app)
- `SYNC_SERVER_PORT`: Port through which to run the app (e.g. `1234`; required to run app)
- `SYNC_SERVER_WEB_HOST`: Host address for the web client intended to communicate with the app exclusively via cross-origin HTTP requests; used to set HTTP access control (CORS) (e.g. `example.com:9019`; optional)
- `SYNC_SERVER_DEPLOY_HOST_USERNAME`: User name with which to SSH into remote deployment server (e.g. `root`; required to deploy app)
- `SYNC_SERVER_DEPLOY_HOST`: Host address for the remote deployment server (e.g. `example.com`; required to deploy app)
- `SYNC_SERVER_DEPLOY_HOST_DIR`: Remote system path to app directory on deployment server (e.g. `/var/www/sync-server`; required to deploy app)
- `SYNC_SERVER_DEPLOY_CERTS_DIR`: Local system path to a directory with the SSL certificate files `key`, `crt` and `ca` needed by the app to serve HTTPs requests *remotely on the deployment server* (e.g. `/Users/me/sync-server/.certs-deploy`; required to deploy app). This directory will be copied to `.certs` within the base directory of the app on the deployment server so the environment variable `SYNC_SERVER_CERTS_DIR` must be set to `.certs` in the deployment environment unless this directory is later moved.

Note that you can create directories called `.certs` and `.certs-deploy` within the base directory to satisfy the `SYNC_SERVER_CERTS_DIR` and `SYNC_SERVER_DEPLOY_CERTS_DIR` variables and they will be ignored by Git.

If you intend to deploy the server to another system using scripts within the "Developing and deploying the server" section below, you can also create a `.env-deploy` file in the base directory, one that will be ignored by Git and used upon deployment to create an `.env` file remotely, thereby setting environment variables on the deployment server.

---

In addition to the above variables, the following need to be added for all environments to run the app successfuly.

### Database

State data is managed by [MongoDB](http://www.mongodb.org/), access to which must be indicated by the following environment variables:

- `SYNC_SERVER_MONGODB_HOST`: Host address for the MongoDB service (e.g. `127.0.0.1`; required to run app)
- `SYNC_SERVER_MONGODB_PORT`: Port through which to access the MongoDB service (e.g. `27017`; required to run app)

### Sessions

User sessions are handled by [Express](http://expressjs.com/) and [Passport](http://passportjs.org/), which rely on the following environment variable:

- `SYNC_SERVER_SESSIONS_SECRET`: Secret, non-obvious string used to prevent session tampering (e.g. `oc]7kwM)R*UX3&` but *generate your own*; required)

### Dropbox

The Dropbox storage module relies on the following environment variables:

- `SYNC_SERVER_STORAGES_DROPBOX_APP_KEY`: Dropbox developer app key (required)
- `SYNC_SERVER_STORAGES_DROPBOX_APP_SECRET`: Dropbox developer app secret (required) 

You can find these on the [Dropbox developer website](https://dropbox.com/developers/apps). Register an app and configure the redirect URI to be the app host plus the path `/storages/dropbox/auth-callback` (e.g. `https://127.0.0.1:9090/storages/dropbox/auth-callback`).

### foursquare

The foursquare source module relies on the following environment variables:

- `SYNC_SERVER_SOURCES_FOURSQUARE_CLIENT_ID`: foursquare developer app client ID (required)
- `SYNC_SERVER_SOURCES_FOURSQUARE_CLIENT_SECRET`: foursquare developer app client secret (required)

You can find these on the [foursquare developer website](https://foursquare.com/developers/apps). Register an app and set a redirect URI as your host suffixed with `/sources/foursquare/auth-callback` (e.g. `https://127.0.0.1:9090/sources/foursquare/auth-callback`).

### Instagram

The Instagram source module relies on the following environment variables:

- `SYNC_SERVER_SOURCES_INSTAGRAM_CLIENT_ID`: Instagram developer app client ID (required)
- `SYNC_SERVER_SOURCES_INSTAGRAM_CLIENT_SECRET`: Instagram developer app client secret (required)

You can find these on the [Instagram developer website](https://instagram.com/developer). Register an app and set the redirect URI as your host suffixed with `/sources/instagram/auth-callback` (e.g. `https://127.0.0.1:9090/sources/instagram/auth-callback`).

### Twitter

The Twitter source module relies on the following environment variables:

- `SYNC_SERVER_SOURCES_TWITTER_CONSUMER_KEY`: Twitter developer app client ID (required)
- `SYNC_SERVER_SOURCES_TWITTER_CONSUMER_SECRET`: Twitter developer app client secret (required)

You can find these on the [Twitter application management website](https://apps.twitter.com/). Register an app and set the callback URL as your host suffixed with `/sources/twitter/auth-callback` (e.g. `http://127.0.0.1:9090/sources/twitter/auth-callback`).

## Running the server

Once the environment is ready per above, and [Node.js](http://nodejs.org/) with [NPM](https://www.npmjs.com/) is installed, simply run `npm install` to install dependencies and `node app-server.js` to fire the server up.

## Endpoints

The following endpoints are supported by the app:

- GET `/userStorageAuths`: Retrieve all storage authentications for session user
- DELETE `/userStorageAuths/:id`: Delete a storage authentication
- GET `/storages/dropbox/auth`: Authenticate Dropbox account
- GET `/storages/dropbox/auth-callback`: Process Dropbox account authentication
- GET `/sources`: Retrieve all available sources
- GET `/userSourceAuths`: Retrieve all source authentications for session user
- DELETE `/userSourceAuths/:id`: Delete a source authentication
- GET `/sources/foursquare/auth`: Authenticate foursquare account
- GET `/sources/foursquare/auth-callback`: Process foursquare account authentication
- GET `/sources/twitter/auth`: Authenticate twitter account
- GET `/sources/twitter/auth-callback`: Process twitter account authentication
- GET `/statuses`: Retrieve all statuses for session user

## Developing and deploying the server

With [Grunt](gruntjs.com) installed in addition to establishing your environment accordingly per the instructions above, you can run any of the following scripts to help with development and deployment:

- `grunt dev`: Runs the app and automatically reloads it when code changes are made during development
- `grunt deploy`: Runs all tests locally, deploys environment and certificate file dependencies, deploys the app remotely, and runs `npm install` remotely to ensure the installation of dependencies
- `grunt deploy-dependencies`: Deploys environment and certificate file dependencies.
- `grunt deploy-app`: Deploys the app remotely and runs `npm install` remotely to ensure the installation of dependencies
- `grunt deploy-forever`: Runs all tests locally, deploys environment and certificate file dependencies, deploys the app remotely, runs `npm install` remotely to ensure the installation of dependencies, and either starts or restarts the app remotely with [forever](https://github.com/foreverjs/forever). Ensure that Node with NPM and forever are installed remotely before running this script.
- `grunt deploy-systemd`: Runs all tests locally, deploys environment and certificate file dependencies, deploys the app remotely, runs `npm install` remotely to ensure the installation of dependencies, and either starts or restarts the app remotely with [systemd](https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal). Ensure that Node and systemd with a service for the app called `syncserver` are installed remotely before running this script.