﻿import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [nickname, setNickname] = useState('');
    const [nicknameSet, setNicknameSet] = useState(false);
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        if (nicknameSet) {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl('https://localhost:7011/chatHub', { accessTokenFactory: () => nickname })// Pass the nickname
                .withAutomaticReconnect()
                .build();

            setConnection(newConnection);
        }

    }, [nicknameSet]);


    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => console.log('Connected to Hub'))
                .catch(err => console.error('Error connecting to Hub:', err));

            connection.on('ReceiveMessage', (message) => {
                setMessages(prevMessages => [...prevMessages, message]);
            });

            connection.on('UserCountUpdated', (count) => {
                setUserCount(count);
            });
        }
    }, [connection]);

    const sendMessage = async () => {
        if (connection && messageInput.trim() !== '') {
            await connection.send('SendMessage', nickname, messageInput);
            setMessageInput('');
        }
    };

    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };

    const setNicknameAndDisableInput = () => {
        setNicknameSet(true);
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>Users connected: {userCount}</div>
            {!nicknameSet &&
                <div>
                    <input
                        type="text"
                        value={nickname}
                        onChange={handleNicknameChange}
                    />
                    <button onClick={setNicknameAndDisableInput}>Set Nickname</button>
                </div>
            }
            {nicknameSet &&
                <div>
                    <div>
                        {messages
                            .filter(message => message.includes('has joined'))
                            .map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                    </div>
                    <div>
                        {messages
                            .filter(message => !message.includes('has joined'))
                            .map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                    </div>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            }
        </div>
    );
};

export default Chat;
