import { useEffect, useState } from 'react';
import { api } from '../api';
import BusinessCard from '../components/BusinessCard';
import { Link } from 'react-router-dom';

export default function Home(){
  const [featured,setFeatured] = useState([]);
  const [cats,setCats] = useState([]);
  useEffect(()=>{
    api.listBusinesses(1,8).then(r=>setFeatured(r.businesses)).catch(()=>{});
    api.categories().then(r=>setCats(r.categories));
  },[]);
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>VitroNexo — Divulgue seu negócio<br/>para o mundo!</h1>
          <p style={{opacity:.9,margin:'6px 0 16px'}}>Produtos, promoções e muito mais em um só lugar.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link to="/dashboard" className="btn">Cadastre seu negócio agora</Link>
            <Link to="/explorar" className="btn outline">Explorar empresas</Link>
          </div>
        </div>
      </section>

      <div className="container" style={{marginTop:24}}>
        <h2>Empresas em destaque</h2>
        <div className="grid cards" style={{marginTop:12}}>
          {featured.map(b => <BusinessCard key={b.id} b={b} />)}
        </div>

        <h2 style={{marginTop:30}}>Categorias</h2>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',marginTop:12}}>
          {cats.map((c,i)=>(
            <Link key={c.id} to={`/explorar?category=${c.slug}`} className={`category-pill cat-${i%5}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
