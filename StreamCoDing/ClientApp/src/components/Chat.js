import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const Chat = ({ roomId }) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [nickname, setNickname] = useState('');
    const [nicknameSet, setNicknameSet] = useState(false);
    const [userCount, setUserCount] = useState(0);
    console.log(roomId)
    if (roomId == null) roomId = "public";
    useEffect(() => {
        if (nicknameSet) {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl('https://localhost:7011/chatHub', { accessTokenFactory: () => nickname })
                .withAutomaticReconnect()
                .build();

            newConnection
                .start()
                .then(() => {
                    console.log('Connected to Hub');
                    setConnection(newConnection);
                    // Join the chat room
                    newConnection.invoke('JoinRoom', roomId);
                })
                .catch(err => console.error('Error connecting to Hub:', err));

            newConnection.on('ReceiveMessageInRoom', (message) => {
                setMessages(prevMessages => [...prevMessages, message]);
            });

            newConnection.on('UserCountInRoomUpdated', (count) => {
                setUserCount(count);
            });

            // Add an event listener for beforeunload;
            // Add an event listener for unload (redirection within the page)
            window.addEventListener('unload', () => {
                newConnection.invoke('LeaveRoom', roomId);
            });

            return () => {
                // Remove the event listeners when the component unmounts
                window.removeEventListener('unload', () => {
                    newConnection.invoke('LeaveRoom', roomId);
                });
            };
        }
    }, [nicknameSet, roomId]);

    const sendMessageInRoom = async () => {
        if (connection && messageInput.trim() !== '') {
            await connection.send('SendMessageInRoom', roomId, nickname, messageInput);
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
                            .filter(message => message.includes('broadcasting message:::<<>>:::'))
                            .map((message, index) => (
                                <div key={index}>{message.substring(31)}</div>
                            ))}
                    </div>
                    <div>
                        {messages
                            .filter(message => !message.includes('broadcasting message:::<<>>:::'))
                            .map((message, index) => (
                                <div key={index}>{message}</div>
                            ))}
                    </div>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button onClick={sendMessageInRoom}>Send</button>
                </div>
            }
        </div>
    );
};

export default Chat;
