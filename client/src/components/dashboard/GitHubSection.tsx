import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { Github, Lock, Star, RefreshCw, Check, Code, Zap } from 'lucide-react';

export function GitHubSection() {
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['/api/github/repos'],
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest('POST', '/api/github/connect', { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/github/repos'] });
      setShowTokenInput(false);
      setGithubToken('');
      toast({
        title: "GitHub connected successfully",
        description: "Your repositories have been fetched and stored.",
      });
    },
    onError: (error) => {
      toast({
        title: "GitHub connection failed",
        description: error instanceof Error ? error.message : "Please check your token and try again",
        variant: "destructive",
      });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (repoId: string) => {
      return apiRequest('POST', `/api/github/analyze/${repoId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/github/repos'] });
      toast({
        title: "Repository analyzed successfully",
        description: "Analysis results are now available.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleConnect = () => {
    if (!githubToken.trim()) {
      toast({
        title: "Token required",
        description: "Please enter your GitHub personal access token",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(githubToken);
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-400',
      'Python': 'bg-blue-400',
      'TypeScript': 'bg-blue-500',
      'Java': 'bg-orange-400',
      'C++': 'bg-pink-400',
      'Go': 'bg-cyan-400',
      'Rust': 'bg-orange-600',
    };
    return colors[language] || 'bg-gray-400';
  };

  const isConnected = repos && repos.length >= 0;

  return (
    <div className="space-y-6">
      {/* GitHub Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <Github className="text-white text-xl" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">GitHub Integration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected to your GitHub account' : 'Connect your GitHub account to analyze repositories'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    <Check className="mr-1" size={12} />
                    Connected
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <RefreshCw size={16} />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Connect GitHub
                </Button>
              )}
            </div>
          </div>

          {/* Token Input */}
          {showTokenInput && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-background">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub Personal Access Token
                  </label>
                  <Input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Generate a token at GitHub → Settings → Developer settings → Personal access tokens
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleConnect}
                    disabled={connectMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {connectMutation.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowTokenInput(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repository Analysis */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Private Repositories</h3>
              
              {reposLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 dark:border-border rounded-lg p-4 animate-pulse">
                      <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : repos?.length === 0 ? (
                <div className="text-center py-8">
                  <Github className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repos?.map((repo: any) => (
                    <div key={repo.id} className="border border-gray-200 dark:border-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-background transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                            <Lock className="text-gray-400 mr-2 text-sm" size={14} />
                            {repo.repoName.split('/')[1]}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {repo.description || 'No description available'}
                          </p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <div className={`w-2 h-2 ${getLanguageColor(repo.language)} rounded-full mr-1`}></div>
                              {repo.language}
                            </span>
                            <span className="flex items-center">
                              <Star size={12} className="mr-1" />
                              {repo.stars}
                            </span>
                            <span>Updated recently</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => analyzeMutation.mutate(repo.id)}
                          disabled={analyzeMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="ml-4"
                        >
                          {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Analysis Results */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analysis</h3>
              
              <div className="space-y-4">
                {repos?.filter((repo: any) => repo.analysis).length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No analysis available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Click "Analyze" on a repository to get started</p>
                  </div>
                ) : (
                  repos?.filter((repo: any) => repo.analysis).map((repo: any) => (
                    <div key={repo.id} className="bg-gray-50 dark:bg-background rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{repo.repoName.split('/')[1]}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Analyzed {new Date(repo.lastAnalyzed).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {repo.analysis?.summary}
                      </p>
                      
                      {repo.analysis?.technologies && (
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Technologies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {repo.analysis.technologies.map((tech: string) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
