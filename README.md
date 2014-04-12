# Asheville Sync

This is an API-centric service for synchronizing data between sources and storages per the [Asheville specification](http://asheville.io).

## MongoDB

User data is stored in MongoDB, which relies on the following environment variable:

```
ASHEVILLE_SYNC_MONGODB_URL=<mongodb service url>
```

## Sessions

Express sessions rely on the following environment variable:

```
ASHEVILLE_SYNC_SESSIONS_SECRET=<secret passphrase>
```

## Storages

Storages are points of destination for syncronizing data from sources.

### Dropbox

#### Environment Variables

The Dropbox storage module relies on the following environment variables:

```
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_KEY=<dropbox developer app key>
ASHEVILLE_SYNC_STORAGES_DROPBOX_APP_SECRET=<dropbox developer app secret>
ASHEVILLE_SYNC_STORAGES_DROPBOX_CALLBACK_URL=<dropbox auth callback URL>
```

#### Endpoints

- GET `/storages/dropbox/auth`: authenticate Dropbox account
- GET `/storages/dropbox`: Dropbox access token
- GET `/storages/dropbox/account/info`: basic Dropbox account info
- GET `/storages/dropbox/file-put-test`: load test.txt file into app directory

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

#### Endpoints

- GET `/sources/foursquare/auth`: authenticate foursquare account
- GET `/sources/foursquare`: view foursquare access token
- GET `/sources/foursquare/sync/checkins`: sync all of authenticated user's checkins to Dropbox
- GET `/sources/foursquare/sync/tips`: sync all of authenticated user's tips to Dropbox
- GET `/sources/foursquare/sync/friends`: sync all of authenticated user's friends to Dropbox