'use client';

import { useState } from 'react';
import { PepoBee } from '@/components/PepoBee';

export default function MessagesPage() {
  const [conversations] = useState([]);

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        {conversations.length === 0 ? (
          <div className="card">
            <div className="text-center py-20">
              <PepoBee emotion="idle" size={200} />
              <h2 className="text-2xl font-semibold mt-8 text-gray-900">
                No messages yet
              </h2>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                When you express interest in a giveaway or someone expresses interest in yours, 
                you&#39;ll be able to chat here.
              </p>
              <a href="/browse" className="btn btn-primary mt-6">
                Browse Giveaways
              </a>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="md:col-span-1 card">
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              {/* Conversation items */}
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 card">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <div className="flex-1">
                    {/* Message bubbles */}
                  </div>
                  
                  {/* Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="input"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



