# Asheville Sync

This is an API-centric service for synchronizing data between sources and storages per the [Asheville specification](http://asheville.io).

# Hosts

Hosts must support SSL and be configured with the following environment variables:

```
ASHEVILLE_SYNC_HOST=<host address>
ASHEVILLE_SYNC_WEB_HOST=<web app host address>
ASHEVILLE_SYNC_DEPLOY_HOST=<host address for deployment elsewhere>
ASHEVILLE_SYNC_DEPLOY_HOST_DIR=<host directory for deployment elsewhere>
ASHEVILLE_SYNC_DEPLOY_HOST_USERNAME=<host username for deployment elsewhere>
ASHEVILLE_SYNC_SSL_KEY=<path to file with SSL key>
ASHEVILLE_SYNC_SSL_CRT=<path to file with SSL certificate>
```

## Database

User data is managed by [MongoDB](http://www.mongodb.org/), the host of which must be indicated by the following environment variables:

```
ASHEVILLE_SYNC_MONGODB_HOST=<mongodb service host>
```

Example: `mongodb://127.0.0.1`

```
ASHEVILLE_SYNC_MONGODB_PORT=<mongodb service port>
```

Example: `27017`

## Sessions

User sessions are handled by [Express](http://expressjs.com/) and [Passport](http://passportjs.org/), which rely on the following environment variable:

```
ASHEVILLE_SYNC_SESSIONS_SECRET=<secret passphrase>
```

Use a randomly generated, secure, alphanumeric string for this value.

## Storages

Storages are points of destination for syncronizing data from sources. Users can authenticate them to initiate syncing.

#### Endpoints

- GET `/userStorageAuths`: retrieve all storage authentications for session user
- GET `/userStorageAuths/:id`: retrieve data about a storage authentication

### Dropbox

#### Environment Variables

The Dropbox storage module relies on the following environment variables:

```
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_KEY=<dropbox developer app key>
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_SECRET=<dropbox developer app secret>
```

You can find these on the Dropbox developer website at [https://dropbox.com/developers/apps](https://dropbox.com/developers/apps). Register an app for Asheville and configure the redirect URI to be the app host plus the path `/storages/dropbox/auth-callback` (e.g. `http://localhost:9090/storages/dropbox/auth-callback`).

#### Endpoints

- GET `/storages/dropbox/auth`: authenticate Dropbox account
- GET `/storages/dropbox/auth-callback`: process Dropbox account authentication

## Sources

Sources are points of origin for syncronizing data to storage. Users can authenticate them to initiate syncing.

#### Endpoints

- GET `/sources`: retrieve all available sources
- GET `/userSourceAuths`: retrieve all source authentications for session user
- GET `/userSourceAuths/:id`: retrieve data about a storage authentication

### foursquare

#### Environment Variables

The foursquare source module relies on the following environment variables:

```
ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID=<foursquare developer app client ID>
ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET=<foursquare developer app client secret>
```

You can find these on the foursquare developer website at [https://foursquare.com/developers/apps](https://foursquare.com/developers/apps). Register an app for Asheville if you haven't already and set a redirect URI as your host suffixed with `/sources/foursquare/auth-callback` (e.g. `http://localhost:9090/sources/foursquare/auth-callback`).

#### Endpoints

- GET `/sources/foursquare/auth`: authenticate foursquare account
- GET `/sources/foursquare/auth-callback`: process foursquare account authentication

## Statuses

Statuses are objects that report the latest sync status for a particular user, source and content type.

#### Endpoints

- GET `/statuses`: retrieve all statuses for session user