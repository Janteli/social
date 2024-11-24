import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Singup';
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSocket } from './redux/socketSlice';
import { setOnlineUsers } from './redux/chatSlice';
import { setLlikeNotification } from './redux/rtnSlice';
import ProtectedRoute from './components/ProtectedRoute';

const browserRouter = createBrowserRouter([
  {
    path:'/',
    element: <ProtectedRoute> <MainLayout/> </ProtectedRoute> ,
    children:[
      {
        path:'/',
        element:<ProtectedRoute><Home/></ProtectedRoute>
      },
      {
        path:'/profile/:id',
        element:<ProtectedRoute> <Profile/> </ProtectedRoute>
      },
      {
        path:'/account/edit',
        element: <ProtectedRoute><EditProfile/></ProtectedRoute>
      },
      {
        path:'/chat',
        element:<ProtectedRoute><ChatPage/></ProtectedRoute>
      },
    ]
  },
  {
    path:'/login',
    element:<Login/>
  },
  {
    path:'/signup',
    element:<Signup/>
  },
])

function App() {

  const {user} = useSelector(store=>store.auth);
  const {socket} = useSelector(store=> store.socketio)
  const dispatch = useDispatch()

  // console.log('socket app', user?._id, 'socket-data', socket)

  useEffect(()=>{
    if(user){
      const socketio = io('http://localhost:8000', {
        query:{
          userId: user?._id
        }, //handshake between client socket and backend socket ; querry is passing id to backend sokect
        transports:['websocket'] //to avoid unnecessary api call
      });
      
      dispatch(setSocket(socketio));

      // listening all events
      socketio.on('getOnlineUsers', (onlineUsers)=>{
      console.log('onlineusers',onlineUsers);

        dispatch(setOnlineUsers(onlineUsers))
      });
      
      socketio.on('notification', (notification)=>{
        dispatch(setLlikeNotification(notification))
      })
      return ()=> {
        socketio.close();
        dispatch(setSocket(null))
      }
    } else if(socket){
        socket?.close();
        dispatch(setOnlineUsers(null))
      
    }
  }, [user, dispatch])
  return (
    <>
      <RouterProvider router = {browserRouter}/>
    </>
  )
}

export default App
