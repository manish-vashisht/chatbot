import React, { useEffect, useRef, useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import ChatItem from '../components/chat/ChatItem';
import axios from 'axios';
import io from 'socket.io-client';
import NewChat from '../components/NewChat';
import { useDispatch } from 'react-redux';
import {
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';

const socket = io.connect('http://localhost:8000');

const Chat = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [sideChats, setSideChats] = useState([]);
  const [emptyMessage, setEmptyMessage] = useState(false);
  const [sideBar, setSideBar] = useState(true);
  const msgEnd = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    msgEnd.current.scrollIntoView();
  }, [chatMessages]);

  const handleSubmit = async () => {
    if (userPrompt.trim() !== '') {
      const content = userPrompt;
      const user = localStorage.getItem('current_user');
      setUserPrompt('');
      const newMessage = { role: 'user', content };
      setChatMessages((prev) => [...prev, newMessage]);
      setSideChats((prev) => [...prev, newMessage]);
      socket.emit('send_message', { message: newMessage, user });
      const response = await axios.post('/chat/new', {
        userPrompt,
      });
      const getMessage = { role: 'assistant', content: response.data };
      console.log(getMessage)
      setChatMessages((prev) => [...prev, getMessage]);
      socket.emit('received_message', { message: getMessage, user });
    } else {
      setEmptyMessage(true);
    }
  };

  const handleNew = () => {
    setChatMessages([]);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const user = localStorage.getItem('current_user');
        const response = await axios.get(
          `http://localhost:8000/chat/get-all-chats/${user}`
        );
        const data = await response.data;
        const allChats = data.chats.map((chat) => {
          const oldMessage = chat;
          setChatMessages((prev) => [...prev, oldMessage]);
          setSideChats((prev) => [...prev, oldMessage]);
          return '';
        });
        console.log(allChats)
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await axios.post('/user/logout');
      const data = await res.data;
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      localStorage.clear();
      dispatch(signOutUserSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleSideBar = () => {
    setSideBar(!sideBar);
  };

  return (
    <div className="chatpage-container">
      <div className="card">
        <div className="chat-details">
          {sideBar && (
            <div className="chat-banner">
              <div className="chat-banner-upper">
                <NewChat handleNew={handleNew} />
                <div className="previous-chats">
                  <h1>Previous Searches</h1>
                  <div className="side-chats">
                    {sideChats.map(
                      (chat) =>
                        chat.role === 'user' && (
                          <div className="side-chat-container">
                            <p className="side-chat-heading">{chat.content}</p>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
              <button onClick={handleSignOut}>LogOut</button>
            </div>
          )}
          <div className="arrow" onClick={handleSideBar}>
            <FaAngleLeft className={!sideBar && 'close'} />
          </div>
          <div className="chat-intro">
            <div className="chat-intro-inner">
              <div className="chat-intro-container">
                <h1 className="chat-intro-heading">GoodSpace GPT</h1>
                <div className="chat-conversation">
                  {chatMessages.map((chat, index) => (
                    <ChatItem
                      content={chat.content}
                      role={chat.role}
                      key={index}
                    />
                  ))}
                  <div ref={msgEnd} />
                </div>
              </div>
              <div className="submit-conversation">
                <input
                  type="text"
                  required
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (e.target.value.trim() === '') {
                        setEmptyMessage(true);
                      } else {
                        handleSubmit();
                      }
                    }
                  }}
                />
                <button type="submit" onClick={handleSubmit}>
                  <IoMdSend />
                </button>
              </div>
              {emptyMessage && (
                <p style={{ color: 'red' }}>Please enter your query!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
