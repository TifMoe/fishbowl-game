import React, { Component } from 'react';
import './Timer.css'

class Timer extends Component {

    constructor() {
        super();
        this.state = {
            minutes: 0,
            seconds: 45,
        }
    }

    componentDidMount() {
        this.myInterval = setInterval(() => {
            const { seconds, minutes } = this.state

            if (seconds > 0) {
                this.setState(({ seconds }) => ({
                    seconds: seconds - 1
                }))
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    this.props.timesUpHandler()
                    clearInterval(this.myInterval)
                } else {
                    this.setState(({ minutes }) => ({
                        minutes: minutes - 1,
                        seconds: 59
                    }))
                }
            } 
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
    }

    render() {
        const { minutes, seconds } = this.state
        return (
            <div>
                { minutes + seconds === 0
                    ? <p></p>
                    : <div className="timer">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div>
                }
            </div>
        )
    }
}

export default Timer