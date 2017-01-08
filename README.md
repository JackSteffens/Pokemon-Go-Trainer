## Pokémon Go Trainer
A work in progress project automating the Pokémon Go game.

## Installation requirements
- node.js [https://nodejs.org/]
- npm (comes bundled with node ^)
- mongoDB  [https://www.mongodb.com/]

Installing dependencies
- in the command line interface run :
    npm install

Start the mongoDB service :
- locate the installation folder (bin)
    "C:/Program Files/MongoDB/Server/3.0/bin" (or wherever you've installed it)
- in the command line interface run :
(windows cmd)         :   mongod.exe
(windows powershell)  :   ./mongod.exe
(mac os terminal)     :   ./mongod

Running the server:
  node server.js

View interface in browser :
  http://localhost:3000/

## Development requirements
Same as installation requirements plus :
- grunt-cli [npm install grunt-cli -g] (globally)

## Troubleshooting
Logging in with a Google account causes " 403 Forbidden "
- Accounts with 2 way authentication are currently not supported.
  Create an app password https://security.google.com/settings/security/apppasswords
