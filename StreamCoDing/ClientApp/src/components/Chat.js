import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import html2canvas from 'html2canvas';

const CHUNK_SIZE = 1024; // Adjust the chunk size as needed
const Chat = ({ roomId }) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [nickname, setNickname] = useState('');
    const [nicknameSet, setNicknameSet] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [screenSharingActive, setScreenSharingActive] = useState(false); // New state to track screen sharing
    const [screenStream, setScreenStream] = useState(null);//array of bytes
    const [streamArray, setStreamArray] = useState([]);
    const videoRef = useRef(null);

    //console.log(roomId)
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
            
            newConnection.on('ReceiveScreenStream', (stream) => {
                console.log("receiving screenstream");
                if (stream === "start") {
                    const empty = [];
                    setStreamArray(empty);
                } else if (stream === "finish") {
                    console.log(streamArray);
                    var blob = new Blob([new Uint8Array(streamArray)], { type: 'image/png' });
                    var imgUrl = URL.createObjectURL(blob);
                    var imgElement = document.createElement('img');
                    imgElement.src = imgUrl;
                    // Append the image element to the DOM
                    document.body.appendChild(imgElement);
                    const empty = [];
                    setStreamArray(empty);
                } else {
                    var prev = streamArray;
                    var newstream = stream.slice(0, -1);
                    console.log(newstream);
                    const numbersArray = newstream.split(",").map(Number);
                    console.log(numbersArray);
                    for (var i = 0; i < numbersArray.length; i++){
                        prev.push(numbersArray[i]);
                    }               
                    setStreamArray(prev);
                    console.log(streamArray);
                    
                }

                
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
    // Function to start screen sharing
    const startScreenSharing = async () => {
        connection.invoke('StartScreenSharing', roomId);
        //await connection.send('SendScreenStream', roomId, "1234");
        try {
            const canvas = await html2canvas(document.documentElement);
            // Convert the canvas content to a blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to capture screenshot');
                    return;
                }

                // Convert the Blob to a byte array
                blob.arrayBuffer().then((arrayBuffer) => {
                    const byteArray = new Uint8Array(arrayBuffer);
                    // Send the byte array to the backend
                    connection.send('SendScreenStream', roomId, "start");
                    for (let i = 0; i < byteArray.length; i += CHUNK_SIZE) {
                        const chunk = byteArray.slice(i, i + CHUNK_SIZE);
                        var ss = "";
                        for (let j = 0; j < chunk.length; j++) {
                            ss += chunk[j].toString() + ",";
                        }
                        connection.send('SendScreenStream', roomId, ss);
                    }
                    connection.send('SendScreenStream', roomId, "finish");
                    // Send the byte array to the backend
                });
            }, 'image/jpeg');
        } catch (error) {
            console.error('Error capturing screenshot:', error);
        }
    };
 
    const stopScreenSharing = async () => {
        connection.invoke('StopScreenSharing', roomId);
        setScreenSharingActive(false);
    };

    useEffect(() => {
        if (screenStream) {
            // Set the received screen stream as the source object for the video element
            videoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

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
                    {screenSharingActive ? (
                        <button onClick={stopScreenSharing}>Stop Screen Sharing</button>
                    ) : (
                        <button onClick={startScreenSharing}>Start Screen Sharing</button>
                    )}
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
            {/* Video element to display the screen sharing stream */}
            <div>
                <video ref={videoRef} autoPlay controls />
            </div>
        </div>
    );
};


export default Chat;