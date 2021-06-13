import React,  { Component } from 'react';

import { ReactComponent as Fishbowl } from '../assets/FishbowlBase.svg';

class FishbowlImg extends Component {

    getPebbles = (count) => {
        let coordinates = [
            ["29%", "74%"],
            ["37%", "73%"],
            ["61.5%", "74%"],
            ["50%", "74.5%"],
            ["44%", "70%"],
            ["56%", "71%"],
            ["44%", "74.5%"],
            ["70%", "69%"],
            ["21.5%", "70%"],
            ["29%", "68%"],
            ["64%", "67%"],
            ["50%", "66%"],
            ["37%", "65%"],
            ["17%", "66%"],
            ["75%", "64%"],
            ["57%", "73%"],
            ["23%", "62%"],
            ["57%", "63%"],
            ["67%", "61%"],
            ["33%", "74%"]
        ]

        if (count >= coordinates.length) {
            count = coordinates.length
        }

        let pebbles = []
        for (let i = 0; i < count; i++) {
            if (count > 0) {
                pebbles.push(getPebble(coordinates[i][0], coordinates[i][1]))
            }
        }
        return pebbles
    }

    render() {
        return (
            <div>
                <svg viewbox="419 182 459 446" height="250px" width="250px">
                    <Fishbowl 
                        width="100%" 
                        display="block"
                        x="0"
                        y="-190" />
                    {this.getPebbles(this.props.cardCount)}
                </svg>
            </div>
        )
    }
}


function getPebble(x, y) {
    // Utility function to render a single pebble
    return (
        <svg x={x} y={y} width="25" height="25" viewBox="574.207 552.471 42.606 41.701" >
                <path d=" M 582.393 581.081 C 577.369 576.878 575.681 569.63 578.726 563.511 C 581.99 556.952 589.567 553.948 596.321 556.226 C 599.407 555.564 602.729 555.908 605.771 557.422 C 612.936 560.987 615.858 569.699 612.293 576.864 C 611.756 577.943 611.102 578.925 610.353 579.803 C 610.103 580.932 609.712 582.049 609.174 583.13 C 605.609 590.295 596.897 593.217 589.733 589.652 C 586.084 587.836 583.535 584.685 582.393 581.081 Z " fill-rule="evenodd" fill="rgb(184,191,213)" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(85,95,125)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="2"></path>
                <path  d=" M 585.32 580.431 C 585.825 581.559 587.387 582.274 589.519 582.5 L 595.139 577.561 L 585.32 580.431 Z " fill="rgb(243,238,241)"></path>
                <path  d=" M 605.269 561.433 C 603.752 559.57 601.187 558.696 598.263 558.825 L 594.802 568.926 L 605.269 561.433 Z " fill="rgb(243,238,241)"></path>
                <path d=" M 579.666 577.275 C 578.706 576.489 577.879 575.581 577.184 574.592 C 577.999 577.167 579.534 579.51 581.674 581.301 C 582.817 584.905 585.365 588.056 589.014 589.872 C 596.179 593.437 604.89 590.515 608.456 583.35 C 608.994 582.269 609.384 581.152 609.635 580.023 C 610.384 579.145 611.037 578.163 611.574 577.084 C 614.041 572.127 613.403 566.431 610.394 562.215 C 611.511 565.681 611.324 569.569 609.574 573.084 C 609.037 574.163 608.384 575.145 607.635 576.023 C 607.384 577.152 606.994 578.269 606.456 579.35 C 602.89 586.515 594.179 589.437 587.014 585.872 C 583.356 584.052 580.804 580.89 579.666 577.275 Z " fill="rgb(85,95,125)" fill-opacity="0.53" ></path>
        </svg>
    )
}

export default FishbowlImg;
