import { vscode } from './utilities/vscode';

import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import DemoHeroActionList from './components/DemoHeroActionList';

function App() {
  const queryClient = new QueryClient();
  function handleHowdyClick() {
    vscode.postMessage({
      command: 'hello',
      data: 'Hey there partner! 🤠',
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <h1>Hello World!</h1>
        <DemoHeroActionList />
      </main>
    </QueryClientProvider>
  );
}

export default App;
