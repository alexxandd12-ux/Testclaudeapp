import { useState, useEffect } from 'react';
import AuthScreen from './AuthScreen';
import Sidebar from './Sidebar';
import Scanner from './Scanner';
import History from './History';
import { getOperator, setOperator as persistOperator, clearOperator } from './storage';

export default function App() {
  const [operator, setOperatorState] = useState(() => getOperator());
  const [view, setView] = useState('scanner');

  useEffect(() => {
    document.title = operator ? `Label Match — ${operator}` : 'Label Match';
  }, [operator]);

  function handleActivate(name) {
    persistOperator(name);
    setOperatorState(name);
  }

  function handleLogout() {
    clearOperator();
    setOperatorState('');
    setView('scanner');
  }

  if (!operator) {
    return <AuthScreen onActivate={handleActivate} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar view={view} setView={setView} operator={operator} onLogout={handleLogout} />
      {view === 'scanner' ? <Scanner operator={operator} /> : <History />}
    </div>
  );
}
