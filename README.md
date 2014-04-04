# Asheville Sync

This is an API-centric service for synchronizing data between sources and storages.

## MongoDB

User data is stored in MongoDB, which relies on the following environment variable:

```
export ASHEVILLE_SYNC_MONGODB_URL=<mongodb service url>
```

## foursquare

The foursquare importer relies on the following environment variables:

```
export ASHEVILLE_SYNC_FOURSQUARE_CLIENT_ID=<foursquare developer app client ID>
export ASHEVILLE_SYNC_FOURSQUARE_CLIENT_SECRET=<foursquare developer app client secret>
```