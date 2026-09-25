import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { LoginPage } from './components/LoginPage';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { UserPanel } from './components/UserPanel';

function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentUser.role === 'superadmin') {
    return <SuperAdminPanel />;
  }

  return <UserPanel />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
