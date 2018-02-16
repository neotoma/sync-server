# sync-server 📡💾🏠

[![Codeship badge](https://codeship.com/projects/00364600-b0b2-0133-c9a4-72e14e42ee1c/status?branch=master)](https://app.codeship.com/projects/132772)
[![Code Climate](https://codeclimate.com/github/neotoma/sync-server/badges/gpa.svg)](https://codeclimate.com/github/neotoma/sync-server)
[![Code Climate issues badge](https://codeclimate.com/github/neotoma/sync-server/badges/issue_count.svg)](https://codeclimate.com/github/neotoma/sync-server/issues)
[![David badge](https://david-dm.org/neotoma/sync-server.svg)](https://david-dm.org/neotoma/sync-server)

This repository contains the source code for an app that synchronizes data with specified content types from sources to storages on behalf of users.

See also [the API documentation](http://neotoma.github.io/sync-server/) or [the Neotoma project in general](https://github.com/neotoma/documentation).

## Setup

SSL certificates and the following environment variables are managed by [Park Ranger](https://github.com/markmhx/park-ranger):

### Required

- `SYNC_SERVER_SESSION_SECRET`: Secret, non-obvious string used to prevent session tampering (e.g. `oc]7kwM)R*UX3&` but *generate your own*)

### Optional

- `SYNC_SERVER_DIR`: Local path to app base directory (defaults to `/var/www/sync-server`)
- `SYNC_SERVER_HOST`: Host address for the app (defaults to `127.0.0.1`)
- `SYNC_SERVER_HTTP_PORT`: Port through which to run the app with HTTP (defaults `9001`)
- `SYNC_SERVER_HTTPS_PORT`: Port through which to run the app with HTTPS (defaults to `9002`)
- `SYNC_SERVER_LOGGER_FILE_PATH`: File system path where to store log events (e.g. `/tmp/sync-server.log`)
- `SYNC_SERVER_LOGGER_MAILER_LEVEL`: Numeric value between 0 and 5 to designate level of errors to email to SYNC_SERVER_MAILER_LOGGER_EMAIL
- `SYNC_SERVER_MAILER_LOGGER_EMAIL`: Email to which logger errors should be sent
- `SYNC_SERVER_MAILER_RECIPIENT_EMAIL`: Email address to which to restrict all email delivery for testing purposes
- `SYNC_SERVER_MAILER_SENDER_EMAIL`: Email address used by app to send email (e.g. `support@example.com`; required to send email)
- `SYNC_SERVER_MONGODB_DATABASE`: Name of a [MongoDB](http://www.mongodb.org/) database (defaults to `sync_server`)
- `SYNC_SERVER_MONGODB_HOST`: Host address for a MongoDB service (defaults to `127.0.0.1`)
- `SYNC_SERVER_MONGODB_PORT`: Port through which to access a MongoDB service (defaults to `27017`)
- `SYNC_SERVER_NAME`: Name used by the app to identity itself with users (defaults to `Neotoma`)
- `SYNC_SERVER_SENDGRID_API_KEY`: API key for SendGrid account for delivering email (required to send email)
- `SYNC_SERVER_WEB_HOST`: Host address for the web client intended to communicate with the app exclusively via cross-origin HTTP requests; used to set HTTP access control (CORS) (e.g. `http://example.com:9019`)

Tests will use Park Ranger to establish environment variables available for the "test" environment after loading those for whatever environment initially indicated upon execution. 

Be sure to set any of the above variables to a different value within `.env-test` if you don't want the tests to use the variables available for the indicated environment. 

For example, set a different `SYNC_SERVER_MONGODB_DATABASE` to prevent your development database from getting reset every time you run tests, and `SYNC_SERVER_SENDGRID_API_KEY` to `null` to prevent email delivery.

## Running the server

Once the environment is ready per above, and [Node.js](http://nodejs.org/) with [NPM](https://www.npmjs.com/) is installed, simply run `npm install` to install dependencies in the `node_modules` directory and `npm start` to fire the server up.

## Developing and deploying the server

Deployment scripts are available through [Hoist](https://github.com/markmhx/grunt-hoist). The following are also supported:

- `npm run dev`: Runs the app and automatically reloads it when code changes are made during development
- `npm run test`: Runs all tests locally
- `npm run data-seed`: Runs [the data seed script](#data-seed-script)

### Data seed script

This script loads any data objects available as JSON files in the `data` directory into the Mongo database after deleting existing data in the database that belong to those objects' collections.

For example, if you create the file `data/users.json` and place the following JSON conformant to [the JSONAPI specification](http://jsonapi.org/), the script will clear existing users and add this new one as an administrator:

```
{
  "data": [{
    "type": "users",
    "attributes": {
      "admin": true,
      "email": "ghopper@example.com",
      "name": "Grace Hopper"
    }
  }]
}
```

This script is intended to be run only in development environments to help seed data without concern for the possible side effects of deleting existing data.

It's also especially helpful when used to seed content type, source and storage records, which are fundamental to the application.

For example, the following could be placed into `data/storages.json` to populate storage records for Dropbox and Google Drive:

```
{
  "data": [{
    "type": "storages",
    "attributes": {
      "apiVersion": "2",
      "name": "Dropbox",
      "host": "content.dropboxapi.com",
      "passportStrategy": "passport-dropbox-oauth2",
      "clientId": "[YOUR DROPBOX DEVELOPER APP'S CLIENT ID]",
      "clientSecret": "[YOUR DROPBOX DEVELOPER APP'S CLIENT SECRET]",
      "itemPutUrlTemplate": "https://${host}/2/files/upload",
      "logoGlyphPath": "/images/logos/dropbox-glyph.svg",
      "itemStorageEnabled": true,
      "slug": "dropbox"
    }
  }, {
    "type": "storages",
    "attributes": {
      "name": "Google Drive",
      "logoGlyphPath": "/images/logos/google-drive-glyph.svg"
    }
  }]
}
```

The following could be placed into `data/sources.json` to populate source records for Foursquare and Facebook:

```
{
    "type": "sources",
    "attributes": {
      "name": "Foursquare",
      "itemStorageEnabled": true,
      "logoGlyphPath": "/images/logos/foursquare-glyph.svg",
      "host": "api.foursquare.com",
      "apiVersion": "20180202",
      "itemsLimit": 100,
      "clientId": "[YOUR FOURSQUARE DEVELOPER APP'S CLIENT ID]",
      "clientSecret": "[YOUR FOURSQUARE DEVELOPER APP'S CLIENT SECRET]",
      "passportStrategy": "passport-foursquare",
      "itemsGetUrlTemplate": "https://${host}/v2/users/self/${contentTypePluralLowercaseName}?v=${apiVersion}&oauth_token=${accessToken}&limit=${limit}&offset=${offset}",
      "itemDataObjectsFromPagePathTemplate": "response.${contentTypePluralLowercaseName}.items",
      "totalItemsAvailableFromPagePathTemplate": "response.${contentTypePluralLowercaseName}.count",
      "slug": "foursquare"
    },
    "relationships": {
      "contentTypes": {
        "data": [{
          "type": "contentTypes",
          "attributes": {
            "name": "Check-in"
          }
        }, {
          "type": "contentTypes",
          "attributes": {
            "name": "Friend"
          }
        }, {
          "type": "contentTypes",
          "attributes": {
            "name": "Tip"
          }
        }]
      }
    }
  }, {
    "type": "sources",
    "attributes": {
      "apiVersion": "v2.8",
      "authScope": ["user_posts","email"],
      "name": "Facebook",
      "itemStorageEnabled": true,
      "logoGlyphPath": "/images/logos/facebook-glyph.svg",
      "host": "graph.facebook.com",
      "clientId": "[YOUR FACEBOOK DEVELOPER APP'S CLIENT ID]",
      "clientSecret": "[YOUR FACEBOOK DEVELOPER APP'S CLIENT SECRET]",
      "passportStrategy": "passport-facebook",
      "itemsGetUrlTemplate": "https://${host}/${apiVersion}/me/${contentTypePluralLowercaseName}?access_token=${accessToken}",
      "totalItemsAvailableFromPagePathTemplate": "summary.total_count",
      "slug": "facebook"
    },
    "relationships": {
      "contentTypes": {
        "data": [{
          "type": "contentTypes",
          "attributes": {
            "name": "Friend"
          }
        }, {
          "type": "contentTypes",
          "attributes": {
            "name": "Photo"
          }
        }, {
          "type": "contentTypes",
          "attributes": {
            "name": "Post"
          }
        }]
      }
    }
  }
```

And finally, the following could be placed into `data/contentTypes.json` to populate the content type records associated with those sources:

```
{
  "data": [{
    "type": "contentTypes",
    "attributes": {
      "name": "Check-in",
      "dataTemplate": {
        "place-state": "venue.location.state",
        "place-postal": "venue.location.postalCode",
        "place-name": "venue.name",
        "place-longitude": "venue.location.lng",
        "place-latitude": "venue.location.lat",
        "place-country-code": "venue.location.cc",
        "place-country": "venue.location.country",
        "place-city": "venue.location.city",
        "place-category": "venue.categories[0].pluralName",
        "place-address": "venue.location.address",
        "likes-count": "likes.count",
        "foursquare-venue-id": "venue.id"
      }
    }
  }, {
    "type": "contentTypes",
    "attributes": {
      "name": "Friend"
    }
  }, {
    "type": "contentTypes",
    "attributes": {
      "name": "Photo"
    }
  }, {
    "type": "contentTypes",
    "attributes": {
      "name": "Post"
    }
  }, {
    "type": "contentTypes",
    "attributes": {
      "name": "Tip"
    }
  }]
}
```

The `dataTemplate` attribute for content types is used to indicate how you'd like the data from a source to get formatted before copied to storage.

For example, using the `dataTemplate` value above, the following raw data pulled from the Foursquare API for a check-in item:

```
{
  "comments": {
    "count": 0
  },
  "createdAt": 1517560416,
  "id": "5a742260ea1e440aa76d01a4",
  "isMayor": true,
  "like": false,
  "likes": {
    "count": 0,
    "groups": []
  },
  "photos": {
    "count": 0,
    "items": []
  },
  "posts": {
    "count": 0,
    "textCount": 0
  },
  "source": {
    "name": "Swarm for iOS",
    "url": "https://www.swarmapp.com"
  },
  "timeZoneOffset": 60,
  "type": "checkin",
  "venue": {
    "beenHere": {
      "lastCheckinExpiredAt": 0
    },
    "categories": [
      {
        "icon": {
          "prefix": "https://ss3.4sqi.net/img/categories_v2/building/office_coworkingspace_",
          "suffix": ".png"
        },
        "id": "4bf58dd8d48988d174941735",
        "name": "Coworking Space",
        "pluralName": "Coworking Spaces",
        "primary": true,
        "shortName": "Coworking Space"
      }
    ],
    "contact": {
      "facebook": "195202760509656",
      "facebookName": "MOB",
      "facebookUsername": "MOB.BCN",
      "formattedPhone": "936 67 41 65",
      "phone": "936674165",
      "twitter": "mob_bcn"
    },
    "id": "4ed4fe31f5b975def54c94dd",
    "location": {
      "address": "C. Bailèn, 11",
      "cc": "ES",
      "city": "Barcelona",
      "country": "Spain",
      "crossStreet": "C. d'Ausiàs Marc",
      "formattedAddress": [
        "C. Bailèn, 11 (C. d'Ausiàs Marc)",
        "08010 Barcelona Catalonia"
      ],
      "labeledLatLngs": [
        {
          "label": "display",
          "lat": 41.39174253552806,
          "lng": 2.177135786885419
        }
      ],
      "lat": 41.39174253552806,
      "lng": 2.177135786885419,
      "postalCode": "08010",
      "state": "Catalonia"
    },
    "name": "MOB - Makers of Barcelona",
    "stats": {
      "checkinsCount": 3025,
      "tipCount": 14,
      "usersCount": 698
    },
    "url": "http://www.mob-barcelona.com",
    "venueRatingBlacklisted": true,
    "verified": false
  }
}
```

...would get formatting into the following data for storage:

```
{
  "id": "foursquare-5a742260ea1e440aa76d01a4",
  "type": "checkins",
  "attributes": {
    "place-state": "Catalonia",
    "place-postal": "08010",
    "place-name": "MOB - Makers of Barcelona",
    "place-longitude": 2.177135786885419,
    "place-latitude": 41.39174253552806,
    "place-country-code": "ES",
    "place-country": "Spain",
    "place-city": "Barcelona",
    "place-category": "Coworking Space",
    "place-address": "C. Bailèn, 11",
    "likes-count": 0,
    "foursquare-venue-id": "4ed4fe31f5b975def54c94dd",
    "created-at": "2018-02-02T15:14:08+01:00"
  }
}
```
