import React from 'react';
import Message from './Message';

function Messages({ messages }) {
  return (
    <div>
      {messages.map((m) => {
        return <Message key={m.key} msg={m} />;
      })}
    </div>
  );
}

export default Messages;
