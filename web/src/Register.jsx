
import { useState } from 'react';
import { api, setToken } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const nav = useNavigate();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');
  const submit = async e => {
    e.preventDefault(); setErr('');
    try{
      const r = await api.register({name,email,password});
      setToken(r.token); nav('/dashboard');
    }catch(e){ setErr(e.message); }
  };
  return (
    <div className="container" style={{maxWidth:480}}>
      <h1>Criar conta — VitroNexo</h1>
      <form className="card" onSubmit={submit}>
        {err && <div className="badge" style={{background:'#fee2e2',borderColor:'#fecaca',color:'#991b1b'}}>{err}</div>}
        <label>Nome</label><input value={name} onChange={e=>setName(e.target.value)} />
        <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" style={{marginTop:10}}>Criar conta</button>
      </form>
    </div>
  );
}
