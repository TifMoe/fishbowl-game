import React,  { Component } from 'react';
import fishbowl from '../assets/funfish.svg';

import './CardCounter.css'

class CelebrationFish extends Component {

    render() {
        return (
            <div>
                <div className="logo" style={{marginBottom: "100px"}}>
                    <img src={fishbowl} alt="logo" />
                </div>
            </div>
        )
    }
}

export default CelebrationFish;