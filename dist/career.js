/* Device-local interview drafts and deterministic JD keyword comparison. No AI scoring. */
window.createCareerUI = function (ctx) {
  const {C, getState, save, esc, link, button, heading, badge, empty, download, toast, independent, event} = ctx;
  const questions=window.INTERVIEW_BANK, byId=new Map(questions.map(q=>[q.id,q]));
  const categories=[...new Set(questions.map(q=>q.category))];
  const main=document.querySelector('#main');
  let filter={category:'all',status:'all',level:'all',search:'',page:1}, queue=[], timer=null, endAt=0, left=120;
  const getDraft=id=>getState().talkDrafts[id]||{answer:'',rating:'new',checks:[false,false,false],favorite:false,date:''};
  const labels={new:'未自评',weak:'还需补课',developing:'能说一部分',ready:'能讲清楚 · 自评'};
  const options=(items,current)=>items.map(([v,t])=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(t)}</option>`).join('');
  function stopTimer(){if(timer)clearInterval(timer);timer=null;endAt=0;left=120;}
  function updateDraft(id,patch){const s=getState();s.talkDrafts[id]={...getDraft(id),...patch};save();const badgeEl=document.querySelector('#talkRating');if(badgeEl){const rating=s.talkDrafts[id].rating;badgeEl.textContent=labels[rating];badgeEl.className='pill '+(rating==='ready'?'green':'');document.querySelectorAll('[data-action="talk-rate"]').forEach(b=>{b.classList.toggle('selected',b.dataset.rating===rating);b.setAttribute('aria-pressed',String(b.dataset.rating===rating));});}}
  function filterQuestions(){const text=filter.search.trim().toLowerCase();return questions.filter(q=>{
    const d=getDraft(q.id);
    return (filter.category==='all'||q.category===filter.category)&&(filter.level==='all'||q.level===filter.level)&&
      (filter.status==='all'||(filter.status==='favorite'?d.favorite:filter.status==='due'?['weak','developing'].includes(d.rating):d.rating===filter.status))&&
      (!text||[q.title,q.category,q.followup,...q.points].join(' ').toLowerCase().includes(text));
  });}
  function render(route){
    stopTimer();
    if(route[1]==='category'){
      let category='';try{category=decodeURIComponent(route[2]||'');}catch{}
      if(categories.includes(category)){filter.category=category;filter.page=1;}
    }else if(route[1]){
      const q=byId.get(route[1]);
      if(q){detail(q);return;}
      main.innerHTML=heading('INTERVIEW PRACTICE','这道题不存在。','可以回到题库重新选择。',link('返回面试题库','#interview','button primary'));return;
    }
    const drafts=questions.map(q=>getDraft(q.id)),done=drafts.filter(d=>d.rating!=='new').length,weak=drafts.filter(d=>['weak','developing'].includes(d.rating)).length;
    main.innerHTML=heading('INTERVIEW PRACTICE','把会做的，也讲清楚。','先独立说，再看思路。用原理、例子和验证接住每一个追问。',link('整理项目表达','#portfolio','button'))+
      `<section class="panel career-banner"><div><h2>每天 5 题，让表达更具体。</h2><p>8 个方向 · ${questions.length} 道开放式面试题。每题都有回答要点、追问、易错点和动手验证。</p></div>${button('按当前筛选抽 5 题 →','talk-draw','button')}</section>
      <section class="panel"><div class="filters" aria-label="面试题方向">${['all',...categories].map(c=>button(c==='all'?'全部方向':esc(c),'talk-category','chip '+(filter.category===c?'active':''),`data-category="${esc(c)}" aria-pressed="${filter.category===c}"`)).join('')}</div>
      <div class="interview-tools"><label class="field"><span>找一个知识点</span><input id="talkSearch" maxlength="160" placeholder="事务、索引、项目经历……" value="${esc(filter.search)}"></label><label class="field"><span>练习状态</span><select id="talkStatus">${options([['all','全部状态'],['new','还没自评'],['due','待加强'],['ready','能讲清楚 · 自评'],['favorite','已收藏']],filter.status)}</select></label><label class="field"><span>题目类型</span><select id="talkLevel">${options([['all','全部类型'],['基础','基础原理'],['进阶','进阶理解'],['实战','场景实战']],filter.level)}</select></label></div>
      <div class="mini-stats"><div><strong>${questions.length}</strong><span>面试题</span></div><div><strong>${done}</strong><span>已做自评</span></div><div><strong>${weak}</strong><span>待加强</span></div></div><div id="talkResults"></div></section>
      <p class="source-note">原创训练题，不宣称是某公司的真题。掌握状态由你自评，不代表招聘通过率。回答草稿仅保存在本机浏览器，可通过学习备份带走。旧版的 20 个项目追问及回答保留在「项目表达」。</p>`;
    results();
  }
  function results(){
    const list=filterQuestions(),pages=Math.max(1,Math.ceil(list.length/12));filter.page=Math.min(filter.page,pages);
    document.querySelector('#talkResults').innerHTML=`<p class="activity-caption" role="status">找到 ${list.length} 道题 · 第 ${filter.page} / ${pages} 页</p><div class="interview-list">${list.slice((filter.page-1)*12,filter.page*12).map(q=>{
      const d=getDraft(q.id),n=questions.indexOf(q)+1;return `<article class="interview-item"><span class="question-number">${String(n).padStart(2,'0')}</span><div><h3><a href="#interview/${q.id}">${esc(q.title)}</a></h3><p>${esc(q.category)} · ${esc(q.level)} · 建议口述 2 分钟 ${badge(labels[d.rating],d.rating==='ready'?'green':d.rating==='weak'?'orange':'')}${d.favorite?badge('已收藏'):''}</p></div>${link('开始练习 →','#interview/'+q.id,'button small')}</article>`;
    }).join('')||empty('没有符合条件的题目','换一个关键词或清空筛选。'+button('清空筛选','talk-reset','button mt'))}</div><div class="pagination"><span>每页 12 题 · 参考思路在练习页展开</span><div class="actions">${button('上一页','talk-page','button small',`data-delta="-1" ${filter.page===1?'disabled':''}`)}${button('下一页','talk-page','button small',`data-delta="1" ${filter.page===pages?'disabled':''}`)}</div></div>`;
  }
  function detail(q){
    const d=getDraft(q.id),lesson=C.lessons.find(l=>l.id===q.lesson),index=queue.indexOf(q.id);
    main.innerHTML=`<a class="back-link" href="#interview">← 返回面试题库</a><div class="two-col"><article class="stack"><section class="panel"><div class="question-meta">${badge(q.category,'blue')}${badge(q.level)}<span id="talkRating" class="pill ${d.rating==='ready'?'green':''}">${labels[d.rating]}</span></div><h1 class="question-title">${esc(q.title)}</h1><div class="speaking-guide"><span>① 先给结论</span><span>② 解释原理</span><span>③ 举项目例子</span><span>④ 说明边界</span></div>
      <label class="field"><span>我的回答与口述复盘</span><textarea class="interview-draft" id="talkAnswer" data-id="${q.id}" maxlength="12000" placeholder="先不看答案，用自己的话回答。\n\n我的结论：\n为什么：\n我在项目里如何验证：\n还不确定的地方：">${esc(d.answer)}</textarea><small>自动保存本机草稿；这里不录音、不调用 AI，也不自动判断回答正确性。</small></label>
      <details id="talkReference"><summary class="text-button">展开参考思路与追问</summary><div class="answer-outline"><h3>回答要点，不是逐字背诵的标准答案</h3><ul>${q.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>${q.source?`<a class="source-link" href="${esc(q.source[1])}" target="_blank" rel="noreferrer">拓展核对：${esc(q.source[0])} ↗</a>`:''}</div><div class="followup"><h3>面试官继续追问</h3><p>${esc(q.followup)}</p></div><div class="mt"><h3>容易说错的地方</h3><p class="muted mt">${esc(q.pitfall)}</p></div><div class="expected mt"><strong>把答案变成证据：</strong>${esc(q.task)}</div></details>
      <div class="self-check"><h3>回答后，诚实检查这三件事</h3>${['我能解释原理，而不是只记住结论','我能举出项目例子或给出可执行验证','我能说明适用条件，并回应追问'].map((t,i)=>`<label class="check"><input type="checkbox" data-talk-check="${i}" data-id="${q.id}" ${d.checks[i]?'checked':''}>${t}</label>`).join('')}<div class="rating-actions">${[['weak','还需补课'],['developing','能说一部分'],['ready','能讲清楚']].map(([r,t])=>button(t,'talk-rate','button small '+(d.rating===r?'selected':''),`data-id="${q.id}" data-rating="${r}" aria-pressed="${d.rating===r}"`)).join('')}</div><p class="activity-caption">“能讲清楚”需要三项自检和至少 24 字复盘，不代表客观评分。</p></div>
      <div class="actions mt">${button(d.favorite?'取消收藏':'收藏这道题','talk-favorite','button',`data-id="${q.id}"`)}${button('导出我的回答','talk-export','text-button',`data-id="${q.id}"`)}${index>=0&&index<queue.length-1?link('下一道抽题 →','#interview/'+queue[index+1],'button primary'):''}</div></section></article>
      <aside class="stack"><section class="panel"><h2>给自己 2 分钟</h2><p class="activity-caption">先口述一遍，再记下卡住的位置。</p><div class="timer-display mt" id="talkClock" role="timer" aria-label="口述倒计时">02:00</div><div class="actions mt">${button('开始计时','talk-timer','button small')}${button('重置','talk-timer-reset','text-button')}</div><p class="activity-caption" id="timerStatus" role="status">计时不影响草稿，也不会自动提交。</p></section>
      <section class="panel"><h2>把薄弱点补回来</h2><p class="activity-caption">相关入门课：${esc(lesson.title)}。进阶内容请结合参考文档继续验证。</p>${link('回到相关课程 →','#lesson/'+q.lesson,'button full mt')}${link('找一个项目练习','#projects','text-button mt')}</section>
      ${index>=0?`<section class="panel"><h2>本次抽题 ${index+1} / ${queue.length}</h2><div class="practice-queue">${queue.map((id,i)=>link(String(i+1),'#interview/'+id,id===q.id?'active':'')).join('')}</div><p class="activity-caption">顺序仅本次页面保留，回答草稿会保存。最后一题后回题库查看自评。</p>${link('回题库看待加强题','#interview','text-button mt')}</section>`:''}
      </aside></div>`;
  }
  function timerText(){const el=document.querySelector('#talkClock');if(el)el.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;}
  function jdMatches(text){const normalized=text.normalize('NFKC').toLowerCase();return window.JOB_SKILLS.filter(s=>s.terms.some(term=>{
    if(/^[a-z]+$/.test(term))return new RegExp('(^|[^a-z0-9])'+term+'(?=$|[^a-z0-9])','i').test(normalized);
    return normalized.includes(term);
  }));}
  function job(){
    const d=getState().jobDraft;
    main.innerHTML=heading('ROLE COMPASS','先看岗位，再决定补什么。','把你真正想投的岗位要求放进来，让学习有取舍。',link('去面试训练','#interview','button'))+
      `<div class="two-col"><div class="stack"><section class="panel"><h2>对照一份目标岗位</h2><p class="activity-caption">内容只在当前浏览器内处理，不上传招聘信息，不替你投递。</p><label class="field"><span>岗位名称（可选）</span><input id="jobTitle" maxlength="120" placeholder="例如：Java 后端开发 · 校招" value="${esc(d.title)}"></label><label class="field"><span>岗位要求原文</span><textarea class="job-text" id="jobText" maxlength="16000" placeholder="粘贴任职要求。请去掉联系人电话、邮箱及不必要的个人信息。">${esc(d.text)}</textarea></label>${button('对照已有课程与项目','job-analyze','button primary')}<p class="activity-caption" id="jobUpdateStatus" role="status"></p></section><section class="panel" id="jobResults"></section></div>
      <aside class="stack"><section class="panel"><h2>先确认这些信息</h2><ul class="side-list"><li><b>你是否符合投递范围？</b><span>毕业时间、校招批次、专业、地点和到岗时间。</span></li><li><b>哪些是必需，哪些是加分？</b><span>不要为了一个加分项，打断主线项目。</span></li><li><b>你拿什么证明会做？</b><span>仓库、可运行演示、测试与一次独立需求变更。</span></li></ul></section><section class="panel"><h2>人工补充与判断</h2><label class="field"><span>工具没覆盖的要求、优先级和下一步</span><textarea id="jobNotes" maxlength="6000" placeholder="例如：还要求 Linux 和消息队列，当前课程未完整覆盖。先把借用项目做完，再补部署。">${esc(d.notes)}</textarea></label><p class="activity-caption">这里是本机求职草稿，不是自动招聘评分。</p>${button('导出岗位对照草稿','job-export','button full mt')}</section></aside></div>`;
    jobResults();
  }
  function jobResults(){
    const d=getState().jobDraft,matched=jdMatches(d.text);
    const el=document.querySelector('#jobResults');if(!el)return;
    if(!d.text.trim()){el.innerHTML=empty('先选择一个真实目标','粘贴岗位要求后，会显示识别到的技术词及相关学习入口。不会生成虚假的匹配分数。');return;}
    el.innerHTML=`<div class="panel-heading"><div><h2>技术词对照</h2><p>${esc(d.title||'当前岗位草稿')}</p></div><span class="job-count">${matched.length}</span></div><div class="notice">基于 12 组技术词的规则匹配，不是 AI 理解。不会判断“必需 / 优先 / 不需要”，也不能证明你已满足岗位要求。Scrapy、Pandas 等只关联基础课，不代表站内已完整覆盖这些框架。</div>${matched.map(s=>{
      const l=C.lessons.find(l=>l.id===s.lesson),p=C.projects.find(p=>p.id===s.project),pr=getState().projects[p.id];
      return `<article class="skill-match"><div class="card-top"><h3>${esc(s.name)}</h3>${badge(independent(l.id)?'相关课已独立自检':'相关课待实践',independent(l.id)?'green':'orange')}</div><p>${esc(l.title)}<br>作品方向：${esc(p.title)} · ${pr?.evidence?.trim()?'已有项目记录，请核对证据':'尚缺项目证据'}</p><div class="actions">${link('补基础','#lesson/'+l.id,'button small')}${link('做项目','#project/'+p.id,'button small')}${link('练对应面试题','#interview/category/'+encodeURIComponent(s.category),'text-button')}</div></article>`;
    }).join('')||empty('还没有识别到站内覆盖的技术词','不要据此判断岗位不适合。查看原文，把未识别的要求记在人工补充中。')}`;
  }
  function exportQuestion(q){const d=getDraft(q.id);download('面试复盘-'+q.id+'.md',`# ${q.title}\n\n分类：${q.category} / ${q.level}\n自评：${labels[d.rating]}\n\n## 我的回答\n${d.answer||'尚未填写'}\n\n## 参考要点\n${q.points.map(p=>'- '+p).join('\n')}\n\n## 追问\n${q.followup}\n\n## 易错点\n${q.pitfall}\n\n## 动手验证\n${q.task}\n${q.source?'\n参考：'+q.source[1]:''}`);}
  const actions={
    'talk-category':b=>{filter.category=b.dataset.category;filter.page=1;render([]);},
    'talk-reset':()=>{filter={category:'all',status:'all',level:'all',search:'',page:1};render([]);},
    'talk-page':b=>{filter.page+=Number(b.dataset.delta);results();document.querySelector('#talkResults').scrollIntoView({block:'start'});},
    'talk-draw':()=>{let pool=filterQuestions();if(!pool.length){toast('当前筛选没有题目，请调整后再抽题。');return;}pool=[...pool];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}queue=pool.slice(0,5).map(q=>q.id);location.hash='#interview/'+queue[0];},
    'talk-favorite':b=>{const d=getDraft(b.dataset.id);updateDraft(b.dataset.id,{favorite:!d.favorite});b.textContent=d.favorite?'收藏这道题':'取消收藏';toast(d.favorite?'已取消收藏。':'已收藏，可在题库按“已收藏”筛选。');},
    'talk-rate':b=>{const id=b.dataset.id,d=getDraft(id),rating=b.dataset.rating;if(rating==='ready'&&(!d.checks.every(Boolean)||d.answer.trim().length<24)){toast('请完成三项自检，并写下至少 24 字的复盘，再标为能讲清楚。');return;}updateDraft(id,{rating,date:new Date().toISOString()});event('interview',id);save();const y=scrollY;stopTimer();detail(byId.get(id));scrollTo(0,y);toast('已保存你的自评，不代表客观评分。');},
    'talk-export':b=>exportQuestion(byId.get(b.dataset.id)),
    'talk-timer':b=>{
      if(timer){clearInterval(timer);timer=null;left=Math.max(0,Math.ceil((endAt-Date.now())/1000));b.textContent='继续计时';document.querySelector('#timerStatus').textContent='已暂停。';timerText();return;}
      if(left<=0)left=120;endAt=Date.now()+left*1000;b.textContent='暂停计时';document.querySelector('#timerStatus').textContent='正在计时，你可以随时暂停。';
      timer=setInterval(()=>{left=Math.max(0,Math.ceil((endAt-Date.now())/1000));timerText();if(!left){clearInterval(timer);timer=null;b.textContent='再练一遍';const status=document.querySelector('#timerStatus');if(status)status.textContent='2 分钟到了。记下卡住的地方，再展开思路。';}},250);
    },
    'talk-timer-reset':()=>{stopTimer();timerText();const b=document.querySelector('[data-action="talk-timer"]');if(b)b.textContent='开始计时';document.querySelector('#timerStatus').textContent='计时已重置，草稿未改变。';},
    'job-analyze':()=>{if(getState().jobDraft.text.trim().length<10){toast('请先填写至少 10 字的岗位要求。');return;}jobResults();document.querySelector('#jobUpdateStatus').textContent='已按当前原文更新关键词对照，请人工核对。';},
    'job-export':()=>{const d=getState().jobDraft;download('岗位对照草稿.md',`# ${d.title||'目标岗位'}\n\n## 原文\n${d.text||'未填写'}\n\n## 识别到的技术词\n${jdMatches(d.text).map(s=>'- '+s.name+'；相关课程：'+C.lessons.find(l=>l.id===s.lesson).title).join('\n')||'无匹配'}\n\n## 人工判断与下一步\n${d.notes||'未填写'}\n\n仅为关键词对照，不判断必需/优先/否定，也不代表满足招聘要求。`);}
  };
  function input(el){
    if(el.id==='talkSearch'){filter.search=el.value;filter.page=1;results();}
    else if(el.id==='talkAnswer'){const d=getDraft(el.dataset.id);updateDraft(el.dataset.id,{answer:el.value,rating:d.rating==='ready'?'developing':d.rating});}
    else if(['jobTitle','jobText','jobNotes'].includes(el.id)){const key={jobTitle:'title',jobText:'text',jobNotes:'notes'}[el.id];getState().jobDraft[key]=el.value;save();if(key!=='notes'){document.querySelector('#jobUpdateStatus').textContent='草稿已更新，点击对照按钮刷新结果。';document.querySelector('#jobResults').innerHTML='<p class="muted">原文已修改，等待重新对照。</p>';}}
  }
  function change(el){
    if(el.id==='talkStatus'||el.id==='talkLevel'){filter[el.id==='talkStatus'?'status':'level']=el.value;filter.page=1;results();}
    else if(el.matches('[data-talk-check]')){const d=getDraft(el.dataset.id),checks=[...d.checks];checks[Number(el.dataset.talkCheck)]=el.checked;updateDraft(el.dataset.id,{checks,rating:d.rating==='ready'&&!checks.every(Boolean)?'developing':d.rating});}
  }
  return {render,job,actions,input,change,stopTimer};
};
