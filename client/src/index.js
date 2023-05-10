import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import'./App.css';
import {BrowserRouter} from 'react-router-dom';
import io from 'socket.io-client';
const root = ReactDOM.createRoot(document.getElementById('root'));
const socket = io.connect(
  "https://messnode-backend.onrender.com:3001",
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename='/'>
        <App socket={socket}/>
    </BrowserRouter>
  </React.StrictMode>
);
