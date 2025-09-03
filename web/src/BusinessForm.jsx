import { useEffect, useState } from 'react';
import { api } from '../api';

export default function BusinessForm({onCreated}){
  const [cats,setCats] = useState([]);
  const [form,setForm] = useState({ name:'', description:'', category_id:'', city:'', state:'', logo_url:'', cover_url:'', is_adult:0, plan_id:1 });

  useEffect(()=>{ api.categories().then(r=>setCats(r.categories)); },[]);
  const submit = async e => {
    e.preventDefault();
    const payload = { ...form, category_id: form.category_id? Number(form.category_id): null, is_adult: Number(form.is_adult), plan_id: Number(form.plan_id) };
    const r = await api.createBusiness(payload);
    onCreated?.(r.id);
  };

  return (
    <form className="card" onSubmit={submit}>
      <div className="form-row">
        <div><label>Nome do negócio</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
        <div><label>Categoria</label>
          <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
            <option value="">Selecione</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <label>Descrição</label><textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <div className="form-row">
        <div><label>Cidade</label><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
        <div><label>Estado</label><input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></div>
      </div>
      <div className="form-row">
        <div><label>Logo URL</label><input value={form.logo_url} onChange={e=>setForm({...form,logo_url:e.target.value})}/></div>
        <div><label>Capa URL</label><input value={form.cover_url} onChange={e=>setForm({...form,cover_url:e.target.value})}/></div>
      </div>
      <div className="form-row">
        <div><label>Plano</label>
          <select value={form.plan_id} onChange={e=>setForm({...form,plan_id:e.target.value})}>
            <option value="1">Grátis</option>
            <option value="2">Bronze</option>
            <option value="3">Prata</option>
            <option value="4">Ouro</option>
          </select>
        </div>
        <div><label>+18?</label>
          <select value={form.is_adult} onChange={e=>setForm({...form,is_adult:e.target.value})}>
            <option value="0">Não</option>
            <option value="1">Sim</option>
          </select>
        </div>
      </div>
      <button className="btn" style={{marginTop:10}}>Salvar negócio</button>
    </form>
  );
}
