import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({});
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { isAuthorized, username } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/chat/conversations/${currentUserId}`, {
          withCredentials: true
        });
        
        console.log("Conversations data:", response.data);
        setConversations(response.data);
        
        const userIds = new Set();
        response.data.forEach(convo => {
          if (convo.userId) {
            userIds.add(convo.userId);
            console.log(`Added user ${convo.userId} to fetch list`);
          } else {
            console.warn("Found conversation with null userId:", convo);
          }
        });
        
        const names = {};
        for (const id of userIds) {
          try {
            console.log(`Fetching user info for ID: ${id}`);
            const userResponse = await axios.get(`http://localhost:8080/api/users/${id}`, {
              withCredentials: true
            });
            
            if (userResponse.data && userResponse.data.name) {
              names[id] = userResponse.data.name;
              console.log(`Found name for user ${id}: ${names[id]}`);
            } else {
              names[id] = `User ${id}`;
              console.log(`Using default name for user ${id}`);
            }
          } catch (error) {
            console.error(`Error fetching user info for ID ${id}:`, error);
            names[id] = `User ${id}`;
          }
        }
        setUserNames(names);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId && isAuthorized) {
      fetchConversations();
    }
  }, [currentUserId, isAuthorized]);

  const handleDeleteConversation = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/chat/conversations`, {
        params: {
          userId: currentUserId,
          otherUserId: userId
        },
        withCredentials: true
      });
      
      setConversations(conversations.filter(convo => convo.userId !== userId));
      toast.success("Conversation deleted successfully");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  if (!isAuthorized) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
        <div className="bg-white p-4 rounded">
        </div>

        <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Conversations</h2>
            <div className="text-sm text-blue-600">
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium text-gray-700">No conversations yet</h3>
              <p className="text-gray-500 mt-1">Start a new conversation to see it here</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {conversations.map((convo) => (
                <li 
                  key={convo.userId}
                  onClick={() => navigate(`/messages/${convo.userId}`)}
                  className="flex items-center justify-between border p-3 rounded shadow-sm hover:shadow transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                      {userNames[convo.userId]?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userNames[convo.userId] || `User ${convo.userId}`}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {convo.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(convo.lastTimestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/messages/${convo.userId}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                    >
                      Open
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(convo.userId);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Conversation"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded">
        </div>
      </div>
    </div>
  );
};

export default ConversationList;