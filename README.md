# Fishbowl Online Game

React web app to play FishBowl remotely! Get your friends on a video call, share a link to the game, and have everyone throw a few nouns in the "bowl" to get started :) 

## Technologies
Frontend: **[React](https://create-react-app.dev/) app deployed with [Cloudflare Workers](https://workers.cloudflare.com/)**

Backend: **[Cloudflare Workers](https://workers.cloudflare.com/) + [Websockets](https://developers.cloudflare.com/workers/runtime-apis/websockets) + [Durable Objects](https://developers.cloudflare.com/workers/runtime-apis/durable-objects) backend**
This is v2 of my initial version here where I used a [GoLang]((https://golang.org/)) backend deployed to a [Kubernetes cluster](https://kubernetes.io/) on [Digital Ocean](https://www.digitalocean.com/) - this was not cost effective! Much happier to keep everything on the edge of Cloudflare's network by utilizing the new Durable Objects + Websockets support for Workers. 

Check out these cool blogs to learn more about Durable Objects and why they're awesome:
- https://blog.cloudflare.com/introducing-workers-durable-objects/
- https://blog.cloudflare.com/building-real-time-games-using-workers-durable-objects-and-unity/

CI/CD with [Github Actions](https://help.github.com/en/actions)

[![Deploy](https://github.com/TifMoe/fishbowl-game/actions/workflows/prod_deploy.yml/badge.svg)](https://github.com/TifMoe/fishbowl-game/actions/workflows/prod_deploy.yml)