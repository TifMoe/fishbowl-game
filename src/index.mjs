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

    this.sessions = new Set();
  }

  async initialize() {
    let stored = await this.storage.get("state");
    this.state = stored || this.initialState();
  }

  async handleSession(websocket, gameID) {
    websocket.accept()

    // Add our websocket to the list of connections for this game
    this.sessions.add(websocket);
  
    // We'll set up one event listener called message (per the docs: https://developers.cloudflare.com/workers/runtime-apis/websockets)
    // Our client will always send a message with a `name` field so we can switch on this for handling the request
    websocket.addEventListener("message", async msg => {

      let {event, data} = this.validate(websocket, msg.data, gameID);
      let currentState = this.state;

      switch (event.name) {
        // Listener when a game is first initialized with team names
        // We expect the data passed in will be {"name":"newGame","data":"{\"team_1\":\"Da\",\"team_2\":\"Bears\"}"}
        case 'newGame':
          this.state = this.initialState();

          // Initialize new game state with given team names
          this.state.teams.team_1.name = data.team_1;
          this.state.teams.team_2.name = data.team_2;

          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "newGame",  data: gameID}));
          this.broadcast(JSON.stringify({name: "gameState",  data: JSON.stringify(this.state)}));
          break;

        // Listener to return the game state
        case 'getGame':        
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(currentState)}));
          break;

        // Listener to force the game to end
        case 'endGame':
          currentState.current_round = 5; // This will force the game to the final score screen
          this.state = currentState;
          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to add a card to the game state
        case 'newCard':
          let newCard = data.value
          currentState.cards.push({
            id: Math.random().toString(36).slice(-10),
            value: newCard,
            used: false
          })
          currentState.unused_cards = ++currentState.unused_cards;
          this.state = currentState;

          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to start a new round
        case 'startRound':
          currentState.started = true;
          currentState.current_round = ++currentState.current_round,
          currentState.team_1_turn = (currentState.current_round % 2) // Team 1 should start for every odd round

          // Set all cards in game to `unused` state
          let resetCards = [];
          currentState.cards.forEach(function (card) {
            card.used = false;
            resetCards.push(card)
          })
          currentState.cards = resetCards;
          currentState.unused_cards = currentState.cards.length;
          this.state = currentState;

          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to start a new team turn
        case 'startNextTurn':
          currentState.team_1_turn = !currentState.team_1_turn
          this.state = currentState;

          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;

        // Listener to draw a random unused card
        case 'getRandomCard':
          let randIndex = 0
          let currentID = data.cardID == null ? '' : data.cardID;
          let unusedCards =  currentState.cards.filter(function(card) {
            return !card.used;
          });

          // If we have more than one card left in the round then make sure to avoid returning current card
          if (unusedCards.length > 1) {
            do {
              randIndex = Math.floor(Math.random() * unusedCards.length)
            }
            while (unusedCards[randIndex].id ===  currentID)
          }

          let returnCards = {
            card: unusedCards[randIndex],
            unused_cards: unusedCards.length
          }

          websocket.send(JSON.stringify({name: "randomCard", data: JSON.stringify(returnCards)}));
          break;

        // Listener to mark card as used
        case 'usedCard':
          let cardIndex = currentState.cards.findIndex((card => card.id == data.cardID));
          currentState.cards[cardIndex].used = true;
          currentState.unused_cards =  --currentState.unused_cards;

          // Increment point value for current team in current round
          if (currentState.current_round > 4) {
            websocket.send(JSON.stringify({error: "invalid round number"}));
          }
          let team = currentState.team_1_turn ? 'team_1' : 'team_2';
          let round = "round_" + currentState.current_round + "_pts";
          currentState.teams[team][round] = ++currentState.teams[team][round]
          this.state = currentState;

          await this.storage.put("state", this.state);
          this.broadcast(JSON.stringify({name: "gameState", data: JSON.stringify(this.state)}));
          break;
      }
    })
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    // Make sure we're fully initialized from storage.
    if (!this.initializePromise) {
      this.initializePromise = this.initialize().catch((err) => {
        this.initializePromise = undefined;
        throw err
      });
    }
    await this.initializePromise;

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

  initialState() {
    // Returns empty game state object
    return {
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
    };
  }

  // broadcast() broadcasts a message to all clients.
  broadcast(message) {
    // Apply JSON if we weren't given a string to start with.
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    // Iterate over all the sessions sending them messages.
    this.sessions.forEach(websocket => {
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