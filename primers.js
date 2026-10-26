/* Beginner diagrams and ranking explorers. Uses the static reader's helpers. */
function beginnerPath() {
  return `<section class="beginner-path" aria-label="Beginner reading path"><span class="eyebrow">NEW TO RECOMMENDERS? START HERE.</span><h2>The background before the architecture.</h2><div class="primer-links"><a href="#/foundations"><small>01 / THE BIG PICTURE</small><strong>What is a recommender?</strong><span>Users, items, feedback, and one request from beginning to end. →</span></a><a href="#/ranking"><small>02 / FOLLOW THE NUMBERS</small><strong>How does ranking work?</strong><span>Build a probability, learn from a click, and change the objective. →</span></a><a href="#/models"><small>03 / PUT PAPERS IN CONTEXT</small><strong>Snap’s ten references</strong><span>Feature interactions, multi-task models, and trustworthy experiments. →</span></a></div><a class="glossary-link" href="#/glossary">Need a definition? Open the plain-language glossary ↗</a></section>`;
}
function modelDiagram(name) {
  let body='',caption='Schematic of the computation, not a reproduction of a paper figure.';
  const split=(input,upper,lower,upperSub='',lowerSub='')=>`${box(5,95,145,60,input,'node')}${arrow(151,125,190,125)}<path class="flow" d="M190 125 V54 H235" marker-end="url(#arrow)"/><path class="flow" d="M190 125 V194 H235" marker-end="url(#arrow)"/>${box(240,27,185,55,upper,'tower',upperSub)}${box(240,167,185,55,lower,'tower',lowerSub)}<path class="flow" d="M425 54 H475 V114 H515" marker-end="url(#arrow)"/><path class="flow" d="M425 194 H475 V135 H515" marker-end="url(#arrow)"/>${box(520,96,135,58,'Prediction','node','combine + sigmoid')}`;
  if(name==='request-loop') {
    body=`${box(5,32,120,60,'Request','node','user + context')}${arrow(126,62,157,62)}${box(162,32,135,60,'Retrieval','tower','cheap shortlist')}${arrow(298,62,329,62)}${box(334,32,135,60,'Ranking','tower','richer prediction')}${arrow(470,62,501,62)}${box(506,32,149,60,'Show an item','node','rules / auction')}<path class="flow" d="M580 93 V190 H420" marker-end="url(#arrow)"/>${box(245,163,170,55,'Feedback log','node','impressions + outcomes')}<path class="flow" d="M244 190 H60 V93" marker-end="url(#arrow)"/><text class="dim" x="90" y="177">future training</text><text class="dim" x="330" y="125" text-anchor="middle">Eligibility constrains what can be shown; labels arrive after prediction.</text>`;
    caption='One request creates a decision; observed outcomes become examples for future model updates.';
  } else if(name==='facebook-clicks') {
    body=`${box(5,90,128,65,'Features','node','query-time inputs')}${arrow(134,123,164,123)}${box(170,90,140,65,'Boosted trees','tower','reach leaves')}${arrow(311,123,341,123)}${box(347,90,140,65,'Leaf indicators','node','sparse features')}${arrow(488,123,518,123)}${box(524,90,131,65,'Logistic head','tower','click probability')}`;
  } else if(name==='wide-deep') body=split('Encoded features','Wide branch','Deep branch','linear + chosen crosses','embeddings + MLP');
  else if(name==='dcn') body=split('Input vector x0','Cross network','Deep network','x0 reused at each layer','nonlinear layers');
  else if(name==='dcn-v2') body=split('Input vector x0','V2 cross layers','Deep network','matrix / low-rank options','parallel form shown');
  else if(name==='deepfm') body=split('Shared embeddings','Linear + FM','Deep branch','explicit pair interactions','flatten + MLP');
  else if(name==='xdeepfm') {
    body=`${box(5,98,140,55,'Feature inputs','node')}${[30,125,220].map((y,i)=>`<path class="flow" d="M145 125 H185 V${y} H225" marker-end="url(#arrow)"/>${box(230,y-24,190,49,['Linear branch','CIN branch','Deep branch'][i],i===1?'tower':'node',['individual effects','explicit vector products','implicit interactions'][i])}<path class="flow" d="M420 ${y} H472 V125 H515" marker-end="url(#arrow)"/>`).join('')}${box(520,97,135,57,'Prediction','tower','sum + sigmoid')}`;
  } else if(name==='mmoe') {
    body=`${box(5,95,105,56,'Features','node')}${[37,125,213].map((y,i)=>`${arrow(110,123,157,y)}${box(163,y-25,132,50,`Expert ${i+1}`,'tower')}`).join('')}${[59,190].map((y,i)=>`${[37,125,213].map(ey=>arrow(296,ey,373,y)).join('')}${box(379,y-26,129,52,`Task ${i?'B':'A'} gate`,'node','input-dependent mix')}${arrow(509,y,545,y)}${box(551,y-26,104,52,`Head ${i?'B':'A'}`,'tower')}`).join('')}<text class="dim" x="330" y="251" text-anchor="middle">Both task-specific gates can mix the shared expert pool.</text>`;
  } else if(name==='ple') {
    body=`${[38,125,212].map((y,i)=>box(8,y-25,170,50,['Task A experts','Shared experts','Task B experts'][i],i===1?'tower':'node')).join('')}${arrow(178,38,295,63)}${arrow(178,125,295,63)}${arrow(178,125,295,188)}${arrow(178,212,295,188)}${box(301,36,149,55,'Task A gate','tower','A + shared')}${box(301,161,149,55,'Task B gate','tower','B + shared')}${arrow(451,63,505,63)}${arrow(451,188,505,188)}${box(511,36,144,55,'A stream','node','next layer / head')}${box(511,161,144,55,'B stream','node','next layer / head')}<text class="dim" x="330" y="260" text-anchor="middle">One task-routing stage shown. Intermediate shared gates can mix all groups.</text>`;
    caption='Task gates select their own experts plus shared experts; extraction stages are stacked in the progressive model. The shared-gate stream is omitted for clarity.';
  } else if(name==='two-sided') {
    body=`${box(5,33,170,58,'Treatment users','tower')}${box(5,165,170,58,'Control users','node')}${arrow(176,62,280,117)}${arrow(176,194,280,140)}${box(286,96,175,65,'Shared marketplace','node','inventory / competition')}${arrow(462,117,510,62)}${arrow(462,140,510,194)}${box(516,33,139,58,'Outcome A','tower')}${box(516,165,139,58,'Outcome B','node')}<text class="dim" x="330" y="260" text-anchor="middle">Changing treatment can change the resources faced by control.</text>`;
  } else if(name==='budget-split') {
    body=`${box(5,96,125,60,'Campaign','node','budget 100')}${arrow(131,126,206,57)}${arrow(131,126,206,199)}${box(212,29,158,56,'Ledger A: 50','tower')}${box(212,171,158,56,'Ledger B: 50','node')}${arrow(371,57,451,57)}${arrow(371,199,451,199)}${box(457,29,198,56,'Treatment partition','tower')}${box(457,171,198,56,'Control partition','node')}<text class="dim" x="330" y="126" text-anchor="middle">Separate per-arm debits; no shared remaining-budget balance.</text><text class="dim" x="330" y="265" text-anchor="middle">Equal budgets shown for equal-sized toy partitions; check design assumptions.</text>`;
  }
  if(!body)return '';
  return `<figure class="architecture primer-figure" tabindex="0"><div class="figure-label"><span>Follow the information flow →</span><span>Learning schematic</span></div>${svg(body,'0 0 660 280',`${name} information-flow schematic`)}<figcaption class="figure-caption">${caption}</figcaption></figure>`;
}

function decoratePrimers(article) {
  $$('.architecture-slot',article).forEach(slot=>{slot.innerHTML=modelDiagram(slot.dataset.diagram);});
  $$('[data-explorer]',article).forEach(slot=>{
    if(slot.dataset.explorer==='predictor')mountPredictor(slot);
    if(slot.dataset.explorer==='rank-order')mountRanking(slot);
  });
}

function mountPredictor(root) {
  let bias=-2;
  root.className='lab beginner-explorer';root.id='click-predictor';
  root.innerHTML=`<div class="lab-header"><span class="lab-label">BUILD A PREDICTION, ONE STEP AT A TIME</span><span class="lab-badge">Invented example</span></div><h3>From features to probability</h3><div id="predictor-figure"></div>${slider('match-feature','Topic match',0,1,.7,.05,'Weak match','Strong match')}${slider('fatigue-feature','Recent exposure / fatigue',0,1,.2,.05,'Low fatigue','High fatigue')}${toggle('clicked-label','Observed label: the user clicked (y = 1)')}<button id="update-bias">Train one bias step</button> <button id="reset-bias">Reset bias</button><div id="predictor-calculation" class="formula"></div><div id="predictor-stats" class="lab-stats" aria-live="polite"></div><p class="lab-note">Toy logistic model, not an empirically trained click predictor. One step changes only the bias; real training updates many parameters across many examples.</p>`;
  function update(){
    const match=Number($('#match-feature').value),fatigue=Number($('#fatigue-feature').value),y=Number($('#clicked-label').checked),z=bias+3*match-2*fatigue,p=1/(1+Math.exp(-z)),loss=-(y*Math.log(p)+(1-y)*Math.log(1-p));
    $('#match-feature-output').textContent=match.toFixed(2);$('#fatigue-feature-output').textContent=fatigue.toFixed(2);
    $('#predictor-figure').innerHTML=svg(`${box(5,70,140,58,'Features','node',`match ${match.toFixed(2)} / fatigue ${fatigue.toFixed(2)}`)}${arrow(146,99,183,99)}${box(189,70,139,58,'Weighted sum','tower',`z = ${z.toFixed(3)}`)}${arrow(329,99,366,99)}${box(372,70,117,58,'Sigmoid','node','1 / (1 + exp(-z))')}${arrow(490,99,527,99)}${box(533,70,122,58,`${(p*100).toFixed(1)}%`,'tower','predicted click')}`,'0 0 660 175','Input features produce a weighted logit, then a sigmoid click probability.');
    $('#predictor-calculation').textContent=`z = ${bias.toFixed(3)} + 3 × ${match.toFixed(2)} − 2 × ${fatigue.toFixed(2)} = ${z.toFixed(3)}`;
    $('#predictor-stats').innerHTML=`<div class="lab-stat"><strong id="prediction-probability">${p.toFixed(4)}</strong><span>predicted probability</span></div><div class="lab-stat"><strong>${loss.toFixed(4)}</strong><span>binary log loss · y=${y}</span></div><div class="lab-stat"><strong>${(p-y).toFixed(4)}</strong><span>gradient: p − y</span></div>`;
    return {p,y};
  }
  $$('input',root).forEach(input=>input.addEventListener('input',update));
  $('#update-bias').addEventListener('click',()=>{const {p,y}=update();bias-=.5*(p-y);update();});
  $('#reset-bias').addEventListener('click',()=>{bias=-2;update();});update();
}

function mountRanking(root) {
  root.className='lab beginner-explorer';root.id='ranking-objective';
  root.innerHTML=`<div class="lab-header"><span class="lab-label">ONE CANDIDATE SET, DIFFERENT GOALS</span><span class="lab-badge">Invented probabilities</span></div><h3>What are you ranking for?</h3><label class="select-label" for="rank-goal">Choose the scoring objective</label><select id="rank-goal"><option value="click">Click probability</option><option value="conversion">Conversion probability per impression</option><option value="value">Expected toy value per impression</option></select>${slider('boots-value','Boots: value per conversion',1,20,5,1)}<div id="objective-table"></div><p id="ranking-winner" class="formula" aria-live="polite"></p><p class="lab-note">Expected toy value = per-impression conversion probability × invented value per conversion. This is not Snap’s auction formula. The probabilities here are not conditional on a click.</p>`;
  function update(){
    const value=Number($('#boots-value').value),goal=$('#rank-goal').value;$('#boots-value-output').textContent=`${value} units`;
    const items=[{name:'Hiking boots',click:.06,conversion:.01,value},{name:'Coffee offer',click:.04,conversion:.02,value:3},{name:'Mobile game',click:.12,conversion:.004,value:4}];
    for(const item of items)item.score=goal==='value'?item.conversion*item.value:item[goal];items.sort((a,b)=>b.score-a.score);
    $('#objective-table').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Rank</th><th>Candidate</th><th>p(click)</th><th>p(conversion)</th><th>Score</th></tr></thead><tbody>${items.map((item,i)=>`<tr><td>${i+1}</td><td>${item.name}</td><td>${(item.click*100).toFixed(1)}%</td><td>${(item.conversion*100).toFixed(1)}%</td><td>${item.score.toFixed(3)}${goal==='value'?' units':''}</td></tr>`).join('')}</tbody></table></div>`;
    $('#ranking-winner').textContent=`First candidate: ${items[0].name}. The shortlist did not change; the objective did.`;
  }
  $('#rank-goal').addEventListener('change',update);$('#boots-value').addEventListener('input',update);update();
}
