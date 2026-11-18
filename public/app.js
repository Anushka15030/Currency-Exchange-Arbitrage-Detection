const path=location.pathname.replace(/\/$/,'')||'/';
async function getRates(){const r=await fetch('/api/rates');if(!r.ok)throw Error('Could not load rates');return (await r.json()).rates}
function renderRates(rates){
  const body=document.querySelector('#ratesBody');if(!body)return;
  const search=document.querySelector('#search'),filter=document.querySelector('#filter'),matrix=document.querySelector('#matrixTable');
  const currencies=[...new Set(rates.flatMap(r=>[r.from,r.to]))].sort();
  filter.innerHTML='<option value="">All currencies</option>'+currencies.map(c=>`<option>${c}</option>`).join('');
  function updateMatrix(rows){
    if(!matrix)return;
    const byPair=new Map(rows.map(r=>[`${r.from}:${r.to}`,r.rate]));
    matrix.innerHTML=`<thead><tr><th scope="col">BASE / QUOTE</th>${currencies.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${currencies.map(from=>`<tr><th scope="row">${from}</th>${currencies.map(to=>{const rate=byPair.get(`${from}:${to}`);return `<td>${rate===undefined?'<span class="matrix-empty" aria-label="No direct pair">—</span>':`<button type="button" class="matrix-cell" data-from="${from}" data-to="${to}" data-rate="${rate}" aria-label="${from} to ${to}: ${rate}">${rate.toLocaleString(undefined,{maximumFractionDigits:6})}</button>`}</td>`}).join('')}</tr>`).join('')}</tbody>`;
  }
  function update(){
    const q=search.value.toLowerCase(),f=filter.value;
    const rows=rates.filter(r=>(!f||r.from===f||r.to===f)&&(`${r.from} ${r.to} ${r.from}/${r.to}`.toLowerCase().includes(q)));
    body.innerHTML=rows.map(r=>`<tr><td>${r.from}</td><td>${r.to}</td><td><span class="currency-pill">${r.from} / ${r.to}</span></td><td class="right">${r.rate.toLocaleString(undefined,{maximumFractionDigits:6})}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;color:#879398">No matching pairs</td></tr>';
    document.querySelector('#rowCount').textContent=`${rows.length} PAIRS`;updateMatrix(rows);
  }
  search.addEventListener('input',update);filter.addEventListener('change',update);update();
  matrix?.addEventListener('click',event=>{const cell=event.target.closest('.matrix-cell');if(!cell)return;matrix.querySelectorAll('.matrix-cell.selected').forEach(el=>el.classList.remove('selected'));cell.classList.add('selected');const detail=document.querySelector('#pairDetail');detail.hidden=false;detail.innerHTML=`<span class="currency-pill">${cell.dataset.from} / ${cell.dataset.to}</span><strong>1 ${cell.dataset.from} = ${Number(cell.dataset.rate).toLocaleString(undefined,{maximumFractionDigits:6})} ${cell.dataset.to}</strong><small>Direct rate from the illustrative sample rate book. Historical price data is not included.</small>`;});
  const rowsView=document.querySelector('#rowsView'),matrixView=document.querySelector('#matrixView'),rowsPanel=document.querySelector('#rateRows'),matrixPanel=document.querySelector('#rateMatrix');
  function setView(view){const isMatrix=view==='matrix';rowsPanel.hidden=isMatrix;matrixPanel.hidden=!isMatrix;rowsView.classList.toggle('active',!isMatrix);matrixView.classList.toggle('active',isMatrix);rowsView.setAttribute('aria-pressed',String(!isMatrix));matrixView.setAttribute('aria-pressed',String(isMatrix));}
  rowsView.addEventListener('click',()=>setView('rows'));matrixView.addEventListener('click',()=>setView('matrix'));
}
function currency(n,c='USD'){return new Intl.NumberFormat(undefined,{style:'currency',currency:c,maximumFractionDigits:2}).format(n)}
function rateFor(a,b,rates){return rates?.find(r=>r.from===a&&r.to===b)?.rate||0}
function animateCurrency(el,target,code='USD',prefix=''){if(!el)return;const format=value=>`${prefix}${currency(value,code)}`;if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){el.textContent=format(target);return;}const started=performance.now(),duration=850;function frame(now){const progress=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-progress,3);el.textContent=format(target*ease);if(progress<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}
function updateHeroVisual(rates){const route=['USD','EUR','GBP','USD'],feeFactor=.999,amount=1000;const loopRates=route.slice(0,-1).map((from,i)=>rateFor(from,route[i+1],rates));if(loopRates.some(rate=>!rate))return;const finalAmount=loopRates.reduce((total,rate)=>total*rate*feeFactor,amount),gain=finalAmount-amount;animateCurrency(document.querySelector('#heroReturn'),finalAmount,'USD');animateCurrency(document.querySelector('#heroGain'),gain,'USD','+')}
function cycleGraphMarkup(c,index){
  const currencies=c.path.slice(0,-1),cx=120,cy=104,r=70,n=currencies.length,points=currencies.map((code,i)=>{const angle=-Math.PI/2+(Math.PI*2*i/n);return {code,x:cx+r*Math.cos(angle),y:cy+r*Math.sin(angle)}}),marker=`cycleArrow${index}`;
  const links=points.map((p,i)=>{const q=points[(i+1)%n],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;return `<line class="graph-link" x1="${(p.x+ux*25).toFixed(1)}" y1="${(p.y+uy*25).toFixed(1)}" x2="${(q.x-ux*27).toFixed(1)}" y2="${(q.y-uy*27).toFixed(1)}" marker-end="url(#${marker})"/>`}).join('');
  const nodes=points.map((p,i)=>`<g><circle class="graph-node ${i===0?'start':''}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="23"/><text class="graph-node-label" x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}">${p.code}</text></g>`).join('');
  return `<div class="graph" role="img" aria-label="Circular conversion loop ${c.path.join(' to ')}"><svg viewBox="0 0 240 208"><defs><marker id="${marker}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path class="graph-marker" d="M0 0L7 3.5L0 7Z"/></marker></defs><circle class="graph-orbit" cx="${cx}" cy="${cy}" r="${r}"/>${links}${nodes}<text class="graph-center" x="${cx}" y="${cy}">+${c.profitPercent.toFixed(2)}%</text></svg></div>`;
}
function profitBreakdownMarkup(c){
  const gross=Math.max(0,c.startAmount*(c.grossMultiplier-1)),net=Math.max(0,c.profit),fees=Math.max(0,gross-net),netWidth=gross>0?Math.max(0,Math.min(100,net/gross*100)):0,feeWidth=100-netWidth;
  return `<div class="profit-breakdown"><div class="profit-breakdown-head"><span>Gross profit after transaction costs</span><b>+${currency(net,c.path[0])} net</b></div><div class="profit-bar" role="img" aria-label="Net profit ${currency(net,c.path[0])}; estimated fees ${currency(fees,c.path[0])}"><span class="profit-bar-net" style="width:${netWidth.toFixed(1)}%"></span><span class="profit-bar-fees" style="width:${feeWidth.toFixed(1)}%"></span></div><div class="profit-legend"><span><i></i> Net profit +${currency(net,c.path[0])}</span><span><i></i> Estimated fees ${currency(fees,c.path[0])}</span></div></div>`;
}

function explanationMarkup(c,feePercent){
  const feeFactor=1-feePercent/100;
  let amount=c.startAmount;
  const steps=c.path.slice(0,-1).map((from,i)=>{
    const to=c.path[i+1],rate=rateFor(from,to,window.__rates),before=amount;
    amount*=rate*feeFactor;
    return `<div class="explain-step"><div class="explain-step-head"><span class="explain-step-number">${String(i+1).padStart(2,'0')}</span><b>${from} <span aria-hidden="true">→</span> ${to}</b></div><div class="explain-step-values"><span>${currency(before,from)}</span><span class="explain-step-arrow" aria-hidden="true">→</span><strong>${currency(amount,to)}</strong></div><small>Rate × ${rate.toLocaleString(undefined,{maximumFractionDigits:6})} · ${feePercent.toFixed(2)}% transaction cost</small></div>`;
  }).join('');
  return `<div class="explanation-visual"><div class="explanation-intro"><span class="explanation-icon" aria-hidden="true">↻</span><div><h4>How this loop creates an opportunity</h4><p>Follow the starting amount through each exchange. The amount shown includes the transaction cost at every step.</p></div></div><div class="explanation-steps">${steps}</div><div class="explanation-outcome"><span>Back in ${c.path[0]}</span><strong>${currency(c.startAmount,c.path[0])} <span aria-hidden="true">→</span> ${currency(c.finalAmount,c.path[0])}</strong><b>Estimated gain: +${currency(c.profit,c.path[0])} (${c.profitPercent.toFixed(3)}%)</b></div><p class="explanation-caveat">This is an estimate using the sample rates and selected transaction cost. Rates are illustrative, not live quotes.</p></div>`;
}

async function runAnalysis(){
  const btn=document.querySelector('#run'),out=document.querySelector('#results'),summary=document.querySelector('#summary');
  if(!btn)return;
  btn.disabled=true;btn.textContent='Scanning…';out.innerHTML='';summary.innerHTML='';
  try{
    const amount=Number(document.querySelector('#amount').value),fee=Number(document.querySelector('#fee').value);
    if(!(amount>0)||fee<0||fee>=100)throw Error('Enter an amount above zero and a transaction cost from 0% to under 100%.');
    const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,feePercent:fee})});
    if(!r.ok)throw Error('Analysis request failed.');
    const data=await r.json();
    summary.innerHTML=`<div class="summary-head"><h2>Scan summary</h2><span>NET OF ${(fee).toFixed(2)}% PER TRADE</span></div><div class="stat-row"><div class="stat"><label>UNIQUE OPPORTUNITIES</label><strong>${data.count}</strong></div><div class="stat"><label>STARTING AMOUNT</label><strong>${currency(amount)}</strong></div><div class="stat"><label>NETWORK STATUS</label><strong class="${data.count?'good':''}">${data.count?'Opportunity found':'No opportunity'}</strong></div></div>`;
    if(!data.count){out.innerHTML=`<div class="empty-card"><div class="empty-symbol">○</div><h2>No profitable cycles found</h2><p>At these rates and transaction costs, no conversion loop returns more than it starts with. Try lowering the per-trade cost to inspect the raw rate network.</p></div>`;return;}
    out.innerHTML=data.cycles.map((c,i)=>`<article class="cycle-card"><div class="cycle-top"><div class="cycle-title"><span class="cycle-index">${String(i+1).padStart(2,'0')}</span><h3>Opportunity ${i+1} · ${c.path.join(' → ')}</h3></div><span class="profit-badge">+${c.profitPercent.toFixed(3)}%</span></div><div class="cycle-body">${cycleGraphMarkup(c,i)}<div class="legs">${c.path.slice(0,-1).map((n,j)=>`<div class="leg"><small>${n} → ${c.path[j+1]}</small><b>× ${rateFor(n,c.path[j+1],window.__rates).toLocaleString(undefined,{maximumFractionDigits:6})}</b></div>`).join('')}</div>${profitBreakdownMarkup(c)}<button type="button" class="explain-button" aria-expanded="false">Explain this opportunity <span aria-hidden="true">＋</span></button><div class="explanation-panel" hidden></div><div class="money-row"><div>Starting amount<b>${currency(c.startAmount,c.path[0])}</b></div><div>After conversions<b>${currency(c.finalAmount,c.path[0])}</b></div><div>Estimated profit<b style="color:var(--profit)">+${currency(c.profit,c.path[0])}</b></div><div>Gross cycle rate<b>× ${c.grossMultiplier.toFixed(6)}</b></div></div></div></article>`).join('');
    out.querySelectorAll('.explain-button').forEach((toggle,i)=>toggle.addEventListener('click',()=>{
      const panel=toggle.nextElementSibling,isOpen=toggle.getAttribute('aria-expanded')==='true';
      if(isOpen){panel.hidden=true;panel.innerHTML='';toggle.setAttribute('aria-expanded','false');toggle.innerHTML='Explain this opportunity <span aria-hidden="true">＋</span>';return;}
      panel.innerHTML=explanationMarkup(data.cycles[i],fee);panel.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.innerHTML='Hide explanation <span aria-hidden="true">−</span>';
    }));
  }catch(e){out.innerHTML=`<div class="error">${e.message}</div>`}
  finally{btn.disabled=false;btn.innerHTML='Run detection <span>→</span>'}
}

(async()=>{try{const rates=await getRates();window.__rates=rates;renderRates(rates);updateHeroVisual(rates)}catch(e){const b=document.querySelector('#ratesBody');if(b)b.innerHTML='<tr><td colspan="4">Unable to load rates. Is the server running?</td></tr>'}document.querySelector('#run')?.addEventListener('click',runAnalysis);if(document.querySelector('#run'))runAnalysis()})();
