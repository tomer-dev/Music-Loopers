import React, {Component} from 'react';
import logo from '../../assets/sol clef.svg';
import './App.css';
import 'typeface-roboto';
import Playlist from '../Playlist';

class App extends Component {
    render() {
       return (
            <div className="App-root">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Musico</h1>
                </header>
                <div className="App-content">
                    <Playlist/>
                </div>
            </div>
        );
    }
}

export default App;
