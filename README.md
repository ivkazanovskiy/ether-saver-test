## Credentials for postgres DB

```bash
$ ./src/db/config/database.json
```

## Installation

```bash
$ npm install
```

## Create database

```bash
$ npm run db:create
```

## Migrate table to database

```bash
$ npm run db:migrate
```

## Start

Add your [personal API key](https://etherscan.io/myapikey) to .env

Without the key you will encounter with some fetching issue.

Huge delay (approximately 5000) will fix this if you don't have api key.

To set delay value or change minimal block you are interested in change the constants:

```bash
$ ./src/constants/index.ts
```

Then start the service:

```bash
$ npm start
```
