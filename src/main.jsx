import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import ServerAccess from './ServerAccess';
import '../ui-kit/xbuddy/styles/compiled.css';
import './business.css';
createRoot(document.getElementById('root')).render(<ServerAccess><App/></ServerAccess>);
