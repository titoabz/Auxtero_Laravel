import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };

  return (
    <>
      <HeaderBar />
      <div className="container mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="m-0">Chat</h4>
          </div>
          <div className="card-body" style={{height: '500px', overflowY: 'auto'}}>
            {messages.length === 0 ? (
              <div className="text-center text-muted py-5">
                <h5>No messages yet</h5>
                <p>Start a conversation</p>
              </div>
            ) : (
              <div>
                {messages.map(msg => (
                  <div key={msg.id} className={`mb-3 ${msg.sender === 'me' ? 'text-end' : ''}`}>
                    <div className={`d-inline-block p-3 rounded ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-light'}`}>
                      <div>{msg.text}</div>
                      <small className="opacity-75">{msg.timestamp.toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-footer">
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Send</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
