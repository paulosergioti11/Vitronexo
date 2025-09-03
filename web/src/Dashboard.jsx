import { useEffect, useState } from 'react';
import { api } from '../api';
import BusinessForm from './BusinessForm';
import ProductForm from './ProductForm';

export default function Dashboard(){
  const [user,setUser] = useState(null);
  const [createdId,setCreatedId] = useState(null);
  const [business,setBusiness] = useState(null);

  useEffect(()=>{
    api.me().then(r=>setUser(r.user)).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(createdId) api.myBusiness(createdId).then(r=>setBusiness(r.business));
  },[createdId]);

  return (
    <div className="container">
      <h1>Painel do Empreendedor — VitroNexo</h1>
      {!user && <div className="card">Faça login para continuar.</div>}
      {user && !business && <BusinessForm onCreated={setCreatedId}/>}
      {user && business && (
        <>
          <div className="card">
            <h2>{business.name}</h2>
            <div style={{color:'#475569'}}>{business.description}</div>
          </div>
          <ProductForm businessId={business.id}/>
        </>
      )}
    </div>
  );
}
