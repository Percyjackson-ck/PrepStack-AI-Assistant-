import { Octokit } from '@octokit/rest';
import { storage } from '../storage';
import type { GithubRepo, InsertGithubRepo } from '@shared/schema';

export interface RepoAnalysis {
  summary: string;
  technologies: string[];
  keyFiles: Array<{
    name: string;
    content: string;
    purpose: string;
  }>;
  architecture: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;

  constructor(token?: string) {
    if (token) {
      this.octokit = new Octokit({ auth: token });
    }
  }

  // Fetch all repos (public + private) for the authenticated user, with pagination
  async fetchUserRepositories(userId: string, token: string): Promise<GithubRepo[]> {
    try {
      this.octokit = new Octokit({ auth: token });
      const savedRepos: GithubRepo[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data: repos } = await this.octokit.rest.repos.listForAuthenticatedUser({
          visibility: 'all', // fetch public + private
          sort: 'updated',
          per_page: perPage,
          page
        });

        if (repos.length === 0) break;

        for (const repo of repos) {
          const repoData: InsertGithubRepo = {
            userId,
            repoName: repo.full_name,
            description: repo.description || '',
            language: repo.language || 'Unknown',
            stars: repo.stargazers_count || 0
          };

          const savedRepo = await storage.createGithubRepo(repoData);
          savedRepos.push(savedRepo);
        }
        page++;
      }

      return savedRepos;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  async analyzeRepository(userId: string, repoId: string, repoName: string): Promise<RepoAnalysis> {
    try {
      if (!this.octokit) {
        throw new Error('GitHub token not configured');
      }

      const [owner, repo] = repoName.split('/');

      // Recursively fetch repository files
      const contents = await this.fetchRepositoryFiles(owner, repo, '');

      // Get README content
      let readme = '';
      try {
        const { data: readmeData } = await this.octokit.rest.repos.getReadme({
          owner,
          repo
        });
        readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      } catch {
        // README might not exist
      }

      // Extract key files (limit to first 5)
      const importantFiles = contents.filter(
        item =>
          item.type === 'file' &&
          ['package.json', 'requirements.txt', 'app.js', 'main.py', 'index.js', 'server.js'].some(name =>
            item.path.toLowerCase().includes(name)
          )
      ).slice(0, 5);

      const keyFiles: Array<{ name: string; content: string; purpose: string }> = [];

      for (const file of importantFiles) {
        try {
          const { data: fileData } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path
          });

          if ('content' in fileData) {
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            keyFiles.push({
              name: file.path,
              content: content.substring(0, 1000), // Limit content size
              purpose: this.inferFilePurpose(file.path, content)
            });
          }
        } catch {
          // Skip unreadable files
        }
      }

      // Extract technologies from key files, readme, and package.json dependencies
      const technologiesFromFiles = this.extractTechnologies(keyFiles, readme);

      // Try parse package.json dependencies
      const packageJsonFile = contents.find(c => c.path.toLowerCase() === 'package.json');
      if (packageJsonFile) {
        try {
          const { data: pkgData } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: packageJsonFile.path
          });
          if ('content' in pkgData) {
            const pkgJson = JSON.parse(Buffer.from(pkgData.content, 'base64').toString('utf-8'));
            const deps = Object.keys(pkgJson.dependencies || {});
            const devDeps = Object.keys(pkgJson.devDependencies || {});
            deps.concat(devDeps).forEach(dep => technologiesFromFiles.add(dep.toLowerCase()));
          }
        } catch {
          // ignore parse errors
        }
      }

      const technologies = Array.from(technologiesFromFiles);

      const analysis: RepoAnalysis = {
        summary: this.generateSummary(readme, keyFiles),
        technologies,
        keyFiles,
        architecture: this.inferArchitecture(keyFiles, technologies)
      };

      await storage.updateGithubRepoAnalysis(repoId, analysis);

      return analysis;
    } catch (error) {
      console.error('Repository analysis error:', error);
      throw new Error('Failed to analyze repository');
    }
  }

  private async fetchRepositoryFiles(owner: string, repo: string, dirPath: string): Promise<Array<{ path: string; type: string }>> {
    const allFiles: Array<{ path: string; type: string }> = [];

    try {
      const { data } = await this.octokit!.rest.repos.getContent({
        owner,
        repo,
        path: dirPath
      });

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'dir') {
            const nestedFiles = await this.fetchRepositoryFiles(owner, repo, item.path);
            allFiles.push(...nestedFiles);
          } else {
            allFiles.push({ path: item.path, type: item.type });
          }
        }
      } else {
        allFiles.push({ path: data.path, type: data.type });
      }
    } catch (error) {
      console.warn(`Failed to fetch contents for ${dirPath}:`, error);
    }

    return allFiles;
  }

  private extractTechnologies(keyFiles: { name: string; content: string }[], readme: string): Set<string> {
    const techs = new Set<string>();
    const content = (keyFiles.map(f => f.content).join(' ') + ' ' + readme).toLowerCase();

    const techMap: Record<string, string[]> = {
      react: ['react', 'jsx', 'create-react-app'],
      'node.js': ['node', 'express', 'npm'],
      python: ['python', 'django', 'flask', 'pip'],
      mongodb: ['mongodb', 'mongoose'],
      postgresql: ['postgresql', 'postgres', 'pg'],
      javascript: ['javascript', 'js'],
      typescript: ['typescript', 'ts'],
      html: ['html'],
      css: ['css', 'styling'],
      tailwind: ['tailwind'],
      bootstrap: ['bootstrap']
    };

    Object.entries(techMap).forEach(([tech, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        techs.add(tech);
      }
    });

    return techs;
  }

  private inferFilePurpose(fileName: string, content: string): string {
    if (fileName.toLowerCase().endsWith('package.json')) return 'Project dependencies and configuration';
    if (fileName.toLowerCase().endsWith('requirements.txt')) return 'Python dependencies';
    if (fileName.toLowerCase().includes('app.') || fileName.toLowerCase().includes('server.')) return 'Main application entry point';
    if (fileName.toLowerCase().includes('index.')) return 'Application entry point';
    return 'Configuration or main application file';
  }

  private generateSummary(readme: string, keyFiles: { name: string; content: string }[]): string {
    if (readme) {
      const lines = readme.split('\n').filter(line => line.trim().length > 0);
      const description = lines.find(line => !line.startsWith('#') && line.length > 20);
      if (description) return description.substring(0, 200);
    }

    return `Project with ${keyFiles.length} key files including ${keyFiles.map(f => f.name).join(', ')}`;
  }

  private inferArchitecture(keyFiles: { name: string; content: string }[], technologies: string[]): string {
    const hasBackend = keyFiles.some(f =>
      f.name.toLowerCase().includes('server') ||
      f.name.toLowerCase().includes('app.js') ||
      f.name.toLowerCase().includes('main.py')
    );
    const hasFrontend = technologies.includes('react') || technologies.includes('html');

    if (hasBackend && hasFrontend) return 'Full-stack application';
    if (hasBackend) return 'Backend API service';
    if (hasFrontend) return 'Frontend application';
    return 'Application project';
  }
}
