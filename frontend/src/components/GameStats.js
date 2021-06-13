import React, { Component } from 'react'
import { Container, Row, Col, Table } from 'react-bootstrap';

import './GameStats.css';

class GameStats extends Component {

    // newGame is event emitter to tell backend to start new game in namespace
    newGame = () => {
        let data = JSON.stringify({
            gameID: this.props.gameId,
            team_1: this.props.gameState.team1.name,
            team_2: this.props.gameState.team2.name,
        });
        this.props.socket.emit('newGame', data);
    }

    render() {
        const team1 = this.props.gameState.team1
        const team2 = this.props.gameState.team2
        const team1Color = "rgb(242, 85, 119)"
        const team2Color = "rgb(46, 221, 204)"

        let team1pts = getTotal(team1)
        let team2pts = getTotal(team2)

        let winner = (team1pts > team2pts ? team1.name : team2.name) + " Wins!!"
        let winnerColor = team1pts > team2pts ? team1Color : team2Color

        if (team1pts === team2pts) {
            winner = `${team1.name} and ${team2.name} have tied!!`
            winnerColor = "#292C34"
        }

        return (
            <div>
                <Container style={{marginLeft: window.innerWidth < 600 ? "0%" : "10%"}}>
                    <Row style={{
                        paddingTop: "25px",
                        paddingBottom: "25px",
                        marginTop: "50px",
                        backgroundColor: "white"
                    }}>
                        <Col style={{color: winnerColor, fontWeight: "bold"}}>
                            <h2>{winner}</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Table style={{backgroundColor: "white", color: "#292C34"}}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th style={{color: team1Color}}>{team1.name}</th>
                                    <th style={{color: team2Color}}>{team2.name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getRows(this.props.gameState)}
                            </tbody>
                        </Table>
                    </Row>
                    <Row>
                        <Col>
                            <button onClick={this.newGame} className="next-round">
                                Start New Game
                            </button>
                        </Col>
                    </Row>
             </Container>
            </div>
            )
    }
}


function getRows(data) {
    let lastRound = 4 // Assume all rounds finished until check below
    let team1 = [data.team1.round_1_pts, data.team1.round_2_pts, data.team1.round_3_pts, data.team1.round_4_pts]
    let team2 = [data.team2.round_1_pts, data.team2.round_2_pts, data.team2.round_3_pts, data.team2.round_4_pts]

    for(var i = 0; i < team1.length; i++){
        if (team1[i] + team2[i] === 0) {
            lastRound = i
            break;
        }
    }
    let rows = []
    for (let i = 0; i < lastRound; i++) {
        rows.push(buildRow(i, team1, team2))
    }

    rows.push(buildTotal(team1, team2))
    return rows
}

function buildRow(round, team1pts, team2pts) {
    let team1winner = team1pts[round] > team2pts[round];
    let team1Color = "rgb(242, 85, 119, .5)";
    let team2Color = "rgb(46, 221, 204, .5)";
    let tie = team1pts[round] === team2pts[round]

    return (
        <tr>
            <td>Round {round + 1}</td>
            <td style={{
                backgroundColor: team1winner && !tie ? team1Color : "white"
            }}>{team1pts[round]}</td>
            <td style={{
                backgroundColor: team1winner || tie ? "white" : team2Color
            }}>{team2pts[round]}</td>
        </tr>
    )
}

function buildTotal(team1pts, team2pts) {
    let team1Total = team1pts.reduce((a, b) => a + b, 0)
    let team2Total = team2pts.reduce((a, b) => a + b, 0)
    let team1winner =  team1Total > team2Total

    let team1Color = "rgb(242, 85, 119, .9)";
    let team2Color = "rgb(46, 221, 204, .9)";
    let tie = team1Total === team2Total
    return (
        <tr style={{backgroundColor: "#5F6167", fontWeight: "bold", color: "white"}}>
            <td>Total</td>
            <td style={{
                backgroundColor: team1winner && !tie ? team1Color : "#5F6167"
            }}>{team1Total}</td>
            <td style={{
                backgroundColor: team1winner || tie ? "#5F6167" : team2Color
            }}>{team2Total}</td>
        </tr>
    )
}

function getTotal(team) {
    return (
        team.round_1_pts + team.round_2_pts + team.round_3_pts + team.round_4_pts
    )
}

export default GameStats