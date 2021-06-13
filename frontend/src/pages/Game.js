import React,  { Component } from 'react';
import { Parallax, ParallaxLayer } from "react-spring/renderprops-addons.cjs";
import { Container, Row, Col } from 'react-bootstrap';
import Confetti from 'react-confetti'

import Socket from '../Socket';

import CardInput from '../components/CardInput';
import GameTagHeader from '../components/GameTagHeader';
import DrawCard from '../components/DrawCard';
import GameStats from '../components/GameStats';
import ScoreKeeper from '../components/ScoreKeeper';
import CardCounter from '../components/CardCounter';
import CelebrationFish from '../components/CelebrationFish';
import RoundRules from '../components/RoundRules';
import Bubble from '../assets/Bubble.svg';

import './Game.css';


class GamePage extends Component {

  constructor(props) {
      super(props);
      this.gameId = this.props.match.params.gameId;
      this.socket = new Socket(this.gameId);
      this.state = {
          connected: false,
          ready: false,
          round: 0,
          team_1_turn: true,
          unused_cards: 0,
          team1: {
            name: "Team 1",
            round_1_pts: 0,
            round_2_pts: 0,
            round_3_pts: 0,
            round_4_pts: 0,
          },
          team2: {
            name: "Team 2",
            round_1_pts: 0,
            round_2_pts: 0,
            round_3_pts: 0,
            round_4_pts: 0,
          }
      }
  }

  saveState = (data) => {
    this.setState({
      team1: data.teams.team_1,
      team2: data.teams.team_2,
      team_1_turn: data.team_1_turn,
      ready: data.started,
      round: data.current_round,
      unused_cards: data.unused_cards,
    })
  }

  componentDidMount = () => {
    console.log("Setting up component")

    // handle connect and disconnect events.
    this.socket.on('connect', this.onConnect);
    this.socket.on('disconnect', this.onDisconnect); 

    /* EVENT LISTENERS */
    this.socket.on('cardCount', this.cardCount);
    this.socket.on('gameState', this.gameState)
  }

  // onConnect sets the state to true indicating the socket has connected successfully
  onConnect = () => {
      console.log("Connected!")
      this.setState({connected: true});
      this.getGame()
  }

  // onDisconnect sets the state to false indicating the socket has been disconnected
  onDisconnect = () => {
      this.setState({connected: false});
  }

  // cardCount is an event listener for updates to the card count
  cardCount = (data) => {
      this.setState({unused_cards: data})
  }

  // gameState is an event listener for updates to the game state
  gameState = (data) => {
      this.saveState(JSON.parse(data))
  }


  // EVENT EMITTER //
  // getGame is an event emitter to request game state on socket connection
  getGame = () => {
    let data = JSON.stringify({
        gameID: this.gameId
    });
    console.log('Fetching state for ', this.gameId);
    this.socket.emit('getGame', data);
  }

  componentSwitch = (socket) => {
    var title;
    var leftComponent;
    var rightComponent;

    switch (this.state.round) {
      // Initial game setup
      case 0:
        title = <h2>Setup your Game!</h2>;
        leftComponent = <CardInput gameId={this.gameId} socket={socket}/>;
        rightComponent = <CardCounter socket={this.socket}/>;
        break
      // Force end of game
      case 5:
        title = <WinnerCelebration />;
        leftComponent = <GameStats gameId={this.gameId} gameState={this.state} socket={socket}/>;
        rightComponent =  <CelebrationFish />;
        break
      // Transition to Game Stats page at the end of round 4
      case 4:
        if (this.state.unused_cards === 0) { // Natural end of game
          title = <WinnerCelebration />;
          leftComponent = <GameStats gameId={this.gameId} gameState={this.state} socket={socket}/>;
          rightComponent = <CelebrationFish />;
          break
        }
        // fallthrough
      default:
          title = <RoundTracker gameState={this.state}/>;
          leftComponent = <div>
              <DrawCard
                gameId={this.gameId}
                socket={socket}
                gameState={this.state}
              />
            </div>;
          rightComponent = <div>
              <CardCounter socket={socket} cardCount={this.state.unused_cards}/>
            </div>;
          break
    }
    return {
      "title": title,
      "leftComponent": leftComponent,
      "rightComponent": rightComponent,
    }
  }

  render() {
      const element  = this.componentSwitch(this.socket)
      const parallaxMarginLeft = window.innerWidth < 600 ? "80%" : "60%";
      const parallaxWidth = window.innerWidth < 600 ? "20%" : "40%";

      return (

        <Parallax pages={ window.innerWidth < 600 ? 3.5 : 2} style={{ backgroundColor: '#555F7D'}}>

        <ParallaxLayer offset={0} speed={1} style={{ backgroundColor: '#292C34' }}>
          <div className="Game-page">
            <Container fluid style={{ blockSize: "auto"}}>
              <div className="title"> {element.title} </div>
              <Row>
                <Col sm={6}> {element.leftComponent} </Col>
                <Col sm={6}> {element.rightComponent} </Col>
              </Row>
            </Container>
            </div>
          </ParallaxLayer>

          <ParallaxLayer offset={1} speed={.5} style={{ backgroundColor: '#555F7D'}}>
            <RoundRules/>
          </ParallaxLayer>

          <ParallaxLayer offset={.1} speed={.4} style={{ opacity: 0.4, width: parallaxWidth, marginLeft: parallaxMarginLeft }}>
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '90%' }} />
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '10%', marginLeft: '75%' }} />
          </ParallaxLayer>

          <ParallaxLayer offset={.5} speed={.75} style={{ opacity: 0.3, width: parallaxWidth, marginLeft: parallaxMarginLeft }}>
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '12%', marginLeft: '5%' }} />
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '85%' }} />
          </ParallaxLayer>

          <ParallaxLayer offset={.6} speed={.3} style={{ opacity: 0.5, width: parallaxWidth, marginLeft: parallaxMarginLeft }}>
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '15%', marginLeft: '80%' }} />
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '30%', marginLeft: '15%' }} />
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '7%' }} />
            <img src={Bubble} alt="bubble" style={{ display: 'block', width: '25%', marginLeft: '20%' }} />
          </ParallaxLayer>

          <GameTagHeader gameId={this.gameId} gameState={this.state}/>

        </Parallax>
      );
    }
  }


function RoundTracker({ gameState }) {
  return (
    <Row>
      <div className="round-name">
          <h2><b>Round {gameState.round}</b></h2>
          <ScoreKeeper gameState={gameState}/>
      </div>
    </Row>
  )
}

function WinnerCelebration() {
  return (
    <div>
        <h2>Congratulations!!</h2>
        <Confetti
            colors={['#555F7D', '#F25577', '#2EDDCB', '#F4F7B4', '#F2F2F2', '#BF2C5B', '#F6FB96']}
        />
    </div>
  )
}
  
  export default GamePage;