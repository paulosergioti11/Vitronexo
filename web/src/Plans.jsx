import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Plans(){
  const [plans,setPlans] = useState([]);
  useEffect(()=>{ api.plans().then(r=>setPlans(r.plans)); },[]);
  return (
    <div className="container">
      <h1>Planos</h1>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',marginTop:16}}>
        {plans.map(p=>(
          <div key={p.id} className="card" style={{borderTop:`6px solid ${p.rank>=4?'#a16207':p.rank===3?'#22c55e':p.rank===2?'#3b82f6':'#94a3b8'}`}}>
            <h3>{p.name}</h3>
            <div style={{fontSize:28,fontWeight:900,margin:'4px 0'}}>R$ {p.price_brl}</div>
            <ul style={{paddingLeft:18}}>
              {p.features.map((f,i)=><li key={i}>{f}</li>)}
            </ul>
            <button className="btn" style={{marginTop:10}}>Escolher</button>
          </div>
        ))}
      </div>
      <p style={{marginTop:12,color:'#475569'}}>Pagamento real pode ser adicionado depois (Stripe, Mercado Pago). Este MVP apenas seleciona planos.</p>
    </div>
  );
}
