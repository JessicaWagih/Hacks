import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="nyc-container">
      <header className="nyc-header">
        <div className="badge">NYC METROPOLITAN RECOVERY</div>
        <h1>Lost & Found</h1>
        <p className="subtitle">
          Did something slip away on the subway, or did you rescue a misplaced treasure in the city that never sleeps? Let's get it home.
        </p>
      </header>

      <main className="action-grid">

        {/* report lost item */}
        <div className="card lost-card">
          <div className="card-icon">🚇</div>
          <h2>I Lost Something</h2>
          <p>
            Left your keys on the L train? Dropped a wallet in Brooklyn? File a report and let the community help you scan the boroughs.
          </p>
          <button className="btn btn-lost" onClick={() => alert('Navigate to Report Lost Item')}>
            Report Lost Item
          </button>
        </div>

        {/* report found item */}
        <div className="card found-card">
          <div className="card-icon">🗽</div>
          <h2>I Found Something</h2>
          <p>
            Did you pick up a stray umbrella, phone, or jacket? Be a New York hero and help reunite it with its owner.
          </p>
          <button className="btn btn-found" onClick={() => alert('Navigate to Report Found Item')}>
            Report Found Item
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;