import { useState } from 'react';
import { api } from '../api';

export default function ProductForm({businessId}){
  const [form,setForm] = useState({ title:'', price_cents:0, promo_price_cents:'', image_url:'', is_adult:0 });
  const submit = async e => {
    e.preventDefault();
    const body = { ...form, business_id: businessId, price_cents:Number(form.price_cents||0), promo_price_cents: form.promo_price_cents? Number(form.promo_price_cents): null, is_adult: Number(form.is_adult) };
    await api.createProduct(body);
    setForm({ title:'', price_cents:0, promo_price_cents:'', image_url:'', is_adult:0 });
  };
  return (
    <form className="card" onSubmit={submit}>
      <h3>Novo Produto</h3>
      <label>Título</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
      <div className="form-row">
        <div><label>Preço (centavos)</label><input value={form.price_cents} onChange={e=>setForm({...form,price_cents:e.target.value})}/></div>
        <div><label>Promo (centavos)</label><input value={form.promo_price_cents} onChange={e=>setForm({...form,promo_price_cents:e.target.value})}/></div>
      </div>
      <label>Imagem URL</label><input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
      <label>+18?</label>
      <select value={form.is_adult} onChange={e=>setForm({...form,is_adult:e.target.value})}>
        <option value="0">Não</option><option value="1">Sim</option>
      </select>
      <button className="btn" style={{marginTop:10}}>Adicionar produto</button>
    </form>
  );
}
