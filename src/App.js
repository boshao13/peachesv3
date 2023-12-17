
import './App.css';
import React from 'react';
import Header from './Header';
import ParallaxImage from './ParallaxImage';
import ImageGallery from './ImageGallery';
import MissionStatement from './MissionStatement';



const App = () => {
    return (
        <div>
 
            <Header />
            <ParallaxImage />
            <MissionStatement/>
            <ImageGallery/>
        
        </div>
    );
};

export default App;
