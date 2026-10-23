const B=process.env.API || 'http://localhost:3001/api';
const call=async(m,p,b,t)=>{const r=await fetch(B+p,{method:m,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});return {s:r.status,d:await r.json()}};
(async()=>{const e=`race${Date.now()}@t.com`;await call('POST','/cadastro',{nome:'R',email:e,senha:'Senha@123'});const t=(await call('POST','/login',{email:e,senha:'Senha@123'})).d.token;
const l=(await call('POST','/licitacoes',{numero_processo:'R1',orgao_publico:'X',valor_estimado:1000},t)).d.id;const lo=(await call('POST',`/licitacoes/${l}/lotes`,{numero_lote:'1',valor_total_arrematado:1000},t)).d.id;const it=(await call('POST',`/lotes/${lo}/itens`,{descricao:'i',quantidade_ganha:20,valor_unitario:10},t)).d.id;
const rs=await Promise.all(Array.from({length:10},()=>call('POST','/servicos',{item_id:it,nome_servico:'s',quantidade:5,valor_fixo:50},t)));
const item=(await call('GET','/itens/'+it,null,t)).d;console.log('aceitos',rs.filter(r=>r.s===201).length,'de 10 (máx 4) | executada',item.quantidade_executada,'de',item.quantidade_ganha,'| servicos no banco',(await call('GET','/servicos',null,t)).d.length);
await call('DELETE','/perfil',null,t);})();
