import React from 'react';
import { useSpring, animated } from 'react-spring'

import {ReactComponent as TitleImg} from '../assets/TitleImage.svg';

const AnimFeTurbulence = animated('feTurbulence')
const AnimFeDisplacementMap = animated('feDisplacementMap')

function TitleImage() {
    const { freq, scale, transform, opacity } = useSpring({
        from: { scale: 0, opacity: 0, transform: 'scale(0.9)', freq: '0.01, 0.0' },
        to: { scale: 100, opacity: 1, transform: 'scale(1)', freq: '0.0, 0.0' },
        config: { duration: 2000 }
      })
      return (
        <div className="TitleImg">
            <animated.svg style={{ transform, opacity }} viewBox="0 0 800 350" width="100%" height="100%">
            <defs>
                <filter id="water">
                <AnimFeTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="1" result="TURB" seed="8" />
                <AnimFeDisplacementMap xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="TURB" result="DISP" scale={scale} />
                </filter>
            </defs>
            <g filter="url(#water)">
                <TitleImg/>
            </g>
            </animated.svg>
        </div>
      )
}

export default TitleImage