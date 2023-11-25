import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import logo from '../../assets/logo.png';
import user from '../../assets/user.png';

function isCodeBlock(str) {
  if (
    str.includes('=') ||
    str.includes(';') ||
    str.includes('[') ||
    str.includes(']') ||
    str.includes('{') ||
    str.includes('}') ||
    str.includes('#') ||
    str.includes('//')
  ) {
    return true;
  }
  return false;
}

function extractCodeFromString(message) {
  if (message.includes('```')) {
    const blocks = message.split('```');
    return blocks;
  }
}

const ChatItem = ({ content, role }) => {
  const messageBlocks = extractCodeFromString(content);
  return role === 'assistant' ? (
    <div className="assistant-chat-item">
      {!messageBlocks && (
        <div className="message">
          <img src={logo} className="chat-profile" alt="Bot" />
          <div>
            <p>ChatBot</p>
            <p>{content}</p>
          </div>
        </div>
      )}
      {messageBlocks &&
        messageBlocks.length &&
        messageBlocks.map((block) =>
          isCodeBlock(block) ? (
            <SyntaxHighlighter style={coldarkDark} language="javascript">
              {block}
            </SyntaxHighlighter>
          ) : (
            <p>{block}</p>
          )
        )}
    </div>
  ) : (
    <div className="user-chat-item">
      {!messageBlocks && (
        <div className="message">
          <img src={user} className="chat-profile" alt="user" />{' '}
          <div>
            <p>You</p>
            <p>{content}</p>
          </div>
        </div>
      )}
      {messageBlocks &&
        messageBlocks.length &&
        messageBlocks.map((block) =>
          isCodeBlock(block) ? (
            <SyntaxHighlighter style={coldarkDark} language="javascript">
              {block}
            </SyntaxHighlighter>
          ) : (
            <p>{block}</p>
          )
        )}
    </div>
  );
};

export default ChatItem;
