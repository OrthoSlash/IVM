import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
