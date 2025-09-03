import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Plans from './pages/Plans';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App(){
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/explorar" element={<Explore/>}/>
        <Route path="/planos" element={<Plans/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
      <Footer />
    </>
  );
}
