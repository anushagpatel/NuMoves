import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

import { FaTrash, FaEllipsisV } from "react-icons/fa";
import toast from "react-hot-toast";
const Message = () => {
  const [message, setMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isArchived, setIsArchived] = useState(false);

  const { userId } = useParams();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserNames = async () => {
      const userIds = new Set();
      userIds.add(currentUserId);
      userIds.add(userId);

      messages.forEach((msg) => {
        userIds.add(msg.senderId);
        userIds.add(msg.recipientId);
      });

      for (const id of userIds) {
        if (!userNames[id] && id) {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/users/${id}`
            );
            setUserNames((prev) => ({
              ...prev,
              [id]: response.data.name || `User ${id}`,
            }));
          } catch (error) {
            console.error(`Error fetching user info for ID ${id}:`, error);
            setUserNames((prev) => ({
              ...prev,
              [id]: `User ${id}`,
            }));
          }
        }
      }
    };

    fetchUserNames();
  }, [messages, userId, currentUserId, userNames]);

  useEffect(() => {
    window.global = window;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("STOMP connection established");
        setConnected(true);
        client.subscribe(`/topic/messages/${currentUserId}`, (messageFrame) => {
          const receivedMessage = JSON.parse(messageFrame.body);
          console.log("Message received:", receivedMessage);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onDisconnect: () => {
        console.log("STOMP client disconnected");
        setConnected(false);
      },
      onError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/chat/history`,
          {
            params: {
              userId: currentUserId,
              otherUserId: userId,
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (currentUserId && userId) {
      fetchChatHistory();
    }
  }, [currentUserId, userId]);

  const sendMessage = () => {
    if (stompClient && connected && message.trim()) {
      const chatMessage = {
        senderId: currentUserId,
        recipientId: userId,
        content: message,
        timestamp: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage),
      });

      setMessages((prev) => [...prev, chatMessage]);
      setMessage("");
      toast.success("Message sent:", chatMessage);
    } else if (!message.trim()) {
      console.warn("Cannot send empty message");
    } else {
      console.error("STOMP client is not connected. Cannot send message.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const getUserName = (id) => {
    return userNames[id] || `User ${id}`;
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/chat/messages/${messageId}`
      );
      setMessages(messages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/chat/conversations`, {
        params: {
          userId: currentUserId,
          otherUserId: userId,
        },
      });
      setMessages([]);
      setShowOptions(false);
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  const archiveConversation = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/chat/conversations/archive?userId=${currentUserId}&otherUserId=${userId}`
      );
      setIsArchived(true);
      setShowOptions(false);
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  const renderMessageOptions = (msg) => (
    <div className="absolute right-0 top-0 mt-1 mr-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedMessage(msg.id);
        }}
        className="text-gray-500 hover:text-red-500 p-1"
      >
        <FaTrash size={12} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative">
      {/* Status bar */}
      <div
        className={`py-2 px-4 text-sm font-medium ${
          connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        <div className="flex justify-between items-center">
          <span>Status: {connected ? "Connected" : "Disconnected"}</span>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-600 hover:text-blue-600 p-1"
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {isArchived && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm font-medium">
          This conversation has been archived.
        </div>
      )}

      {showOptions && (
        <div className="absolute right-4 top-12 bg-white shadow-lg rounded-md z-10 w-48">
          <button
            onClick={clearConversation}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Clear Conversation
          </button>
          <button
            onClick={archiveConversation}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Archive Chat
          </button>
        </div>
      )}

      {/* Chat header */}
      <div className="bg-blue-600 text-white p-4 shadow-md relative">
        <h2 className="text-xl font-bold text-blue">
          Chat with {getUserName(userId)}
        </h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 shadow ${
                  msg.senderId === currentUserId
                    ? "bg-blue text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  {" "}
                  {/* Added gap-2 here */}
                  <span
                    className={`text-xs font-semibold ${
                      msg.senderId === currentUserId
                        ? "text-blue-100"
                        : "text-blue-600"
                    }`}
                  >
                    {msg.senderId === currentUserId
                      ? "You"
                      : getUserName(msg.senderId)}
                  </span>
                  <span
                    className={`text-xs ${
                      msg.senderId === currentUserId
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={!connected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !message.trim()}
            className="bg-blue hover:bg-indigo-700 text-white rounded-full p-2 w-12 h-12 flex items-center justify-center disabled:bg-blue disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
