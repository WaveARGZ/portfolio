(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- scroll reveal ----
  var items = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el,i){ el.style.transitionDelay = Math.min(i,6)*55 + 'ms'; io.observe(el); });
  } else {
    items.forEach(function(el){ el.classList.add('in'); });
  }

  // ---- HUD bars build ----
  var barsWrap = document.getElementById('bars');
  var BARS = 16;
  for(var i=0;i<BARS;i++){
    var b = document.createElement('div');
    b.className='bar'; b.style.height='20%';
    barsWrap.appendChild(b);
  }
  var bars = barsWrap.querySelectorAll('.bar');

  function levelColor(p){
    // green-ish (calm) -> accent red (busy), kept subtle
    if(p < 40) return '#9DB7A6';
    if(p < 70) return '#E6B14E';
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  }
  function stateLabel(p){
    if(p < 40) return 'ゆったり';
    if(p < 70) return 'やや混雑';
    return '混雑';
  }

  var numEl = document.getElementById('hudNum');
  var stEl = document.getElementById('hudState');
  var waitEl = document.getElementById('hudWait');
  var pplEl = document.getElementById('hudPpl');

  function render(p){
    var col = levelColor(p);
    numEl.textContent = Math.round(p);
    stEl.textContent = stateLabel(p);
    stEl.style.color = col;
    stEl.style.background = 'rgba(224,69,47,' + (p>=70?0.10:0.06) + ')';
    waitEl.textContent = Math.max(1,Math.round(p/14)) + ' min';
    pplEl.textContent = Math.round(60 + p*1.2);
    for(var i=0;i<bars.length;i++){
      var filled = (i/bars.length)*100 < p;
      var h = filled ? (32 + Math.random()*68) : (12 + Math.random()*14);
      bars[i].style.height = h.toFixed(0)+'%';
      bars[i].style.background = filled ? col : getComputedStyle(document.documentElement).getPropertyValue('--grid').trim();
    }
  }

  if(reduce){
    render(62);
  } else {
    var p = 62;
    render(p);
    setInterval(function(){
      // gentle random walk between ~38 and ~88
      p += (Math.random()-0.5)*16;
      if(p<38)p=38; if(p>88)p=88;
      render(p);
    }, 2600);
  }
})();


(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var modal   = document.getElementById('modal');
  var mPrev   = document.getElementById('mPrev');
  var mTag    = document.getElementById('mTag');
  var mTitle  = document.getElementById('mTitle');
  var mSub    = document.getElementById('mSub');
  var mDesc   = document.getElementById('mDesc');
  var mTech   = document.getElementById('mTech');
  var mLinks  = document.getElementById('mLinks');
  var mClose  = document.getElementById('mClose');
  var lastTrigger = null;
  var hideTimer = null;

  var works = {
    vr: {
      tag:'VR · 3D',
      title:'没入型 VR 学習環境',
      sub:'Unreal Engine 5 × Meta Quest 3',
      desc:'Unreal Engine 5 と Meta Quest 3 を使って、仮想空間そのものを「学ぶ場所」にできないか試作したプロジェクト。3D空間内での提示やインタラクションが、理解や没入にどう効くかを探っています。研究で扱う空間・視認性の知見は、いずれ自分のゲーム制作にも持ち込むつもりです。',
      tech:['Unreal Engine 5','Meta Quest 3','3D / VR','インタラクション設計'],
      links:[{l:'デモ動画',p:'準備中',href:'#'},{l:'リポジトリ',p:'@username',href:'#'}]
    },
    agents: {
      tag:'ML · Multi-agent',
      title:'マルチエージェント分析システム',
      sub:'Multi-agent × Data Analysis',
      desc:'複数のエージェントがそれぞれの観点でレースを分析し、結果を統合して Note / X で発信する実験プロジェクト。趣味のデータ分析を、機械学習とマルチエージェント設計を試す題材にしています。複数の視点をどう組み合わせると予測が安定するか、を試行錯誤中です。',
      tech:['Python','マルチエージェント','データ分析','予測'],
      links:[{l:'Note 記事',p:'@handle',href:'#'},{l:'X',p:'@handle',href:'#'},{l:'リポジトリ',p:'@username',href:'#'}]
    },
    pi: {
      tag:'Hardware · IoT',
      title:'Raspberry Pi まわりの工作',
      sub:'Hardware · IoT · Edge',
      desc:'センサーやカメラを Raspberry Pi につなぎ、身の回りの「あったらいいな」を形にするのが好きです。学会で発表した見守りカメラ（Pi 5 + USBカメラ + Discord 通知）もこの延長線上。安価なハードと身近な API だけで、どこまで実用的なものを作れるかを試しています。',
      tech:['Raspberry Pi 5','Python','センサー / カメラ','Discord API'],
      links:[{l:'見守りカメラの詳細',p:'Research へ',href:'#research'},{l:'リポジトリ',p:'@username',href:'#'}]
    },
    story: {
      tag:'Writing',
      title:'物語を書く',
      sub:'Creative Writing',
      desc:'技術とはまったく別の引き出しとして、キャラクターと物語を作ることもずっと続けています。長編のラブコメをこつこつ執筆中。設定を詰め、人物を動かし、伏線を回収していく作業は、システムを設計する感覚と意外と地続きだったりします。',
      tech:['小説 / 創作','長編連載'],
      links:[{l:'読む',p:'連載先',href:'#'}]
    }
  };

  function fillTech(arr){
    mTech.innerHTML='';
    arr.forEach(function(t){ var s=document.createElement('span'); s.className='pill'; s.textContent=t; mTech.appendChild(s); });
  }
  function fillLinks(arr){
    mLinks.innerHTML='';
    arr.forEach(function(o){
      var a=document.createElement('a');
      a.className='mlink'; a.href=o.href||'#';
      a.innerHTML = o.l + ' <span class="ph">— '+o.p+'</span>';
      a.addEventListener('click', function(ev){
        if((o.href||'#')==='#'){ ev.preventDefault(); return; }
        closeModal();
      });
      mLinks.appendChild(a);
    });
  }

  function openModal(id, trigger){
    var w = works[id]; if(!w) return;
    if(hideTimer){ clearTimeout(hideTimer); hideTimer=null; }
    lastTrigger = trigger || null;
    mPrev.innerHTML='';
    var svg = trigger ? trigger.querySelector('.wprev svg') : null;
    if(svg){ mPrev.appendChild(svg.cloneNode(true)); }
    mTag.textContent = '[ '+w.tag+' ]';
    mTitle.textContent = w.title;
    mSub.textContent = w.sub;
    mDesc.textContent = w.desc;
    fillTech(w.tech);
    fillLinks(w.links);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.scrollTop = 0;
    requestAnimationFrame(function(){ modal.classList.add('open'); });
    mClose.focus({preventScroll:true});
    document.addEventListener('keydown', onKey);
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onKey);
    if(reduce){
      modal.hidden = true;
    } else {
      hideTimer = setTimeout(function(){ modal.hidden = true; }, 320);
    }
    if(lastTrigger){ lastTrigger.focus({preventScroll:true}); }
  }
  function onKey(e){
    if(e.key==='Escape'){ closeModal(); return; }
    if(e.key==='Tab'){
      var f = modal.querySelectorAll('button, a[href]');
      if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  }

  document.querySelectorAll('.wcard').forEach(function(card){
    card.addEventListener('click', function(){ openModal(card.getAttribute('data-work'), card); });
  });
  mClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target===modal){ closeModal(); } });
})();
