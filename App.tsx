import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatTutor from './components/ChatTutor';
import QuizArena from './components/QuizArena';
import Translator from './components/Translator';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.CHAT:
        return <ChatTutor />;
      case AppView.QUIZ:
        return <QuizArena />;
      case AppView.TRANSLATE:
        return <Translator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
