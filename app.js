/* Static, dependency-free reading experience. All learning state stays local. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'retrieval-lab-v1';
let course, route, state = {done: [], tasks: {}};
try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && Array.isArray(saved.done)) state = {done: saved.done.filter(n => Number.isInteger(n) && n >= 0 && n < 9), tasks: saved.tasks || {}}; } catch { /* Private browsing may disable storage. */ }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { toast('Browser storage is unavailable. Progress will last for this visit.'); return false; } }
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2500); }
const footer = () => `<footer class="site-footer"><span>Retrieval Lab · Learn it. See it. Build it.</span><span>Independent learning project · Public research, practical experiments.</span></footer>`;
function topbar(label) { return `<div class="topline"><div class="trail"><a href="#/">Retrieval Lab</a><span>/</span>${esc(label)}</div><span class="quiet">A field guide, from first principles to working code</span></div>`; }
function syncNav() {
  $('#lesson-nav').innerHTML = course.lessons.map(l => `<a class="lesson-link ${state.done.includes(l.id) ? 'done' : ''} ${route === `/lesson/${l.id}` ? 'active' : ''}" href="#/lesson/${l.id}" ${route === `/lesson/${l.id}` ? 'aria-current="page"' : ''}><span class="number">${state.done.includes(l.id) ? '✓' : String(l.id).padStart(2, '0')}</span>${esc(l.title)}</a>`).join('');
  $$('.resource-link,.nav-overview').forEach(a => { const active = a.getAttribute('href') === `#${route}`; a.classList.toggle('active', active); if(active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('#progress-label').textContent = `${state.done.length} / 9`;
  $('#course-progress').value = state.done.length;
  $('#course-progress').textContent = `${state.done.length} of 9 lessons`;
}
function svg(body, viewBox = '0 0 660 240', label = 'Interactive retrieval diagram') { return `<svg class="diagram" viewBox="${viewBox}" role="img" aria-label="${esc(label)}"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#8da28f"/></marker><marker id="query-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#b64f30"/></marker></defs>${body}</svg>`; }
function box(x,y,w,h,label,kind='node',sub='') {return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="${kind}"/><text x="${x+w/2}" y="${y+h/2+(sub?-1:4)}" text-anchor="middle">${esc(label)}</text>${sub?`<text class="dim" x="${x+w/2}" y="${y+h/2+16}" text-anchor="middle">${esc(sub)}</text>`:''}`;}
function arrow(x1,y1,x2,y2) {return `<path class="flow" d="M${x1} ${y1} L${x2} ${y2}" marker-end="url(#arrow)"/>`;}
function architecture() {
  return svg(`${box(5,32,100,49,'User','node','ID or history')}${box(5,151,100,49,'Item','node','ID + features')}${box(145,27,130,59,'User tower','tower','request-time')}${box(145,146,130,59,'Item tower','tower','computed offline')}${arrow(105,56,141,56)}${arrow(105,176,141,176)}${arrow(275,56,310,56)}${arrow(275,176,310,176)}
  ${[0,1,2,3,4,5].map(i=>`<rect x="${316+i*11}" y="43" width="8" height="27" rx="2" fill="${['#acc2a8','#6c9979','#335f49','#b6c9a9','#8cae8d','#527b60'][i]}"/><rect x="${316+i*11}" y="163" width="8" height="27" rx="2" fill="${['#8cae8d','#335f49','#6c9979','#acc2a8','#527b60','#b6c9a9'][i]}"/>`).join('')}
  <text class="dim" x="348" y="89" text-anchor="middle">query vector</text><text class="dim" x="348" y="209" text-anchor="middle">item vectors</text><path class="flow" d="M388 56 H416 V113 H446" marker-end="url(#arrow)"/><path class="flow" d="M388 176 H416 V126 H446" marker-end="url(#arrow)"/>${box(451,92,90,54,'Similarity','node','dot product')}${arrow(542,119,574,119)}${box(578,92,76,54,'Top K','tower','candidates')}`, '0 0 660 235', 'Separate user and item encoders produce embeddings; dot-product search retrieves the top K candidates.');
}
function home() {
  const next = course.lessons.find(l => !state.done.includes(l.id)) || course.lessons[0];
  $('#main').innerHTML = `${topbar('The learning path')}<section class="hero"><span class="eyebrow">FROM FIRST PRINCIPLES TO YOUR FIRST RETRIEVER</span><h1>Find the right things.<br><em>Understand how.</em></h1><p class="intro">A hands-on field guide to ML retrieval. Start with the idea, make it click with an interactive example, then build it yourself in PyTorch.</p><div class="pill-row"><span><i></i>9 guided lessons</span><span><i></i>Interactive diagrams</span><span><i></i>Research-backed exercises</span></div><div class="hero-actions"><a class="button primary" href="#/lesson/${next.id}">${state.done.length ? 'Continue learning' : 'Start with the fundamentals'} <span>→</span></a><a class="button secondary" href="#/roadmap">See the eight-week plan</a></div></section>
  <figure class="architecture"><div class="figure-label"><span>01 / The idea you’re going to build</span><span>Two towers. One shared space.</span></div>${architecture()}<figcaption class="figure-caption">Encode separately. Compare in a shared space. Retrieve a small set of candidates for a heavier ranker.</figcaption></figure>
  <div class="section-heading"><h2>One idea at a time.</h2><span>CONCEPT → EXPLORE → BUILD</span></div><section class="lesson-grid" aria-label="Lessons">${course.lessons.map(l=>`<a class="lesson-card" href="#/lesson/${l.id}"><div class="card-meta"><span>LESSON ${String(l.id).padStart(2,'0')}</span><span>${state.done.includes(l.id)?'✓ COMPLETE':'↗'}</span></div><h3>${esc(l.title)}</h3><p>${esc(l.description)}</p><div class="card-foot"><span>${l.minutes} min read + hands-on practice</span><span>→</span></div></a>`).join('')}</section><div class="note"><strong>Read a little. Build something. Explain what happened.</strong><br>Each lesson follows concept → worked example → application → implementation. Research papers support the decisions; your own experiments test them.</div>${footer()}`;
}
const answers = [
  ['No. Reordering a fixed candidate set changes positions, not which relevant items survived retrieval.','It frees serving time or computation that can support a larger candidate set, a heavier ranker, or lower response latency.','You need a label definition and observation window, exposure information, and a decision about the downstream outcome you want retrieval to preserve.'],
  ['Its output would change with each query, so one precomputed vector per item would no longer represent the query-dependent function.','Vector magnitude is removed. Only direction contributes to normalized dot-product similarity. Norms can otherwise carry useful signals.','There is no learned row for a new ID. Content features or an explicit fallback are needed for a meaningful new-item representation.'],
  ['Batch size changes the candidate set and negative distribution in the loss. It also changes compute, memory, and the chance of duplicate or false-negative items.','The sampled objective can improve without better ordering against the full eligible catalog. Generalization, sampling mismatch, and easy positives all matter.','No. Dividing fixed scores by a positive temperature preserves their ordering. Temperature affects probabilities and training dynamics.'],
  ['Sampling a small set of easy distractors or forgetting seen-item filtering changes the task and can make the comparison misleading.','Movie popularity is uneven and shared across users. A short ID-only training run may not learn personalization that improves on that strong signal.','A claim of reliable superiority needs uncertainty estimates and repeated seeds; repeated tuning also calls for an untouched future evaluation period.'],
  ['Training or changing features changes the vectors. Index parameters change how well or cheaply the search approximates those fixed vectors.','Index construction is a separate cost, usually amortized across many queries. Including it would mix serving latency with an offline operation.','Matching dimensions do not imply a shared coordinate system, and returned integer IDs must map to the correct catalog items.'],
  ['A high-scoring unobserved item may actually be relevant. Mining it aggressively can train the model to reject a false negative.','A draw probability is not necessarily the probability an item appears in the candidate set. Inclusion probabilities and expected counts depend on replacement and duplicate handling.','The query encoder changes while queued item vectors may come from older parameters, making the training comparison inconsistent.'],
  ['Content-dependent attention can weight items differently, but without positional/time signals its pooling remains insensitive to the order of a permuted history.','Raw dataset IDs and contiguous model IDs differ. A mismatched join can silently attach the wrong features to every item.','Sometimes, but one vector can compromise between unrelated regions. Inspect actual users and measure coverage before adding a multi-interest model.'],
  ['Changes to content used by the encoder or the embedding model require new vectors. Budgets and targeting may be mutable eligibility metadata, depending on the architecture.','The old and new encoders may define incompatible spaces. An insertion is valid only if the new item uses the compatible model and feature pipeline.','Return fewer eligible items or use an explicitly eligible fallback. Never fill the remaining slots with prohibited candidates.'],
  ['The offline labels, candidate pool, and logged distribution must be informative about the new online exposure policy. Randomized experiments test outcomes under their design assumptions.','Outcomes can be observed after a prediction to construct labels. Input features must still contain only information available when the prediction was made.','Compare strong baselines, slices, serving cost, eligibility, cold start, freshness, and reproducibility; distinguish offline evidence from online impact.']
];
function lesson(id) {
  const l=course.lessons[id]; if(!l) return notFound();
  $('#main').innerHTML=`${topbar(`Lesson ${String(id).padStart(2,'0')}`)}<div class="reader-layout"><div><header class="reader-head"><span class="eyebrow">LESSON ${String(id).padStart(2,'0')} / 08</span><h1>${esc(l.title)}</h1><p class="intro">${esc(l.description)}</p><div class="lesson-meta"><span>${l.minutes} min read</span><span class="tag">Concept → application → implementation</span></div></header><article class="article" id="lesson-article">${l.html}</article><div class="lesson-bottom"><button class="mark-done ${state.done.includes(id)?'completed':''}" id="mark-done" aria-pressed="${state.done.includes(id)}">${state.done.includes(id)?'✓ Lesson complete':'Mark lesson complete'}</button><a class="button secondary" href="#/start">Open the implementation checklist ↗</a></div><nav class="lesson-pager" aria-label="Previous and next lessons">${id>0?`<a href="#/lesson/${id-1}"><small>← PREVIOUS LESSON</small>${esc(course.lessons[id-1].title)}</a>`:'<a href="#/">← Back to the learning path</a>'}${id<8?`<a href="#/lesson/${id+1}"><small>NEXT LESSON →</small>${esc(course.lessons[id+1].title)}</a>`:'<a href="#/roadmap">Open your roadmap →</a>'}</nav></div><aside class="toc" id="toc" aria-label="On this page"></aside></div>${footer()}`;
  const article=$('#lesson-article');
  const application=$$('h2',article).find(h=>h.textContent.startsWith('Application'));
  const placeholder=document.createElement('section'); placeholder.className='lab'; placeholder.setAttribute('aria-label','Interactive worked example'); placeholder.id='interactive-example'; placeholder.innerHTML=labMarkup(id);
  if(application) application.before(placeholder); else article.append(placeholder);
  const self=$$('h2',article).find(h=>h.textContent==='Self-check');
  if(self && self.nextElementSibling?.tagName==='UL') {
    const list=self.nextElementSibling;
    const questions=$$('li',list).map(li=>li.textContent);
    const details=document.createElement('div');
    details.className='checks';
    details.innerHTML=questions.map((q,i)=>`<details class="check-question"><summary>${esc(q)}</summary><p>${esc(answers[id][i] || 'Work through the example and explain the relevant assumption in your own words.')}</p></details>`).join('');
    list.replaceWith(details);
  }
  $('#mark-done').addEventListener('click',event=>{
    if(state.done.includes(id)) state.done=state.done.filter(n=>n!==id); else state.done.push(id);
    persist(); syncNav(); const done=state.done.includes(id);
    event.target.classList.toggle('completed',done); event.target.setAttribute('aria-pressed',String(done));
    event.target.textContent=done?'✓ Lesson complete':'Mark lesson complete';
    toast(done?'Lesson complete. Keep building.':'Lesson marked as in progress.');
  });
  bindLab(id); decorate(article,`lesson-${id}`); renderTOC(article,l.source);
}
function renderTOC(article,source) {
  const headings=$$('h2',article);
  $('#toc').innerHTML=`<h2>IN THIS LESSON</h2>${headings.map(h=>`<a href="#${esc(h.id)}" data-section="${esc(h.id)}">${esc(h.textContent)}</a>`).join('')}<a href="#interactive-example" data-section="interactive-example">Try it yourself</a><a class="back-source" href="${source}" target="_blank" rel="noopener">View lesson source ↗</a>`;
}
function decorate(article,page) {
  $$('pre',article).forEach(pre=>{
    const button=document.createElement('button'); button.className='copy-button'; button.textContent='Copy'; button.setAttribute('aria-label','Copy code block');
    button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('code',pre)?.textContent || pre.textContent);button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1500);}catch{toast('Select the code and copy it with your keyboard.');}}); pre.append(button);
  });
  $$('table',article).forEach(table=>{const wrapper=document.createElement('div');wrapper.className='table-wrap';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Scrollable table');table.before(wrapper);wrapper.append(table);});
  let taskIndex=0;
  $$('li',article).forEach(li=>{
    if(!/^\[ \] /.test(li.textContent))return;
    const key=`${page}-${taskIndex++}`;li.classList.add('task');
    li.innerHTML=li.innerHTML.replace(/^\[ \] /,'');
    const label=document.createElement('label');label.innerHTML=li.innerHTML;li.innerHTML='';
    const input=document.createElement('input');input.type='checkbox';input.checked=!!state.tasks[key];input.setAttribute('aria-label',label.textContent.trim());
    input.addEventListener('change',()=>{state.tasks[key]=input.checked;persist();});label.prepend(input);li.append(label);
  });
}
const pageNames={roadmap:'The eight-week roadmap',start:'Your first implementation',evaluation:'The evaluation contract','ann-lab':'The FAISS implementation lab'};
function referencePage(name) {
  const page=course.pages[name];if(!page)return notFound();
  $('#main').innerHTML=`${topbar('Your workbench')}<div class="reader-layout"><div><header class="reader-head"><span class="eyebrow">YOUR WORKBENCH</span><h1>${esc(pageNames[name])}</h1><p class="intro">Turn understanding into a reproducible project. Checklists save automatically on this browser.</p></header><article class="article" id="reference-article">${page.html}</article></div><aside class="toc" id="toc"></aside></div>${footer()}`;
  decorate($('#reference-article'),name);renderTOC($('#reference-article'),page.source);
}
function papers(filter='all') {
  const filtered=course.papers.filter(p=>filter==='all'||p.phases.includes(Number(filter)));
  $('#main').innerHTML=`${topbar('Paper library')}<header class="reader-head"><span class="eyebrow">READ FOR A DECISION, NOT FOR A TITLE</span><h1>Ideas worth building on.</h1><p class="intro">Sixteen research references, connected to your project. Start with the question you’re trying to answer; read the method and evaluation when you need them.</p></header><div class="note"><strong>Start with the real-world context.</strong><br><a href="https://eng.snap.com/machine-learning-snap-ad-ranking" target="_blank" rel="noopener">Snap’s Machine Learning for Snapchat Ad Ranking ↗</a> introduces the public funnel. It does not establish the current architecture of any specific team.</div><div class="paper-filters" aria-label="Filter papers by topic">${[['all','All papers'],['1','Foundations'],['2','Evaluation'],['3','ANN search'],['4','Training'],['5','Features'],['6','Ads & cold start'],['7','Production']].map(([value,label])=>`<button data-filter="${value}" class="${filter===value?'selected':''}" aria-pressed="${filter===value}">${label}</button>`).join('')}</div><div class="paper-counter" role="status">${filtered.length} references</div><section id="paper-list">${filtered.map(p=>`<article class="paper-entry"><span class="paper-meta">${p.year} / ${esc(p.venue)}</span><h2>${esc(p.title)}</h2><p>${esc(p.authors.replaceAll(' and ', ', '))}</p><div class="paper-links"><a href="${esc(p.url)}" target="_blank" rel="noopener">Publication ↗</a>${p.pdf?`<a href="${esc(p.pdf)}" target="_blank" rel="noopener">Read PDF ↗</a>`:''}<span>Phase ${p.phases.join(' · ')}</span></div></article>`).join('')}</section><details class="check-question"><summary>How should I read and take notes?</summary><article class="article">${course.pages.papers.html}</article></details>${footer()}`;
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>papers(button.dataset.filter)));
}
function notFound() {$('#main').innerHTML=`${topbar('Page not found')}<h1>This path doesn’t exist yet.</h1><a class="button primary" href="#/">Return to the learning path →</a>`;}
function navigate() {
  route=location.hash.slice(1).split('?')[0]||'/';
  if(route==='/')home();else if(/^\/lesson\/\d+$/.test(route))lesson(Number(route.split('/')[2]));else if(route==='/papers')papers();else referencePage(route.slice(1));
  syncNav();$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');
  document.title=route.startsWith('/lesson/')?`${course.lessons[Number(route.split('/')[2])]?.title||'Lesson'} — Retrieval Lab`:'Retrieval Lab — Learn it. See it. Build it.';
  window.scrollTo(0,0);$('#reading-fill').style.width='0%';
}
function search(query) {
  const out=$('#search-results');query=query.trim().toLowerCase();out.hidden=!query;if(!query)return;
  const matches=[...course.lessons.filter(l=>`${l.title} ${l.html.replace(/<[^>]+>/g,' ')}`.toLowerCase().includes(query)).map(l=>({title:l.title,href:`#/lesson/${l.id}`,type:`Lesson ${String(l.id).padStart(2,'0')}`})),...course.papers.filter(p=>`${p.title} ${p.authors}`.toLowerCase().includes(query)).map(p=>({title:p.title,href:p.url,type:`Paper · ${p.year}`}))].slice(0,12);
  out.innerHTML=matches.length?matches.map(m=>`<a class="search-hit" href="${esc(m.href)}" ${m.href.startsWith('http')?'target="_blank" rel="noopener"':''}><small>${m.type}</small>${esc(m.title)}</a>`).join(''):'<p class="search-empty">No matching lessons or papers. Try “temperature” or “cold start”.</p>';
}

/* The labs use actual computations over small, explicitly illustrative examples. */
const slider=(id,label,min,max,value,step=1,left='',right='')=>`<div class="control"><label for="${id}">${label}<output id="${id}-output" for="${id}">${value}</output></label><input type="range" id="${id}" min="${min}" max="${max}" value="${value}" step="${step}"><div class="control-hints"><span>${left}</span><span>${right}</span></div></div>`;
const toggle=(id,label)=>`<label class="toggle-label"><input type="checkbox" id="${id}">${label}</label>`;
function labMarkup(id) {
  const specs=[
    ['A million items. A small shortlist.','Change the candidate budget. Notice how much work remains for the heavy ranker.',slider('candidates','Candidates passed to ranking',100,2000,500,100,'Smaller shortlist','More candidates')],
    ['Similarity has a direction.','Rotate the query vector. The item with the largest dot product changes with it.',slider('angle','User vector angle',0,90,25,1,'Interest A','Interest B')],
    ['Watch the softmax sharpen.','Change temperature, then introduce a duplicate positive. The loss sums probability over every positive column.',slider('temperature','Temperature',.05,2,.5,.05,'Sharper','Softer')+toggle('duplicate','The second column is a duplicate positive')],
    ['How much relevance survives?','The green items are relevant. Increase K, or remove seen items from the eligible pool.',slider('recall-k','Number of candidates · K',1,10,3)+toggle('exclude-seen','Exclude seen items 5 and 2')],
    ['Search more regions. Recover more neighbors.','A toy IVF-style search: probe coarse regions in query-distance order and find the top 10 among their items.',slider('nprobe','Regions searched · nprobe',1,4,1,1,'Less work','Exact at all 4')],
    ['Same logits. Different sampling odds.','Compare a sampled softmax before and after subtracting log Q. This toy illustrates the correction, not a complete training objective.',toggle('logq','Apply −log Q to training logits')],
    ['A history is more than an ID.','Weight two past interests. The pooled vector changes, but swapping their order still leaves mean pooling unchanged.',slider('history-weight','Weight on the second history item',0,1,.5,.05,'First interest','Second interest')],
    ['Good scores are only the beginning.','Overfetch, then apply an illustrative eligibility rule. See whether three usable candidates remain.',slider('overfetch','Candidates fetched before filtering',3,10,4)+toggle('version-mismatch','Simulate a query/index version mismatch')],
    ['Wait for the label to mature.','A toy two-day conversion window. An impression is not a settled negative before its observation window closes.',slider('label-age','Hours since the impression',0,96,12,1,'Just served','Four days later')]
  ];
  const [title,instruction,controls]=specs[id];
  return `<div class="lab-header"><span class="lab-label">EXPLORE THE IDEA</span><span class="lab-badge">Interactive example</span></div><h3>${title}</h3><p class="lab-instruction">${instruction}</p><div id="lab-viz" tabindex="0" role="region" aria-label="Interactive diagram; scroll horizontally on small screens"></div><small class="diagram-hint">Swipe across the diagram to explore →</small>${controls}<div class="lab-stats" id="lab-stats" aria-live="polite" aria-atomic="true"></div><p class="lab-note" id="lab-note"></p>`;
}
function stats(entries){$('#lab-stats').innerHTML=entries.map(([value,label])=>`<div class="lab-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');}
function softmax(values) {const m=Math.max(...values),e=values.map(x=>Math.exp(x-m)),total=e.reduce((a,b)=>a+b,0);return e.map(v=>v/total);}
function bars(labels,values,probabilities=true){return labels.map((label,i)=>`<div class="score-row"><span>${label}</span><div class="score-track"><div class="score-bar" style="width:${values[i]*100}%"></div></div><span class="score-value">${probabilities?`${(values[i]*100).toFixed(1)}%`:values[i].toFixed(3)}</span></div>`).join('');}
function vectorPlot(angle,history=false) {
  const radians=angle*Math.PI/180,cx=170,cy=205,r=148;
  return svg(`<path class="axis" d="M${cx} 25 V${cy} H365"/><path d="M${cx+r} ${cy} A${r} ${r} 0 0 0 ${cx} ${cy-r}" fill="none" stroke="#d5ddcd" stroke-dasharray="4 5"/>${[0,45,90].map((a,i)=>{const x=cx+r*Math.cos(a*Math.PI/180),y=cy-r*Math.sin(a*Math.PI/180);return `<circle cx="${x}" cy="${y}" r="6" class="point"/><text x="${x+(a===90?14:12)}" y="${y+(a===0?-9:4)}" class="dim">${['A [1, 0]','B [0.71, 0.71]','C [0, 1]'][i]}</text>`;}).join('')}<path class="query" d="M${cx} ${cy} L${cx+r*Math.cos(radians)} ${cy-r*Math.sin(radians)}" marker-end="url(#query-arrow)"/><circle cx="${cx}" cy="${cy}" r="3" fill="#b64f30"/><text x="450" y="75" class="dim">${history?'POOLED HISTORY':'QUERY VECTOR'}</text><text x="450" y="103" class="mono">[${Math.cos(radians).toFixed(2)}, ${Math.sin(radians).toFixed(2)}]</text><text x="450" y="142" class="dim">All arrows are normalized.</text><text x="450" y="161" class="dim">Dot product = cosine.</text>`, '0 0 660 250','Unit vectors on a quarter circle; the rust arrow is the adjustable query direction.');
}
function bindLab(id) {
  const root=$('#interactive-example');if(!root)return;
  const update=()=>updateLab(id);
  $$('input',root).forEach(input=>input.addEventListener('input',()=>{const out=$(`#${input.id}-output`);if(out)out.textContent=input.value;update();}));update();
}
function updateLab(id) {
  const viz=$('#lab-viz'),note=$('#lab-note');
  if(id===0){
    const n=Number($('#candidates').value);
    viz.innerHTML=svg(`${box(5,57,139,74,'1,000,000 items','node','eligible catalog')}${arrow(145,94,181,94)}${box(186,57,139,74,'Retrieval','tower',`${n.toLocaleString()} candidates`)}${arrow(326,94,362,94)}${box(367,57,139,74,'Heavy ranker','node',`${(n*.2).toFixed(0)} ms serial cost`)}${arrow(507,94,543,94)}${box(548,57,107,74,'Auction','node','final decision')}<text class="dim" x="330" y="169" text-anchor="middle">A relevant item lost during retrieval never reaches the ranker.</text>`,'0 0 660 195','Eligibility, retrieval, ranking, and auction form a sequential funnel.');
    stats([[`${n.toLocaleString()}`,'candidate budget'],[`${(n*.2).toFixed(0)} ms`,'illustrative ranking work'],[`${(1e6/n).toFixed(0)}×`,'fewer items to rank']]);
    note.textContent='Illustrative arithmetic at 0.2 ms per item, scored serially. Real serving batches and parallelizes work. This is not a measured latency or a recall prediction.';
  }else if(id===1){
    const angle=Number($('#angle').value),scores=[0,45,90].map(a=>Math.cos((angle-a)*Math.PI/180));viz.innerHTML=vectorPlot(angle)+bars(['Item A','Item B','Item C'],scores,false);
    stats([[['A','B','C'][scores.indexOf(Math.max(...scores))],'highest-scoring item'],[Math.max(...scores).toFixed(3),'largest dot product'],['1.00','query vector norm']]);note.textContent='At the halfway angles, equal scores are ties. Normalization removes vector magnitude as a signal; it is a modeling choice.';
  }else if(id===2){
    const t=Number($('#temperature').value),dup=$('#duplicate').checked,raw=dup?[.8,.8,-.2]:[.8,.4,-.2],prob=softmax(raw.map(x=>x/t)),positive=prob[0]+(dup?prob[1]:0);
    viz.innerHTML=`${svg(`${box(20,30,125,55,'User query','tower')}${arrow(146,58,201,58)}${raw.map((x,i)=>box(213+i*146,30,125,55,`Item ${i+1}`,'node',`score ${x.toFixed(1)}${i===0||dup&&i===1?' · positive':''}`)).join('')}`,'0 0 660 108','A query is compared to three batch candidate columns.')}${bars(['Column 1','Column 2','Column 3'],prob)}<div class="formula">loss = −log(${prob[0].toFixed(4)}${dup?` + ${prob[1].toFixed(4)}`:''})</div>`;
    stats([[t.toFixed(2),'temperature'],[`${(positive*100).toFixed(1)}%`,'total positive probability'],[(-Math.log(positive)).toFixed(4),'row loss']]);note.textContent=dup?'Both copies contribute positive probability mass. Neither is labeled a negative.':'Only column 1 is a known positive in this toy batch. Unobserved candidates can still be false negatives.';
  }else if(id===3){
    const k=Number($('#recall-k').value),exclude=$('#exclude-seen').checked,relevant=[1,4,7],seen=[5,2],ranking=[5,2,7,1,9,4,8,6,3,0],eligible=ranking.filter(i=>!exclude||!seen.includes(i)),top=eligible.slice(0,k),hits=top.filter(i=>relevant.includes(i));
    viz.innerHTML=`<div class="chips">${ranking.map(i=>`<span class="chip ${top.includes(i)?'in-top':''} ${relevant.includes(i)?'relevant':''} ${exclude&&seen.includes(i)?'seen':''}">Item ${i}</span>`).join('')}</div><div class="legend"><span>Green fill = relevant</span><span>Border = retrieved top K</span></div><div class="formula">Recall@${k} = ${hits.length} relevant retrieved / ${relevant.length} relevant targets</div>`;
    stats([[`${(hits.length/3*100).toFixed(0)}%`,'multi-target recall'],[`${top.length} / ${eligible.length}`,'retrieved / eligible'],[`${(Math.min(k/eligible.length,1)*100).toFixed(0)}%`,'expected random recall']]);note.textContent='This example has three relevant targets. The MovieLens reference holds out one target per query, so its Recall@K equals HitRate@K. If K exceeds the pool, return only the available items.';
  }else if(id===4){
    const n=Number($('#nprobe').value),centers=[[135,85],[445,80],[170,205],[460,205]],query=[287,130],distance=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
    const clusters=centers.map((c,i)=>({i,d:distance(c,query)})).sort((a,b)=>a.d-b.d).slice(0,n).map(x=>x.i);
    const points=centers.flatMap((c,cluster)=>Array.from({length:20},(_,j)=>({id:cluster*20+j,cluster,p:[c[0]+Math.sin(j*4.31+cluster)*64,c[1]+Math.cos(j*2.74+cluster)*43]})));
    const exact=[...points].sort((a,b)=>distance(a.p,query)-distance(b.p,query)).slice(0,10).map(p=>p.id);
    const candidates=points.filter(p=>clusters.includes(p.cluster));const approx=[...candidates].sort((a,b)=>distance(a.p,query)-distance(b.p,query)).slice(0,10).map(p=>p.id);const found=exact.filter(i=>approx.includes(i)).length;
    viz.innerHTML=svg(`${centers.map((c,i)=>`<ellipse cx="${c[0]}" cy="${c[1]}" rx="83" ry="59" fill="${clusters.includes(i)?'#dce7d5':'none'}" stroke="#c4d0bc" stroke-dasharray="4 4"/><text class="dim" x="${c[0]}" y="${c[1]-66}">Region ${i+1}</text>`).join('')}${points.map(p=>`<circle cx="${p.p[0]}" cy="${p.p[1]}" r="${exact.includes(p.id)?5:3}" fill="${exact.includes(p.id)?'#b64f30':clusters.includes(p.cluster)?'#527b60':'#c8cec1'}" ${approx.includes(p.id)?'stroke="#242b27" stroke-width="1.5"':''}/>`).join('')}<path d="M${query[0]-6} ${query[1]} h12 M${query[0]} ${query[1]-6} v12" stroke="#242b27" stroke-width="2"/><text class="dim" x="${query[0]+12}" y="${query[1]+3}">query</text>`,'0 0 660 285','Four coarse regions of item points. Probed regions are shaded, exact neighbors are rust, and returned neighbors have dark outlines.');
    stats([[`${found} / 10`,'exact neighbors recovered'],[`${candidates.length} / 80`,'item distances computed'],[`${found*10}%`,'neighbor overlap@10']]);note.textContent='Rust points are exact neighbors; outlines mark approximate results. This deterministic Euclidean toy illustrates IVF-style probing. It does not model HNSW, production latency, or the reference’s inner-product index.';
  }else if(id===5){
    const apply=$('#logq').checked,q=[.6,.3,.1],values=q.map(v=>2-(apply?Math.log(v):0)),prob=softmax(values);
    viz.innerHTML=`${bars(['A · Q=0.6','B · Q=0.3','C · Q=0.1'],prob)}<div class="formula">${apply?'corrected training logit = 2 − log Q(item)':'uncorrected training logit = 2 for every item'}</div><div class="table-wrap"><table><thead><tr><th>Item</th><th>Q</th><th>Logit</th></tr></thead><tbody>${q.map((v,i)=>`<tr><td>${['A','B','C'][i]}</td><td>${v}</td><td>${values[i].toFixed(3)}</td></tr>`).join('')}</tbody></table></div>`;
    stats([[apply?'On':'Off','sampling correction'],[`${(prob[2]*100).toFixed(1)}%`,'item C probability'],['Training','where correction applies']]);note.textContent='Derive Q, duplicate handling, positive inclusion, and expected counts for your actual sampler before changing the loss. Sampling correction does not remove impression or auction selection bias.';
  }else if(id===6){
    const w=Number($('#history-weight').value),x=1-w,y=w,norm=Math.hypot(x,y),angle=Math.atan2(y,x)*180/Math.PI;viz.innerHTML=vectorPlot(angle,true)+`<div class="formula">pooled = ${(1-w).toFixed(2)} × [1, 0] + ${w.toFixed(2)} × [0, 1] = [${x.toFixed(2)}, ${y.toFixed(2)}]</div>`;
    stats([[w.toFixed(2),'second-item weight'],[norm.toFixed(3),'norm before normalization'],[`${angle.toFixed(1)}°`,'normalized direction']]);note.textContent='The plot shows the normalized pooled vector. Weight 0.5 is mean pooling. A history permutation does not change a mean; sequence models need position/time signals and pre-target histories.';
  }else if(id===7){
    const n=Number($('#overfetch').value),mismatch=$('#version-mismatch').checked,blocked=[0,1,4,6],fetched=Array.from({length:n},(_,i)=>i),eligible=fetched.filter(i=>!blocked.includes(i)),returned=mismatch?[]:eligible.slice(0,3);
    viz.innerHTML=`${svg(`${box(5,35,155,60,'User tower v2','tower')}${arrow(161,65,213,65)}${box(220,35,170,60,`Item index ${mismatch?'v1':'v2'}`,'node',mismatch?'incompatible':'compatible')}${arrow(391,65,444,65)}${box(450,35,205,60,mismatch?'Reject request':'Filter + return top 3',mismatch?'node':'tower')}`,'0 0 660 130','The user tower and item index must use compatible versions.')}<div class="chips">${fetched.map(i=>`<span class="chip ${blocked.includes(i)?'seen':''} ${returned.includes(i)?'relevant in-top':''}">Ad ${i}${blocked.includes(i)?' ×':''}</span>`).join('')}</div>`;
    stats([[mismatch?'Blocked':`${returned.length} / 3`,'eligible slots filled'],[n,'fetched candidates'],[mismatch?'Mismatch':'v2 + v2','version check']]);note.textContent=mismatch?'Matching dimensions are not enough. Reject a mixed model/index pair before scoring; do not return misleading results.':'Crossed-out ads fail a mock eligibility rule. Overfetching helps fill K eligible slots, but it adds work and cannot create more eligible inventory.';
  }else if(id===8){
    const age=Number($('#label-age').value),mature=age>=48,width=Math.min(age/96,1)*580;
    viz.innerHTML=svg(`<rect x="35" y="75" width="580" height="15" rx="5" fill="#d8dfcf"/><rect x="35" y="75" width="${width}" height="15" rx="5" fill="${mature?'#285c48':'#b64f30'}"/><path d="M325 53 V112" stroke="#285c48" stroke-dasharray="4 4"/><text class="dim" x="35" y="135">Impression</text><text x="325" y="40" text-anchor="middle">48h label window</text><text class="dim" x="615" y="135" text-anchor="end">96h</text><text x="330" y="185" text-anchor="middle">${mature?'Eligible for a settled label under this toy rule':'No conversion yet ≠ confirmed negative'}</text>`,'0 0 660 210','An impression’s label remains pending until the illustrative 48-hour observation window closes.');
    stats([[`${age}h`,'age of impression'],[mature?'Mature':'Pending','label-window status'],['Before','feature cutoff: prediction']]);note.textContent='Two days is an illustrative choice. Real observation windows depend on the outcome, reporting delay, and product. A mature example can be labeled negative only if no qualifying conversion occurred.';
  }
}

$('#menu-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.addEventListener('click',event=>{
  if(event.target.closest('a[href="#main"]')){event.preventDefault();$('#main').focus();$('#main').scrollIntoView();return;}
  const section=event.target.closest('[data-section]');if(section){event.preventDefault();document.getElementById(section.dataset.section)?.scrollIntoView();return;}
  const link=event.target.closest('.search-hit');if(link){$('#search-results').hidden=true;$('#search').value='';}
  if(innerWidth<=720&&!event.target.closest('#sidebar,.mobile-header')){$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#search-results').hidden=true;}if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();if(innerWidth<=720){$('#sidebar').classList.add('open');$('#menu-toggle').setAttribute('aria-expanded','true');}$('#search').focus();}});
$('#search').addEventListener('input',event=>{if(course)search(event.target.value);});
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#reading-fill').style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;},{passive:true});
window.addEventListener('hashchange',()=>{if(course)navigate();});
fetch('content.json').then(response=>{if(!response.ok)throw new Error('Content request failed');return response.json();}).then(data=>{course=data;navigate();}).catch(()=>{$('#main').innerHTML='<h1>The lessons couldn’t load.</h1><p>Refresh to try again, or read the <a href="https://github.com/ericsheng495/ads-retrieval-from-scratch/tree/main/tutorials">Markdown lessons in the project repository</a>.</p>';});
