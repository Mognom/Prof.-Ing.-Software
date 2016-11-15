# Eventus
## Index
* [Description](#description)
* [Deployment](#deployment)
	* [Software requiremnts](#softwarerequirements)
	* [Installation](#installation)
	* [Configuration](#configuration)
	* [Run](#Run)
* [API](#api)

Eventus is a web application designed to create and share events in your city.

## <a name="deployment"/> Deployment

### <a name="softwarerequirements"/> Software Requirements:
 - NodeJS: [Homepage](http://nodejs.org/).

### <a name="installation"/> Installation:


To install NodeJS dependencies, execute in the accounting-proxy folder:
```{bash}
npm install
```

### <a name="configuration"/> Configuration:

You can edit the configuration just editing the file /src/config.js. This file includes:
```
multer: {
	imgdest: "The path where the application is goint to store the images"
},
sqlite3: {
	filename: "The name of the SQLite3 file (By default ./database.sqlite3)"
}
```

### <a name="run"/> Run:

To run Eventus just execute:
```{bash}
node ./bin/www
```

And type in your browser: *http://localhost:8000*



## <a name="api"/> API

### Get all events

```
Method: GET
Url: http://localhost:8000/events
```

### Filter events by city

```
Method: GET
Url: http://localhost:8000/events?city=Madrid
```

### Create events

```{json}
Method: POST
Url: http://localhost:8000/events

Body:
{
"title": "Title of the event",
"description": "Description of the event",
"city": "City",
"location": "Place",
"date": "YYYY-MM-DD",
"hour": "hh:mm:ss"
}
```



---
Last updated: _15/11/2016

