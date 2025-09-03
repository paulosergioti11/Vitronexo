import { Link, useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '../api';

export default function NavBar(){
  const nav = useNavigate();
  const logged = !!getToken();
  const logout = () => { clearToken(); nav('/login'); };

  return (
    <div className="nav">
      <div className="wrap container">
        <Link to="/" className="logo">Vitro<span style={{color:'var(--acc)'}}>Nexo</span></Link>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <Link to="/explorar">Categorias</Link>
          <Link to="/planos">Planos</Link>
          <Link to="/dashboard" className="btn" style={{padding:'8px 14px'}}>Cadastrar negócio</Link>
          {logged ? (<button className="btn outline" onClick={logout}>Sair</button>)
                  : (<Link to="/login">Entrar</Link>)}
        </div>
      </div>
    </div>
  );
}
