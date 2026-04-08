
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pagina/login';
import Cadastro from './pagina/Cadastro';
import Esqueci_Senha from './pagina/EsqueciSenha';
import Redefinir_Senha from './pagina/RedefinirSenha';

export default  function App() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<Login />} />
       
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path='/esqueci-senha' element={<Esqueci_Senha />}/>

        <Route path='/redefinir-senha' element={<Redefinir_Senha/>}/>

      </Routes>
    </Router>
  );
}
