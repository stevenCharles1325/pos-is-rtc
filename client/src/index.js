import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

window.port = '3500';
window.address = '192.168.158.167';

ReactDOM.render(
  <React.StrictMode>
    <Router basename="/">
      <App />   
    </Router>    
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

// clareClaaa 
// asdfasdfasdf@@S
