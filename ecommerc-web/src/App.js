import { useContext, useEffect } from 'react';
import './App.css';
import Login from './pages/login';
import Signup from './pages/signup';
import { Routes, Route, Navigate } from 'react-router';
import { GlobalContext } from './context/Context';
import Home from './pages/Home';
import axios from 'axios';

function App() {
  let { state, dispatch } = useContext(GlobalContext);



  const userCheck = async () => {
    try {
      const apiResponse = await axios.get('/api1/me', { withCredentials: true });
      dispatch({ type: 'USER_LOGIN', user: apiResponse.data.user });

    } catch (error) {
      dispatch({ type: 'USER_LOGOUT' })
      console.log("error", error);
    }
  };


  useEffect(() => {
    userCheck();
  }, []);


  return (
    <div className="App">
      {state.isLogin ?
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='*' element={<Navigate to='/home' />} />
        </Routes>
        :
        state.isLogin === false ?
          < Routes >
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='*' element={<Navigate to='/login' />} />
          </Routes>
          :
          <p>Loading....</p>
      }
    </div >
  );
}

export default App;
