import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import UserFriendlyPropertyApp from './user_friendly_property_app';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserFriendlyPropertyApp />
  </React.StrictMode>
);

reportWebVitals();