import React,  { Component } from 'react';
import FishbowlImg from '../components/Fishbowl';
import { Container, Row, Col } from 'react-bootstrap';

import './CardCounter.css'

class CardCounter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cardCount: this.props.cardCount || 0,
        }
    }

    componentDidMount() {
        // EVENT LISTENERS //
        this.props.socket.on('cardCount', this.updateCount);
        this.props.socket.on('gameState', this.gameState);
      }
    
    componentWillUnmount() {
        this.props.socket.off('cardCount', this.updateCount);
        this.props.socket.off('gameState', this.gameState);
    }

    updateCount = (data) => {
        this.setState({ cardCount: data })
    }

    // gameState is an event listener for updates to the game state
    gameState = (data) => {
        let response = JSON.parse(data)
        this.setState({ cardCount: response.unused_cards })
    }

    // getGame is an event emitter to request game state on socket connection
    getGame = () => {
        let data = JSON.stringify({
            gameID: this.gameId
        });
        console.log('Fetching state for ', this.gameId);
        this.socket.emit('getGame', data);
      }

    render() {

        return (
            <Container>
                <Row>
                    <Col>
                        <FishbowlImg cardCount={this.state.cardCount}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="counter">
                            <div className="count">
                                <b>{this.state.cardCount}</b><br/>
                                cards
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default CardCounter;