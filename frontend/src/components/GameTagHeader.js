import React, { Component } from 'react';
import './GameTagHeader.css';

class GameTagHeader extends Component {
    render() {
        let gameOver = this.props.gameState.round === 5 || (this.props.gameState.round === 4 && this.props.gameState.unused_cards === 0)
        return (
            <div>
                { gameOver? 
                <div className="header support">
                    If you had fun, consider supporting me at: <a href={`https://www.buymeacoffee.com/fishbowl`} className="support-link">
                    buymeacoffee.com/fishbowl
                    </a>
                </div>
                :
                <div className="header">
                    Send this link to the other players: <a href={`https://fishbowl.rocks/game/${this.props.gameId}`} className="Game-link">
                    fishbowl.rocks/game/{this.props.gameId}
                    </a>
                </div>
                }
            </div>

        );
    }
}

export default GameTagHeader; 