// Worker

// `handleErrors()` is a little utility function that can wrap an HTTP request handler in a
// try/catch and return errors to the client. You probably wouldn't want to use this in production
// code but it is convenient when debugging and iterating.
async function handleErrors(request, func) {
  console.log('in the handle!')

  try {
    return await func();
  } catch (err) {
    if (request.headers.get("Upgrade") == "websocket") {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      let pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({error: err.stack}));
      pair[1].close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: pair[0] });
    } else {
      return new Response(err.stack, {status: 500});
    }
  }
}

export default {
  async fetch(request, env) {
    return await handleErrors(request, async () => {
      // We have received an HTTP request! Parse the URL and route the request.
      let url = new URL(request.url);
      let path = url.pathname.slice(1).split('/');

      if (!path[0]) {
        // Serve our HTML at the root path.
        return new Response("Not found", {status: 404});
      }

      switch (path[0]) {
        case "api":
          // This is a request for `/api/...`, call the API handler.
          // We will only pass in the rest of the path after /api/
          return handleAPIRequest(path.slice(1), request, env);

        default:
          return new Response("Not found", {status: 404});
      }
    });
  }
}

function generateNewName() {
  let nouns = [
    "singer", "drawing", "success", "definition", "guidance", "goose",
    "booger", "construction", "skill", "importance", "presentation", "rhino",
    "ladder", "salad", "queen", "dealer", "perspective", "height", "flamingo",
    "highway", "toe", "pie", "industry", "context", "contribution", "nanny",
    "statement", "unit", "resolution", "union", "king", "minion", "european",
    "economics", "obligation", "cabinet", "interaction", "awareness", "american", 
    "independence", "variation", "youth", "problem", "management", "president",
    "quality", "reading", "boyfriend", "selection", "teardrop", "toddler",
    "hat", "stranger", "litigation", "outcome", "meat", "mood", "fire"
  ]
  let noun = nouns[Math.floor(Math.random() * nouns.length)];

  let adjectives = [
    "stout", "rural", "anxious", "imminent", "dispensable", "popular", "flubby",
    "rambling", "meaty", "magnificent", "gaping", "uninterested", "nice", "booming",
    "easy", "unequal", "tidy", "nutritious", "cuddly", "quarrelsome", "oval", 
    "worthless", "greedy", "needless", "decorous", "thick", "nondescript", "loony",
    "labored", "spiffy", "deranged", "former", "ubiquitous", "roomy", "glib", "looming",
    "imported", "questionable", "wild", "fabulous", "woebegone", "electric", 
    "berserk", "awesome", "beautiful", "efficacious", "boorish", "lacking", 
    "long", "thoughtful", "intelligent", "grubby", "confused", "nosey", "teeny"
  ]
  let adj = adjectives[Math.floor(Math.random() * adjectives.length)];

  return adj + "-" + noun; 
}

async function handleAPIRequest(path, request, env) {
  // We've received an API request. Route the request based on the game ID in the path.
  let newUrl = new URL(request.url); 
  let namespace;

  switch (path[0]) {
    // We need to instantiate a new game ID and create a Durable Objects instance for this game
    case "new-game": 
      // TODO generate new game ID
      namespace = generateNewName();
      break;
      
    // We need to fetch an existing Game      
    case "game":
      // This will pull the gameID from path like `api/game/<gameID>
      namespace = path[1];
      break;

    default:
      return new Response("Not found", {status: 404});
  }

  // Overwrite the path of the request URL with our new namespace for the game Object
  newUrl.pathname = namespace;

  let id = env.GAME.idFromName(namespace)
  let gameObject = env.GAME.get(id);
  let res = await gameObject.fetch(newUrl, request);
  console.log(res)
  return res;
}

// Durable Object

export class Game {
  constructor(controller, env) {
    // `controller.storage` provides access to our durable storage. It provides a simple KV
    // get()/put() interface.
    this.storage = controller.storage;

    // `env` is our environment bindings (discussed earlier).
    this.env = env;

    this.sessions = []

    this.state = {
      current_round: 0,
      started: false,
      team_1_turn: true,
      unused_cards: 0,
      cards: [],
      teams: {
        team_1: {
          name: "",
          round_1_pts: 0,
          round_2_pts: 0,
          round_3_pts: 0,
          round_4_pts: 0,
        },
        team_2: {
          name: "",
          round_1_pts: 0,
          round_2_pts: 0,
          round_3_pts: 0,
          round_4_pts: 0,
        }
      }
    }
  }

  async handleSession(websocket, gameID) {
    websocket.accept()

    // Create our session and add it to the sessions list.
    let session = {websocket};
    this.sessions.push(session);
  
    // We'll set up one event listener called message (per the docs: https://developers.cloudflare.com/workers/runtime-apis/websockets)
    // Our client will always send a message with a `name` field so we can switch on this for handling the request
    websocket.addEventListener("message", async msg => {

      let {event, data} = this.validate(websocket, msg.data, gameID);

      switch (event.name) {
        // Listener when a game is first initialized with team names
        // We expect the data passed in will be {"name":"newGame","data":"{\"team_1\":\"Team Name\",\"team_2\":\"Another Thing\"}"}
        case 'newGame':
          
          // Initialize new game state with given team names
          this.state.teams.team_1.name = data.team_1;
          this.state.teams.team_2.name = data.team_2;
          let dataStr = this.state

          await this.storage.put("state", dataStr);
          websocket.send(JSON.stringify({name: "newGame", data: gameID}));
          break;

        // Listener to return the game state
        case 'getGame':        
          this.state = await this.storage.get("state");
          websocket.send(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;
          // this.broadcast(JSON.stringify({name: "gameState", data: state}));

        // Listener to add a card to the game state
        case 'newCard':
          this.state = await this.storage.get("state");
          let newCard = data.value
          this.state.cards.push({
            id: Math.random().toString(36).slice(-10),
            value: newCard,
            used: false
          })
          this.state.unused_cards = ++this.state.unused_cards;

          await this.storage.put("state", this.state);
          websocket.send(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to start a new round
        case 'startRound':
          this.state = await this.storage.get("state");
          this.state.started = true;
          this.state.current_round = ++this.state.current_round,
          this.state.team_1_turn = (this.state.current_round % 2) // Team 1 should start for every odd round

          // Set all cards in game to `unused` state
          this.state.cards.forEach(function (card) {
            card.used = false;
          })
          this.state.unused_cards = this.state.cards.length;

          await this.storage.put("state", this.state);
          websocket.send(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to draw a random unused card
        case 'getRandomCard':
          this.state = await this.storage.get("state");
          let unusedCards =  this.state.cards.filter(function(card) {
            return !card.used;
          });

          // Only send back unused cards in game state
          this.state.cards = unusedCards;
          this.state.unused_cards = unusedCards.length;

          websocket.send(JSON.stringify({name: "randomCard", data: JSON.stringify(this.state)}));
          break;

        // Listener to mark card as used
        case 'usedCard':
          this.state = await this.storage.get("state");
          let cardIndex = this.state.cards.findIndex((card => card.id == data.cardID));
          this.state.cards[cardIndex].used = true;
          this.state.unused_cards =  --this.state.unused_cards;

          await this.storage.put("state", this.state);
          websocket.send(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;
      }
    })
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    return await handleErrors(request, async () => {
      // We expect that a client is trying to establish a new websocket connection
      if (request.headers.get("Upgrade") != "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      // Request URL will contain the gameID in the path like `wss://hostname/<gameID>`
      let url = new URL(request.url);
      let gameID = url.pathname.split('/')[1];

      // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
      // i.e. two WebSockets that talk to each other), we return one end of the pair in the
      // response, and we operate on the other end. 
      let pair = new WebSocketPair();
      const [client, server] = Object.values(pair)

      await this.handleSession(server, gameID);
      return new Response(null, { status: 101, webSocket: client });
    })
  }

  // broadcast() broadcasts a message to all clients.
  broadcast(message) {
    // Apply JSON if we weren't given a string to start with.
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    // Iterate over all the sessions sending them messages.
    this.sessions = this.sessions.forEach(websocket => {
        try {
          websocket.send(message);
          return true;
        } catch (err) {
          // Whoops, this connection is dead. 
          websocket.quit = true;
          return false;
        }
      }
    );
  }

  // Validate that the event message has expected keys and return parsed event name and data
  validate(websocket, message, gameID) {
    let event = JSON.parse(message);
    if (!'data' in event) {
      websocket.send(JSON.stringify({error: "Data required in message event"}));
    }

    let data = JSON.parse(event.data)

    // If first request of a game, only validate that team names are included, there will be no gameID
    if (event.name === 'newGame') {
      if (!data.team_1 || !data.team_2) {
        websocket.send(JSON.stringify({error: "Team names are required"}));
      }
      return {event, data}
    }

    if (data.gameID !== gameID) {
      websocket.send(JSON.stringify({error: "Invalid gameID " + gameID + " does not match data " + data.gameID}));
    }

    return {event, data}
  }
}