
import './App.css';
import React from 'react';
import Header from './Header';
import ParallaxImage from './ParallaxImage';
import ImageGallery from './ImageGallery';
import MissionStatement from './MissionStatement';
import PreEnrollment from './PreEnrollment';
import Address from "./Address"
//#D56F52
//#FACCB5
//#4E7A51


const App = () => {
    
    return (
        <div>
 
        <Header/>
            <ParallaxImage />

            <MissionStatement/>
            <ImageGallery/>
            <PreEnrollment/>
            <Address/>
        
        </div>
    );
};

export default App;
