import React, { Component } from 'react';

import './CardInput.css';

class CardInput extends Component {

    constructor() {
        super();
        this.state = {
            card: '',
            count: 0,
            showConfirmModal: false,
        };
    }

    componentDidMount() {
        // EVENT LISTENERS //
        this.props.socket.on('cardCount', this.cardCount);
    }

    componentWillUnmount() {
        this.props.socket.off('cardCount', this.cardCount);
    }

    cardCount = (data) => {
        console.log("Here's the new card count: ", data)
        this.setState({count: data})
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (this.state.card !== "") {
            this.newCard(this.state.card)
        } else {
            // TODO: front-end input validation and error handling
            console.log("Card cannot be blank")
        }
    }

    toggleModal() {
        // Close or open modal
        this.setState({
            showConfirmModal: !this.state.showConfirmModal,
        });
    }


    // EVENT EMITTERS //
    // newCard is an event emitter that sends a new card value to the backend
    newCard = (e) => {
        let data = JSON.stringify({
            gameID: this.props.gameId,
            value: capitalize(e)
        });
        console.log('Sending a new card...', data);
        this.props.socket.emit('newCard', data);
        this.setState({ card: "" })
    }


    // startGame is an event emitter that tells the backend to start a game
    startGame = () => {
        let data = JSON.stringify({
            gameID: this.props.gameId
        });
        console.log('Starting game ', this.props.gameId);
        this.props.socket.emit('startRound', data);
    }

    render() {
        const { card } = this.state;
        return (
            <div className="card-input">
                <div className="explainer">
                    <p> Invite players to submit nouns below to fill up your bowl! </p>
                    <p className="small-text"> ( 3-5 cards per player ) </p>
                </div>
                <div className="card-form">
                    <form onSubmit={this.onSubmit}>
                            <input
                                type="text"
                                name="card"
                                value={card}
                                maxLength="30"
                                minLength="2"
                                onChange={this.onChange}
                            />
                            <button type="submit">Drop it in!</button>
                    </form>
                </div>
                <StartGame startHandler={this.toggleModal.bind(this)} ready={this.state.count >= 3}/>
                {this.state.showConfirmModal ?
                    <ConfirmationModal
                        startHandler={this.startGame}
                        closeHandler={this.toggleModal.bind(this)}
                    /> : null
                }
            </div>
        );
    }
}

const StartGame = ({ startHandler, ready }) => (
    <div>
        <button
            className="start-button"
            onClick={startHandler}
            // TODO fix this validation after refactoring state management
            // disabled={!ready}
        >Start Game</button>
    </div>
)

const ConfirmationModal = ({ startHandler, closeHandler }) => (
    <div className='modal'>
        <div className='message'>
            <h1>Are you sure?</h1>
            <p>Make sure all other players have finished submitting their cards before starting game</p>
            <button
                className="button yes-confirm"
                onClick={startHandler}>Start!</button>
            <button
                className="close-button"
                onClick={closeHandler}>Nope</button>
        </div>
    </div>
)

function capitalize(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
}

export default CardInput; 