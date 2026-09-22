import './App.css';
import Login from './pages/login';
import Signup from './pages/signup';
import { Routes, Route, Navigate } from 'react-router';

function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='*' element={<Navigate to='login' />} />
      </Routes>
    </div>
  );
}

export default App;
