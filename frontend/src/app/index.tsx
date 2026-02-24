import { AppProvider } from './context';
import { Layout } from './Layout';
import { Router } from './Router';

export function App() {
  return (
    <AppProvider>
      <Layout>
        <Router />
      </Layout>
    </AppProvider>
  );
}
