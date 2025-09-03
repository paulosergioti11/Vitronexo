import { useEffect, useState } from 'react';
import { api } from '../api';
import BusinessCard from '../components/BusinessCard';
import { useSearchParams } from 'react-router-dom';

export default function Explore(){
  const [params, setParams] = useSearchParams();
  const [cats,setCats] = useState([]);
  const [results,setResults] = useState([]);
  const [q,setQ] = useState(params.get('q')||'');
  const [category,setCategory] = useState(params.get('category')||'');
  const [adult,setAdult] = useState('no');

  useEffect(()=>{ api.categories().then(r=>setCats(r.categories)); },[]);
  const search = () => {
    const p = { q, category, adult };
    setParams(p);
    api.search(p).then(r=>setResults(r.results));
  };
  useEffect(()=>{ search(); },[]);

  return (
    <div className="container">
      <h1>Explorar</h1>
      <div className="card" style={{margin:'12px 0'}}>
        <div className="form-row">
          <div>
            <label>Busca</label>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="nome, descrição..." />
          </div>
          <div>
            <label>Categoria</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">Todas</option>
              {cats.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row" style={{marginTop:10}}>
          <div>
            <label>Conteúdo adulto</label>
            <select value={adult} onChange={e=>setAdult(e.target.value)}>
              <option value="no">Ocultar +18</option>
              <option value="only">Apenas +18</option>
              <option value="all">Mostrar tudo</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'end'}}><button className="btn" onClick={search}>Buscar</button></div>
        </div>
      </div>

      <div className="grid cards" style={{marginTop:12}}>
        {results.map(b=> <BusinessCard key={b.id} b={b} />)}
      </div>
    </div>
  );
}
