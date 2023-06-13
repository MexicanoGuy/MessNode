import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import'./App.css';
import {BrowserRouter} from 'react-router-dom';
import io from 'socket.io-client';
const root = ReactDOM.createRoot(document.getElementById('root'));
var backendURL = process.env.REACT_APP_BACKEND_SERVER_URL;
const socket = io.connect(
  backendURL ? backendURL : 'localhost:3001', 
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename='/'>
        <App socket={socket}/>
    </BrowserRouter>
  </React.StrictMode>
);
