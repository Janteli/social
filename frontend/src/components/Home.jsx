import Feed from './Feed';
import { Outlet } from 'react-router-dom';
import RightSidebar from './RightSidebar';
import useGetAllPost from '../hooks/useGetAllPosts';
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers';

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex ">
      {/* Main Content */}
      <div className="flex-grow">
      <div className='lg:hidden flex justify-center'>
        <h1 className='font-bold text-gray-700 mb-0'>Teachers Media</h1></div>

        <Feed />
        <Outlet />
      </div>
      
      {/* Right Sidebar - Hidden on small screens */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
