import React from 'react';
import { useHistory } from "react-router-dom";
import { Parallax, ParallaxLayer } from "react-spring/renderprops-addons.cjs";

import './Home.css';
import Bubble from '../assets/Bubble.svg';
import NewGame from '../components/NewGame';
import TitleImage from '../components/TitleImage';
import RoundRules from '../components/RoundRules';

function HomePage() {
    const history = useHistory();
    return (
      <Parallax pages={ window.innerWidth < 768 ? 3.5 : 2} style={{ backgroundColor: '#555F7D'}}>

      <ParallaxLayer offset={0} speed={1} style={{ backgroundColor: '#292C34' }}>
        <header className="Home-header">
            <TitleImage />
            <div className="intro">
              <p>Play fishbowl online over video calls with friends and family</p>
              <NewGame history={history}/>
              <p className="small-text" style={{height: "900px"}}>Keep scrolling to check out the game rules or enter two cool team names above to get started!</p>
            </div>
          </header>
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={.5} style={{ backgroundColor: '#555F7D'}}>
          <RoundRules/>
        </ParallaxLayer>

        <ParallaxLayer offset={.1} speed={1} style={{ opacity: 0.4, width: "30%"}}>
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '40%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '10%', marginLeft: '55%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={.3} speed={.7} style={{ opacity: 0.3, width: "30%" }}>
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '12%', marginLeft: '5%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '85%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={.5} speed={.5} style={{ opacity: 0.5, width: "30%"  }}>
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '15%', marginLeft: '75%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '30%', marginLeft: '15%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '7%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '25%', marginLeft: '20%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={.6} speed={.2} style={{ opacity: 0.4, width: "30%" }}>
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '20%', marginLeft: '30%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '10%', marginLeft: '70%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={0.3} style={{ opacity: 0.5}}>
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '5%', marginLeft: '20%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '10%', marginLeft: '70%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '15%', marginLeft: '10%' }} />
          <img src={Bubble} alt="bubble" style={{ display: 'block', width: '10%', marginLeft: '75%' }} />
        </ParallaxLayer>

        </Parallax>
    );
  }
  
  export default HomePage;