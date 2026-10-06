import './App.css';
import Home from './pages/Home';
import Login from './pages/login';
import Signup from './pages/signup';
import Product from './pages/product';
import UserList from './pages/userList';
import api from './components/api';
import { Routes, Route, Navigate } from 'react-router';
import { GlobalContext } from './context/Context';
import { useContext, useEffect } from 'react';
import CategoryList from './pages/CategoryList';

function App() {
  let { state, dispatch } = useContext(GlobalContext);



  const userCheck = async () => {
    try {
      const apiResponse = await api.get('/me');
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
          {state.user.role === "admin" ?
            <>
              <Route path='/userList' element={<UserList />} />
              <Route path='/categories' element={<CategoryList />} />
            </>
            :
            null
          }
          <Route path='/products' element={<Product />} />
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
      {/* <Routes>
        <Route path='/home' element={<Home />} />
      </Routes> */}

    </div >
  );
}

export default App;
