import React from 'react'
import ReactDOM from 'react-dom/client'
import MobileFeed from './main'
import { FirebaseAuthGate } from './auth/firebase-auth'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAuthGate>
      <MobileFeed />
    </FirebaseAuthGate>
  </React.StrictMode>,
)
