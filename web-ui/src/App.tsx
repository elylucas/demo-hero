import { vscode } from './utilities/vscode';

import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import ActionList from './components/ActionList';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import ActionItemPage from './components/ActionItem';
import Layout from './components/Layout';

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
      <BrowserRouter>
        <Routes>
          <Route
            path="/index.html"
            element={<Layout />}
          >
            <Route index element={<ActionList />}></Route>
            <Route path="actions/:id" element={<ActionItemPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
