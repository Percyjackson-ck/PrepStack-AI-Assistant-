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
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalNotes: number;
  totalRepos: number;
  totalQuestions: number;
}

export default function ChatSection() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions } = useQuery({
    queryKey: ['/api/chat/sessions'],
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/chat/sessions');
      return await res.json();
    },
    onSuccess: (newSession: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      setSelectedSessionId(newSession.id);
      toast({
        title: "New chat created",
        description: "Start a conversation with your AI assistant.",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      const res = await apiRequest('POST', `/api/chat/${sessionId}/message`, { message });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      setMessageInput('');
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  const selectedSession = sessionsArray.find((s: any) => s.id === selectedSessionId);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSessionId) return;
    
    sendMessageMutation.mutate({
      sessionId: selectedSessionId,
      message: messageInput.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText size={12} />;
      case 'github':
        return <Github size={12} />;
      case 'question':
        return <Bookmark size={12} />;
      default:
        return <Code size={12} />;
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Chat Sessions Sidebar */}
      <div className="lg:col-span-1 h-full">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Chat Sessions</h3>
              <Button 
                onClick={handleNewChat}
                disabled={createSessionMutation.isPending}
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus size={16} className="mr-1" />
                New
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {sessionsArray.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Start a new chat to begin
                    </p>
                  </div>
                ) : (
                  sessionsArray.map((session: any) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSessionId === session.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
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
                    selectedSession.messages.map((message: any, index: number) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.role === 'assistant' && (
                              <Bot className="text-accent flex-shrink-0 mt-1" size={16} />
                            )}
                            {message.role === 'user' && (
                              <User className="text-white flex-shrink-0 mt-1" size={16} />
                            )}
                            <div className="flex-1">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                              
                              {/* Sources */}
                              {message.sources && message.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Sources ({message.sources.length}):
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.sources.map((source: any, idx: number) => (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className={`${getSourceColor(source.type)} text-xs flex items-center`}
                                      >
                                        {getSourceIcon(source.type)}
                                        <span className="ml-1 truncate max-w-[120px]">
                                          {source.title}
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Loading indicator */}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="text-accent" size={16} />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
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
                  {(stats as Stats)?.totalNotes || 0} Notes
                </Badge>
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 text-xs">
                  {(stats as Stats)?.totalRepos || 0} GitHub Repos
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs">
                  {(stats as Stats)?.totalQuestions || 0} Questions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
