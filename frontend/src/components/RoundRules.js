import React,  { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import "./RoundRules.css"
import rules from './../gameRules.json';

//style={{minHeight: "500px", width:"100%"}}

// TODO: The cards here could be looped to reduce repeated code
class RoundRules extends Component {
    render() {
        const rounds = rules.rounds;
        return (
            <Container style={{marginTop: "50px"}}>
                <Row>
                    <Col> 
                        <h1 style={{color: "white"}}>4 Games in one!!</h1> 
                        <p style={{color: "white"}}> 
                            Each team will take turns with one of their members drawing cards and trying to get the rest of the team
                            to guess the value. The player giving clues will have 45 seconds to go through as many cards as they can following
                            the rules below for each round.
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <div className="rules-card">
                            Round 1
                            <div className="round-title">
                                {rounds[0].name}
                            </div>
                            <div className="round-rules">
                                {rounds[0].rules}
                            </div>
                        </div>
                    </Col>
                    <Col sm={3}>
                        <div className="rules-card">
                            Round 2
                            <div className="round-title">
                                    {rounds[1].name}
                                </div>
                                <div className="round-rules">
                                    {rounds[1].rules}
                                </div>
                            </div>
                    </Col>
                    <Col sm={3}>
                        <div className="rules-card">
                            Round 3
                            <div className="round-title">
                                    {rounds[2].name}
                                </div>
                                <div className="round-rules">
                                    {rounds[2].rules}
                                </div>
                            </div>
                    </Col>
                    <Col sm={3}>
                        <div className="rules-card">
                            Round 4
                            <div className="round-title">
                                    {rounds[3].name}
                                </div>
                                <div className="round-rules">
                                    {rounds[3].rules}
                                </div>
                            </div>
                    </Col>
            </Row>
            <h2 style={{paddingTop: "20px", color:"white"}}>Now head back up to enter your team names and get started!</h2>
        </Container>
        )
    }
}

export default RoundRules;