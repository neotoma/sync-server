# Asheville Sync

This is an API-centric service for synchronizing data between sources and storages per the [Asheville specification](http://asheville.io).

# Host

Configuration relies on knowing the host URL as reported by the following environment variable:

```
ASHEVILLE_SYNC_HOST_URL=<web server URL>
```

Example: `http://localhost:9090`

## MongoDB

User data is stored in MongoDB, which relies on the following environment variable:

```
ASHEVILLE_SYNC_MONGODB_URL=<mongodb service url>
```

Example: `mongodb://127.0.0.1:27017`

## Sessions

Express sessions rely on the following environment variable:

```
ASHEVILLE_SYNC_SESSIONS_SECRET=<secret passphrase>
```

Use a randomly generated, secure, alphanumeric string for this value.

## Storages

Storages are points of destination for syncronizing data from sources.

### Dropbox

#### Environment Variables

The Dropbox storage module relies on the following environment variables:

```
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_KEY=<dropbox developer app key>
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_SECRET=<dropbox developer app secret>
```

You can find these on the Dropbox developer website at [https://dropbox.com/developers/apps](https://dropbox.com/developers/apps). Register an app for Asheville if you haven't already and set a redirect URI as your host suffixed with `/storages/dropbox/auth-callback` (e.g. `http://localhost:9090/storages/dropbox/auth-callback`).

#### Endpoints

- GET `/storages/dropbox/auth`: authenticate Dropbox account
- GET `/storages/dropbox`: Dropbox access token
- GET `/storages/dropbox/account/info`: basic Dropbox account info

## Sources

Sources are points of origin for syncronizing data to storage.

### foursquare

#### Environment Variables

The foursquare source module relies on the following environment variables:

```
ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID=<foursquare developer app client ID>
ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET=<foursquare developer app client secret>
ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CALLBACK_URL=<foursquare auth callback URL>
```

You can find these on the foursquare developer website at [https://foursquare.com/developers/apps](https://foursquare.com/developers/apps). Register an app for Asheville if you haven't already and set a redirect URI as your host suffixed with `/sources/foursquare/auth-callback` (e.g. `http://localhost:9090/sources/foursquare/auth-callback`).

#### Endpoints

- GET `/sources/foursquare/auth`: authenticate foursquare account
- GET `/sources/foursquare`: view data about items available and synced from foursquare
- GET `/sources/foursquare/sync/checkins`: sync all of authenticated user's checkins to Dropbox
- GET `/sources/foursquare/sync/tips`: sync all of authenticated user's tips to Dropbox
- GET `/sources/foursquare/sync/friends`: sync all of authenticated user's friends to Dropbox