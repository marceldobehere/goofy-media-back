# Goofy Media Backend
This is the backend for Goofy Media.

Frontend: https://github.com/marceldobehere/goofy-media-front

Currently very WIP.

(More details will follow with time)



### Requirements 

Requires the nodejs packages in the `package.json` file.

Requires a `.env` file with the following variables:
```
DB_USER="..."
DB_PASS="..."
DB_URL="mongodb+srv://..."
```


### How to run
* `npm install`
* `npm start`


## Deployment

## How to deploy on a local Server
Docker


## How to deploy on Deno
* [Create](https://www.mongodb.com) a MongoDB database
* [Install Deno](https://docs.deno.com/runtime/getting_started/installation/)
* `deno install -gArf jsr:@deno/deployctl`
* Run the following command to deploy the project:
  * Change the project name in `--project=[PROJECT-NAME]` to the name of your project
  * `deployctl deploy --project=[PROJECT-NAME] --include=**/*.js --include=**/*.json --entrypoint api/index.js`
* Go to the project and add the `DB_URL` environment variable to the project
