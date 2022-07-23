import { connect, consumerOpts, createInbox, StringCodec } from 'nats.ws';
import React, { useEffect, useState } from 'react';
import Messages from './Messages';
const sc = StringCodec();

function App() {
  const [natsClient, setConnection] = useState(undefined);
  const [lastError, setError] = useState('');
  const [messages, setMessages] = useState([]);
  let key = 0;

  useEffect(() => {
    if (natsClient === undefined) {
      async function natsConnect() {
        const options = consumerOpts(); // creates a Consumer Options Object
        options.deliverNew(); // ensures that the newest message on the stream is delivered to the consumer when it comes online
        options.ackAll(); // acknowledges all previous messages
        options.deliverTo(createInbox()); // ensures that the Consumer listens to a specific Subject
        // options.callback(addMessage);
        try {
          const natsClient = await connect({ servers: ['ws://0.0.0.0:8080'] });
          setConnection(natsClient);
          const jetStream = natsClient.jetstream();
          const subscribedStream = await jetStream.subscribe('>', options);

          await (async () => {
            for await (const msg of subscribedStream) {
              addMessage(msg);
            }
          })();
        } catch (err) {
          setError('error connecting');
          console.error(err);
        }
      }
      const addMessage = (msg) => {
        key++;
        const { subject, reply } = msg;
        const data = sc.decode(msg.data);
        const m = { subject, reply, data, key, time: new Date().toUTCString() };
        console.log('🚀 ~ file: App.js ~ line 42 ~ addMessage ~ data', data);
        messages.unshift(m);
        const a = messages.slice(0, 10);
        setMessages(a);
      };
      natsConnect();
    }
  }, [key, messages, natsClient]);
  const state = natsClient ? 'connected' : 'not yet connected';
  return (
    <div className="container">
      <h1>{state}</h1>
      <h3>{lastError ? lastError : ''}</h3>
      {messages.length > 0 && lastError === '' ? (
        <Messages messages={messages} />
      ) : (
        'No messages'
      )}
    </div>
  );
}

export default App;
