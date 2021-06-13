import React, { Component } from 'react';
import Socket from '../Socket';
import MyError from './MyError';

import './NewGame.css';

class NewGame extends Component {

    constructor() {
        super();
        this.state = {
            connected: false,
            gameName: 'pending',
            team1: "",
            team2: "",
            ok: false,
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.routeChange = this.routeChange.bind(this);
        this.newGame = this.newGame.bind(this);
    }


    componentDidMount() {
        let socket = this.socket = new Socket();
        socket.on('connect', this.onConnect);
    
        /* EVENT LISTENERS */
        socket.on('newGame', this.newGame);
    }

    componentWillUnmount() {
        console.log("Signing off connection from new game!")
        this.socket.off('connect', this.onConnect);
        this.socket.off('newGame', this.newGame);
        this.socket.close();
        this.setState({connected: false});
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        if ( this.state.team1.length > 1 && this.state.team2.length > 1) {
            this.setState({ ok: true });
        }
    }

    routeChange = () => {
        let path = `/game/${this.state.gameName}`; 
        this.props.history.push(path)
    }

    // onConnect sets the state to true indicating the socket has connected 
    //    successfully.
    onConnect = () => {
        console.log("Connected to websocket!!")
        this.setState({connected: true});
    }
  
    // onDisconnect sets the state to false indicating the socket has been 
    //    disconnected.
    onDisconnect = () => {
        this.socket.close();
    }

    newGame = (data) =>{
        this.setState(() => {
            return { gameName: data }
        });
        this.routeChange();
    }

    onSubmit(e) {
        e.preventDefault();
        try {
            // Save team names and fetch new game namespace
            if (this.state.team1 !== "" && this.state.team2 !== "") {
                    let data = JSON.stringify({
                        team_1: capitalize(this.state.team1),
                        team_2: capitalize(this.state.team2),
                    });
                    console.log("Sending team names to server: ", data)
                    this.socket.emit('newGame', data);
            } else {
                // TODO: We should raise input validation error here
                console.log("Team names are required to start a new game!");
            }
        } catch (err) {
            Sentry.captureException(err);
        }
      }

    render() {
        const { team1 } = this.state;
        const { team2 } = this.state;

        return (
        <div>
            <div className="card-form">
                <form onSubmit={this.onSubmit}>
                    <input
                        className="team-input pink"
                        type="text"
                        name="team1"
                        placeholder="Team 1 Name"
                        value={team1}
                        maxLength="30"
                        minLength="2"
                        onChange={this.onChange}
                    />
                    <input
                        className="team-input blue"
                        type="text"
                        name="team2"
                        placeholder="Team 2 Name"
                        value={team2}
                        maxLength="30"
                        minLength="2"
                        onChange={this.onChange}
                    />

                    <button type="submit" disabled={!this.state.ok}> Start a new game! </button>
                </form>
            </div>
        </div>
        );
    }
}

function capitalize(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
}

export default NewGame; 