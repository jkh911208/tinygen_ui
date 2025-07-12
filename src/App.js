import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const renderDiff = (diffContent) => {
    if (!diffContent) return null;

    return diffContent.split('\n').map((line, index) => {
      let style = {};
      if (line.startsWith('+')) {
        style = { backgroundColor: '#d4edda', color: '#155724' }; // Light green background, dark green text
      } else if (line.startsWith('-')) {
        style = { backgroundColor: '#f8d7da', color: '#721c24' }; // Light red background, dark red text
      }
      return (
        <span key={index} style={{ display: 'block', ...style }}>
          {line}
        </span>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null); // Clear previous response
    setError(null);     // Clear previous error

    try {
      const res = await fetch('http://localhost:8000/gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TinyGen UI</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="url-input">URL:</label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              style={{ width: '300px', padding: '8px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label htmlFor="prompt-input">Prompt for LLM:</label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for the LLM"
              rows="5"
              style={{ width: '300px', padding: '8px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
            ></textarea>
          </div>
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Generate
          </button>
        </form>

        {response && Object.keys(response).map((filename) => (
          <div key={filename} style={{ marginTop: '20px', textAlign: 'left', width: '90%' }}>
            <h2>File: {filename}</h2>
            <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflowX: 'auto', color: 'black' }}>
              {renderDiff(response[filename])}
            </pre>
          </div>
        ))}

        {error && (
          <div style={{ marginTop: '20px', color: 'red' }}>
            <h2>Error:</h2>
            <p>{error}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
