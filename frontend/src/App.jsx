import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Principal from './pages/principal.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={
      <>
          <Header />      {
            
          }
          <Principal />
          <Footer />      {

          }
      </>
      } />
      <Route path='/login' element={<Login />} /> 
      <Route path='/registro' element={<Registro />} />
      </Routes>
  </Router>
    </>
  );
}

export default App;