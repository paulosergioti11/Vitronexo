export default function Footer(){
  return (
    <footer>
      <div className="container">
        <div className="wrap">
          <div>
            <div style={{fontWeight:900}}>VitroNexo</div>
            <div style={{opacity:.8,marginTop:8}}>Plataforma de divulgação para todos os negócios.</div>
          </div>
          <div>
            <div>Contato</div>
            <div style={{opacity:.8}}>suporte@vitronexo.com</div>
          </div>
        </div>
        <div style={{textAlign:'center',opacity:.7,padding:'8px 0 16px'}}>© {new Date().getFullYear()} VitroNexo</div>
      </div>
    </footer>
  );
}
