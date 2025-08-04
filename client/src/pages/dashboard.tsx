import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { NotesSection } from '@/components/dashboard/NotesSection';
import { GitHubSection } from '@/components/dashboard/GitHubSection';
import { PlacementSection } from '@/components/dashboard/PlacementSection';
import { ChatSection } from '@/components/dashboard/ChatSection';

type Section = 'overview' | 'notes' | 'github' | 'placement' | 'chat';

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState<Section>('overview');

  const sectionConfig = {
    overview: { title: 'Dashboard Overview', subtitle: 'Welcome back! Here\'s your study progress.' },
    notes: { title: 'My Notes', subtitle: 'Manage and search through your study materials.' },
    github: { title: 'GitHub Projects', subtitle: 'Analyze and understand your code repositories.' },
    placement: { title: 'Placement Prep', subtitle: 'Practice questions and interview preparation.' },
    chat: { title: 'AI Assistant', subtitle: 'Get instant help with your studies and projects.' }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <OverviewSection />;
      case 'notes':
        return <NotesSection />;
      case 'github':
        return <GitHubSection />;
      case 'placement':
        return <PlacementSection />;
      case 'chat':
        return <ChatSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      <div className="ml-64 min-h-screen">
        <TopBar 
          title={sectionConfig[currentSection].title}
          subtitle={sectionConfig[currentSection].subtitle}
        />
        
        <main className="p-6">
          <div className="section-content">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
