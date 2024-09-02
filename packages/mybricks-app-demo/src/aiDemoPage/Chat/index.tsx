import React from 'react';
import './litewebchat.css';
import './chatinput.css';
import './chatbox.css';
import UserAvatar from './icons/user';
import AIAvatar from './icons/ai';

const ChatMessage = ({ message }) => {
  const { type, content, position, name, isLoading } = message;

  const Avatar = position === 'right' ? UserAvatar : AIAvatar;

  return (
    <div className={`cmsg ${position === 'right' ? 'cright' : 'cleft'}`}>
      <Avatar className="headIcon" style={{
        width: '34px',
        height: '34px',
        top: '9px',
        position: 'absolute',
        ...(position === 'right' ? { right: '0px' } : { left: '0px' })
      }} />
      <span className="name">{name}</span>
      <span className="content">
        {isLoading ? <span className="loading">AI正在思考中...</span> : content}
      </span>
    </div>
  );
};

const ChatBox = ({ messages }) => {
  return (
    <div className="lite-chatbox" style={{ flex: 1, overflowY: 'auto' }}>
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
    </div>
  );
};

const ChatInput = ({ onSendMessage, onReset }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="lite-chatinput">
      <hr className="boundary" />
      <textarea
        className="chatinput"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="send" onClick={handleSend}>发送</button>
      <button className="send" onClick={onReset}>新的对话</button>
    </div>
  );
};

interface IChatAppProps {
  onSendMessage: (content: string, response: (response: string) => void) => void;
  onReset: () => void;
}

const ChatApp = (props: IChatAppProps) => {
  const [messages, setMessages] = React.useState<any[]>([]);

  const handleSendMessage = (content) => {
    const newMessage = {
      type: 'text',
      content,
      position: 'right',
      name: '用户',
    };
    const aiMessage = {
      type: 'text',
      content: '',
      position: 'left',
      name: 'AI助手',
      isLoading: true,
    };
    setMessages([...messages, newMessage, aiMessage]);

    // // 模拟AI回复
    // setTimeout(() => {
    //   setMessages(prevMessages => prevMessages.map((msg, index) => 
    //     index === prevMessages.length - 1 
    //       ? { ...msg, content: '这是AI的自动回复', isLoading: false }
    //       : msg
    //   ));
    // }, 1500); // 1.5秒后回复

    props.onSendMessage(content, (response) => {
      setMessages(prevMessages => prevMessages.map((msg, index) =>
        index === prevMessages.length - 1
          ? { ...msg, content: response, isLoading: false }
          : msg
      ));
    });
  };

  return (
    <div className="lite-chatmaster">
      <ChatBox messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} onReset={props.onReset} />
    </div>
  );
};

export default ChatApp;
