import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

type Player={id:number;name:string;char:string;color:string;vitality:number;friendship:number;hand:string[];status:string};
const chars=[
 {name:'一二',emoji:'??',color:'#5d7cff',skill:'先见：查看牌堆顶三张，任选一张置顶。'},
 {name:'布布',emoji:'??',color:'#ff9f68',skill:'暖心：将一次负面效果转移给自己，并获得1友情。'},
 {name:'云朵邮差',emoji:'??',color:'#a9d8ff',skill:'投递：赠送卡牌后抽两张。'},
 {name:'糖果厨师',emoji:'??',color:'#ffb7d5',skill:'甜点：弃一张道具，为任意角色恢复2活力。'},
 {name:'森林侦探',emoji:'??',color:'#89c98b',skill:'追踪：查看一名玩家最近使用的卡牌。'},
 {name:'月光魔术师',emoji:'??',color:'#b8a3ff',skill:'幻术：本回合隐藏你的行动类型。'},
 {name:'玩具修理师',emoji:'??',color:'#f0bf72',skill:'重启：让一张已失效道具重新生效。'},
 {name:'星星歌手',emoji:'?',color:'#ffd76a',skill:'和声：相邻两名玩家各获得1活力。'},
 {name:'胆小幽灵',emoji:'??',color:'#b9bfd6',skill:'隐身：首次受到负面效果时免疫。'},
 {name:'淘气团子',emoji:'??',color:'#ff8b9e',skill:'捣蛋：改变一张互动牌的目标。'},
 {name:'梦境画师',emoji:'??',color:'#d7a8ff',skill:'改写：将弃牌堆顶卡牌转换为友情牌。'},
 {name:'发条骑士',emoji:'??',color:'#8fd5c2',skill:'护航：指定一名玩家，本轮受到的伤害-1。'}
];
const scenes=[['甜品派对','首次赠送卡牌时，双方各得1友情。','??'],['梦幻迷宫','行动顺序重新排列，远距离互动失效。','??'],['星光舞台','每人本轮首次使用技能不消耗友情。','??'],['玩具暴走','道具效果增强，但有小概率产生副作用。','??'],['云朵暴雨','本轮不能连续两次指定同一玩家。','???'],['礼物交换日','所有人秘密选择一张手牌，同时传给左侧玩家。','??'],['安静午后','攻击性互动减弱，保护与恢复增强。','???'],['心愿流星','完成指定行动的玩家获得一枚心愿碎片。','??']];
const cards=['星光护盾','糖霜急救','悄悄话','友情徽章','彩虹交换','迷雾贴纸','勇气饼干','心愿祈愿'];
function App(){
 const [started,setStarted]=useState(false); const [round,setRound]=useState(1); const [active,setActive]=useState(0); const [scene,setScene]=useState(0); const [log,setLog]=useState<string[]>(['欢迎来到萌境。请选择一张牌开始你的回合。']); const [players,setPlayers]=useState<Player[]>(()=>chars.slice(0,5).map((c,i)=>({id:i,name:i===0?'你':`玩家${i+1}`,char:c.name,color:c.color,vitality:4,friendship:0,hand:cards.slice(i%4,(i%4)+4),status:'在线'})));
 const me=players[0]; const current=players[active];
 const addLog=(s:string)=>setLog(l=>[s,...l].slice(0,8));
 const act=(label:string)=>{if(active!==0){addLog(`${current.name} 完成了行动`);setActive(0);return;} addLog(`你使用了「${label}」`); setPlayers(ps=>ps.map((p,i)=>i===0?({...p,vitality:Math.min(4,p.vitality+ (label==='糖霜急救'?1:0)),friendship:p.friendship+(label==='友情徽章'?1:0),hand:p.hand.slice(1)}):p)); setActive(1);};
 const next=()=>{setRound(r=>r+1);setScene(Math.floor(Math.random()*scenes.length));setActive(0);addLog('新场景揭示，轮到你行动。');};
 if(!started)return <main className="landing"><div className="sparkle">?</div><p className="eyebrow">A PRIVATE CARD ADVENTURE · 0.1</p><h1>一二布布<br/><em>萌境奇旅</em></h1><p className="lead">把友情、秘密和一点点淘气，洗进同一副牌里。</p><button className="primary" onClick={()=>setStarted(true)}>创建房间 <span>→</span></button><div className="landing-note">4–6 位玩家 · 15–25 分钟 · 私人房间</div></main>;
 return <div className="app"><header><div className="brand"><span>?</span> 一二布布 <small>萌境奇旅</small></div><div className="room">房间 <b>MOON-42</b><i>●</i></div></header><div className="layout"><aside><div className="scene-card" style={{background:chars[scene].color}}><div className="scene-top"><span>SCENE {String(round).padStart(2,'0')}</span><strong>{scenes[scene][2]}</strong></div><h2>{scenes[scene][0]}</h2><p>{scenes[scene][1]}</p></div><h3>同行者 <small>5 / 6</small></h3>{players.map((p,i)=><div className={'player '+(i===active?'active':'')} key={p.id}><div className="avatar" style={{background:p.color}}>{chars.find(c=>c.name===p.char)?.emoji}</div><div><b>{p.name}</b><span>{p.char}</span></div><div className="vital">{Array.from({length:4},(_,j)=><i className={j<p.vitality?'on':''} key={j}/>)}</div></div>)}<div className="wish">心愿碎片 <b>{round-1}</b><span>?</span></div></aside><section className="table"><div className="turn"><span>ROUND {round} · {current.name==='你'?'你的回合':current.name+' 的回合'}</span><strong>{current.name==='你'?'做一个温柔又聪明的选择':'对方正在思考…'}</strong></div><div className="center"><div className="orb">?</div><h2>{scenes[scene][0]}</h2><p>{scenes[scene][1]}</p></div><div className="hand-head"><span>你的手牌 <b>{me.hand.length}</b></span><small>选择一张牌，或发动角色技能</small></div><div className="hand">{me.hand.map((c,i)=><button className="card" key={c} onClick={()=>act(c)}><span className="card-icon">{['???','??','??','??','??','???','??','??'][i%8]}</span><b>{c}</b><small>{i%2?'恢复 1 点活力':'与一名玩家互动'}</small></button>)}</div><div className="actions"><button onClick={()=>act('角色技能')} className="skill">发动技能 <span>? K</span></button><button onClick={()=>act('赠送卡牌')}>赠送</button><button onClick={()=>act('结束回合')}>结束回合</button></div><div className="bottom"><div><h3>行动记录</h3>{log.map((x,i)=><p key={i}>{x}</p>)}</div><button className="next" onClick={next}>进入下一轮 <span>↗</span></button></div></section></div></div>
}
createRoot(document.getElementById('root')!).render(<App/>);

