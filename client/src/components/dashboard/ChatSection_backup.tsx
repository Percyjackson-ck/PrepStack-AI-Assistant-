import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { 
  Bot, 
  Plus, 
  Send, 
  Paperclip, 
  Circle,
  User,
  FileText,
  Github,
  Code,
  Bookmark
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    type: 'note' | 'question' | 'github';
    title: string;
    content: string;
    relevance: number;
  }>;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export function ChatSection() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/chat/sessions'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chat/sessions', {
        title: 'New Chat',
        messages: []
      });
      return response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      setSelectedSessionId(newSession.id);
    },
    onError: () => {
      toast({
        title: "Failed to create chat session",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      const response = await apiRequest('POST', `/api/chat/${sessionId}/message`, { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      setMessageInput('');
      setIsTyping(false);
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSessionId) return;

    setIsTyping(true);
    sendMessageMutation.mutate({
      sessionId: selectedSessionId,
      message: messageInput
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewChat = () => {
    createSessionMutation.mutate();
  };

  const selectedSession = sessions?.find((session: ChatSession) => session.id === selectedSessionId);

  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText size={12} />;
      case 'github':
        return <Github size={12} />;
      case 'question':
        return <Code size={12} />;
      default:
        return <Bookmark size={12} />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'github':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
      case 'question':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] max-h-[800px]">
      {/* Chat History Sidebar */}
      <div className="lg:col-span-1 h-full">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Conversations</h3>
              <Button
                onClick={createNewChat}
                disabled={createSessionMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors"
                size="icon"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {sessionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-border animate-pulse">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                  ))
                ) : sessions?.length === 0 ? (
                  <div className="text-center py-4">
                    <Bot className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                  </div>
                ) : (
                  sessions?.map((session: ChatSession) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedSessionId === session.id
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-background'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {session.title}
                      </p>
                      {session.messages.length > 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate mt-1">
                          {session.messages[session.messages.length - 1]?.content.substring(0, 50)}...
                        </p>
                      )}
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 h-full">
        <Card className="h-full flex flex-col">
          <CardContent className="p-0 h-full flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-accent/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <Bot className="text-accent" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Study Assistant</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Grok • Context-aware</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  <Circle className="mr-1 fill-current" size={8} />
                  Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
              {!selectedSession ? (
                <div className="text-center py-8">
                  <Bot className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">Select a conversation or start a new chat</p>
                </div>
              ) : selectedSession.messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">Start a conversation with your AI assistant</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Ask about your notes, GitHub projects, or placement questions
                  </p>
                </div>
              ) : (
                selectedSession.messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`chat-message ${
                      message.role === 'user' 
                        ? 'bg-primary text-white rounded-2xl rounded-br-md' 
                        : 'bg-gray-100 dark:bg-background text-gray-900 dark:text-white rounded-2xl rounded-bl-md'
                    } px-4 py-3`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Sources for AI messages */}
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium opacity-70">Sources:</p>
                          <div className="space-y-1">
                            {message.sources.map((source, sourceIndex) => (
                              <div key={sourceIndex} className="bg-white dark:bg-card rounded-lg p-2 border border-gray-200 dark:border-border">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant="secondary" className={`${getSourceColor(source.type)} text-xs`}>
                                    {getSourceIcon(source.type)}
                                    <span className="ml-1 capitalize">{source.type}</span>
                                  </Badge>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{source.title}</p>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{source.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.timestamp && (
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'opacity-70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-background text-gray-900 dark:text-white rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-border flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Ask about your notes, GitHub projects, or placement questions..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedSessionId || sendMessageMutation.isPending}
                  className="w-full pl-4 pr-12 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary">
                  <Paperclip size={16} />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !selectedSessionId || sendMessageMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg transition-colors"
                size="icon"
              >
                <Send size={16} />
              </Button>
            </div>
            
            {/* Context Indicators */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Context:</span>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs">
                {stats?.totalNotes || 0} Notes
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 text-xs">
                {stats?.totalRepos || 0} GitHub Repos
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs">
                {stats?.totalQuestions || 0} Questions
              </Badge>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
