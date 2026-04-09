import { Outlet } from 'react-router-dom';
import YouthHeader from './YouthHeader';
import YouthFooter from './YouthFooter';

const YouthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <YouthHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <YouthFooter />
    </div>
  );
};

export default YouthLayout;