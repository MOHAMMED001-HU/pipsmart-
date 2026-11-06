import { useEffect, useState } from 'react';
import { useMarketFeed } from './marketFeed';

type Position = { id:number; pair:string; side:'BUY'|'SELL'; lots:number; entry:number; stop:number; target:number };
type ClosedTrade = { id:number; pair:string; side:'BUY'|'SELL'; lots:number; entry:number; exit:number; pnl:number };
const baseQuotes:Record<string,number> = {'EUR/USD':1.085,'GBP/USD':1.265,'AUD/USD':0.655};

export default function DemoTrading({initialBalance}:{initialBalance:number}) {
 const [pair,setPair]=useState('EUR/USD');
 const {prices}=useMarketFeed();
 const [lots,setLots]=useState('0.10');
 const [stop,setStop]=useState('1.08200');
 const [target,setTarget]=useState('1.09100');
 const [positions,setPositions]=useState<Position[]>(()=>{try{return JSON.parse(localStorage.getItem('pipsmart-sim-positions')||'[]')}catch{return []}});
 const [history,setHistory]=useState<ClosedTrade[]>(()=>{try{return JSON.parse(localStorage.getItem('pipsmart-sim-history')||'[]')}catch{return []}});
 const [realized,setRealized]=useState(()=>{try{return Number(localStorage.getItem('pipsmart-sim-realized')||0)}catch{return 0}});
 const [notice,setNotice]=useState('');
 const price=prices[pair]??baseQuotes[pair];
 const money=(n:number)=>'$'+n.toFixed(2);
 const profit=(p:Position)=>((p.side==='BUY'?1:-1)*((prices[p.pair]??baseQuotes[p.pair])-p.entry)/0.0001)*10*p.lots;
 const floating=positions.reduce((sum,p)=>sum+profit(p),0);
 const balance=initialBalance+realized, equity=balance+floating;
 const margin=positions.reduce((sum,p)=>sum+1000*p.lots,0);
 useEffect(()=>{localStorage.setItem('pipsmart-sim-positions',JSON.stringify(positions))},[positions]);
 useEffect(()=>{localStorage.setItem('pipsmart-sim-history',JSON.stringify(history))},[history]);
 useEffect(()=>{localStorage.setItem('pipsmart-sim-realized',String(realized))},[realized]);
 function choosePair(value:string){
  setPair(value);
  const quote=prices[value]??baseQuotes[value];
  setStop((quote-0.003).toFixed(5));
  setTarget((quote+0.006).toFixed(5));
 }
 function open(side:'BUY'|'SELL'){
  const volume=Number(lots),sl=Number(stop),tp=Number(target);
  if(!Number.isFinite(volume)||volume<0.01||volume>5||price<=0){setNotice('Use a valid volume between 0.01 and 5 lots.');return}
  if((sl>0&&(side==='BUY'?sl>=price:sl<=price))||(tp>0&&(side==='BUY'?tp<=price:tp>=price))){setNotice('Check the stop-loss and take-profit direction.');return}
  if(1000*volume>Math.max(0,equity-margin)){setNotice('Not enough free margin. Reduce volume or close a position.');return}
  setPositions(current=>[{id:Date.now(),pair,side,lots:volume,entry:price,stop:sl,target:tp},...current]);
  setNotice(side+' practice position opened.');
 }
 function close(position:Position){
  const result=profit(position);
  setRealized(value=>value+result);
  setHistory(current=>[{id:position.id,pair:position.pair,side:position.side,lots:position.lots,entry:position.entry,exit:prices[position.pair]??baseQuotes[position.pair],pnl:result},...current]);
  setPositions(current=>current.filter(item=>item.id!==position.id));
  setNotice('Practice position closed.');
 }
 return <section className="sim-terminal">
  <div className="market-intro"><div><span className="eyebrow">PIPSMART PRACTICE TERMINAL</span><h2>Demo trading</h2><p>Open and manage simulated Forex positions.</p></div><span className="market-provider">VIRTUAL FUNDS ONLY</span></div>
  <div className="sim-warning">Practice prices move automatically and match the pipSmart Market chart. They are simulated, not live Forex prices. No broker connection or real orders.</div>
  <div className="stats-grid sim-stats">
   <div className="stat-card"><span>Balance</span><strong>{money(balance)}</strong><small>Virtual funds plus closed P/L</small></div>
   <div className="stat-card"><span>Equity</span><strong>{money(equity)}</strong><small>Balance plus floating P/L</small></div>
   <div className="stat-card"><span>Floating P/L</span><strong className={floating>=0?'green':'red'}>{money(floating)}</strong><small>Open positions update with practice prices</small></div>
   <div className="stat-card"><span>Free margin</span><strong>{money(Math.max(0,equity-margin))}</strong><small>Estimated simplified 1:100 leverage</small></div>
  </div>
  <div className="panel sim-order-panel"><div className="panel-head"><div><h3>New practice order</h3><p>Choose a pair and follow its simulated market price.</p></div></div>
   <div className="form-grid sim-form">
    <label>Pair<select value={pair} onChange={event=>choosePair(event.target.value)}><option>EUR/USD</option><option>GBP/USD</option><option>AUD/USD</option></select></label>
    <label>Shared practice price<input type="text" value={price.toFixed(5)} readOnly /></label>
    <label>Volume (lots)<input type="number" min="0.01" max="5" step="0.01" value={lots} onChange={event=>setLots(event.target.value)}/></label>
    <label>Stop-loss (0 = none)<input type="number" step="0.00001" value={stop} onChange={event=>setStop(event.target.value)}/></label>
    <label>Take-profit (0 = none)<input type="number" step="0.00001" value={target} onChange={event=>setTarget(event.target.value)}/></label>
    <label>Leverage<input value="1:100 (simulated)" readOnly/></label>
   </div>
   <div className="sim-order-actions"><button className="sim-buy" onClick={()=>open('BUY')}>BUY / LONG</button><button className="sim-sell" onClick={()=>open('SELL')}>SELL / SHORT</button></div>
   {notice&&<p className="sim-notice">{notice}</p>}
   <p className="fine-print">Simplified educational estimate for USD-quoted major pairs: about $10 per pip per standard lot. Margin is an approximation. Spread, fees, slippage and automatic stop/target execution are not modelled.</p>
  </div>
  <div className="panel"><div className="panel-head"><div><h3>Open positions ({positions.length})</h3><p>Floating P/L changes as the shared practice prices move.</p></div></div>
   {positions.length===0?<div className="empty-state">No open positions yet.</div>:<div className="table-wrap"><table><thead><tr><th>PAIR</th><th>SIDE</th><th>LOTS</th><th>ENTRY</th><th>SL / TP</th><th>FLOATING P/L</th><th></th></tr></thead><tbody>{positions.map(position=>{const value=profit(position);return <tr key={position.id}><td>{position.pair}</td><td>{position.side}</td><td>{position.lots.toFixed(2)}</td><td>{position.entry.toFixed(5)}</td><td>{position.stop} / {position.target}</td><td className={value>=0?'green':'red'}>{money(value)}</td><td><button className="outline-btn" onClick={()=>close(position)}>Close</button></td></tr>})}</tbody></table></div>}
  </div>
  <div className="panel"><div className="panel-head"><div><h3>Closed trade history ({history.length})</h3><p>Closed results are added to the virtual balance.</p></div></div>
   {history.length===0?<div className="empty-state">Your closed practice trades will appear here.</div>:<div className="table-wrap"><table><thead><tr><th>PAIR</th><th>SIDE</th><th>LOTS</th><th>ENTRY</th><th>EXIT</th><th>RESULT</th></tr></thead><tbody>{history.map(item=><tr key={item.id}><td>{item.pair}</td><td>{item.side}</td><td>{item.lots.toFixed(2)}</td><td>{item.entry.toFixed(5)}</td><td>{item.exit.toFixed(5)}</td><td className={item.pnl>=0?'green':'red'}>{money(item.pnl)}</td></tr>)}</tbody></table></div>}
  </div>
  <div className="academy-disclaimer">Practice positions and history are saved in this browser. Clearing browser storage may erase them. This is not a live trading account or live price feed.</div>
 </section>;
}
