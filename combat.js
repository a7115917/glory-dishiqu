/* ==========================================================================
   荣耀 · 第十区  —   实时战斗内核
   --------------------------------------------------------------------------
   1 tick = 200ms，双方同时跑自己的时间轴：
     cast  前摇  —— 这段时间被打中会被「打断」，技能直接没了
     rec   后摇  —— 收招硬直，此时是「破绽」，受到伤害 +45%
     stun  硬直  —— 被打断之后动不了
   · 连招接上了：后摇只有 55%，伤害逐层+18%
   · 没接上就放：后摇 160%，全程挂「破绽」——这就是不看连招的代价
   · 后摇期间可以预输入下一招，收招瞬间自动接上
   ========================================================================== */

const Combat = (function () {

const TICK = 200;              // 每拍毫秒
const OPENING_DMG = 1.45;      // 破绽增伤
const LINK_REC = 0.55;         // 接上连招的后摇系数
const MISS_REC = 1.6;          // 没接上的后摇系数

let api = null;                // GameAPI
let P = null, E = null;        // 双方运行时
let timer = null;
let running = false;
let onEndCb = null;
let startTime = 0;
let lastSecs = 0;
let lastResult = null;

/* ---------------------------------------------------------------- 启动 */
function configure(a) { api = a; }

function start(enemyId, opts) {
  const tpl = ENEMIES[enemyId];
  if (!tpl) { console.warn('没有这个敌人', enemyId); return; }

  const S = api.S;
  const d = api.derived(S);
  S.hp = Math.min(S.hp, d.maxHp);

  P = {
    state: 'idle', t: 0, cd: {}, buffs: {},
    combo: 0, lastIdx: -1, lastSchool: null, lastForm: null, queue: null,
    form: S.form || 'sword', castForm: null, castInfo: null,
    pending: null, mul: 1, recMod: 1, penalty: false,
    spdMod: 1 - Math.min(0.22, S.agi * 0.005)
  };
  S.skills.forEach(id => { P.cd[id] = 0; });

  const e = JSON.parse(JSON.stringify(tpl));
  E = {
    id: enemyId, name: e.name, level: e.level, boss: !!e.boss,
    hp: e.hp, maxHp: e.hp, atk: e.atk, def: e.def, spd: e.spd,
    exp: e.exp || 0, gold: e.gold || 0, loot: e.loot || [],
    skills: e.skills || [], cd: {}, buffs: {},
    state: 'idle', t: 0, atkUp: 0, defDown: 0
  };
  (e.skills || []).forEach((s, i) => { E.cd[i] = 0; });

  lastResult = null;
  running = true;
  startTime = Date.now();

  buildBattleUI();
  api.openOverlay();
  log('遭遇 ' + E.name + '（Lv.' + E.level + '）', 'mute');
  render();
  clearInterval(timer);
  timer = setInterval(tick, TICK);
  tick();                     // 立刻走一拍，避免开战静止
}

/* ---------------------------------------------------------------- 主循环 */
function tick() {
  if (!running) return;
  const S = api.S;

  stepPlayer(S);
  stepEnemy(S);
  regen(S);
  render();
  checkEnd(S);
}

function stepPlayer(S) {
  if (P.state === 'idle') return;
  P.t--;
  if (P.t > 0) return;

  if (P.state === 'cast') {
    resolvePlayerCast(S);
  } else {
    // rec / stun 结束
    P.state = 'idle';
    P.penalty = false;
    if (P.queue) {
      const q = P.queue;
      P.queue = null;
      tryCast(S, q);
    }
  }
}

function stepEnemy(S) {
  if (E.state === 'idle') { enemyDecide(S); return; }
  E.t--;
  if (E.t > 0) return;

  if (E.state === 'cast') {
    resolveEnemyCast(S);
  } else {
    E.state = 'idle';
  }
}

function regen(S) {
  const d = api.derived(S);
  S.mp = Math.min(d.maxMp, S.mp + (1.4 + S.int * 0.1) * (TICK / 1000));
  // 冷却
  for (const k in P.cd) if (P.cd[k] > 0) P.cd[k]--;
  for (const k in E.cd) if (E.cd[k] > 0) E.cd[k]--;
  for (const k in P.buffs) if (--P.buffs[k] <= 0) delete P.buffs[k];
  if (E.atkUp > 0) E.atkUp--;
  if (E.defDown > 0) E.defDown--;
}

/* ---------------------------------------------------------------- 玩家 */
function tryCast(S, id) {
  const sk = SKILLS[id];
  if (!sk) return false;
  if (P.state !== 'idle') { P.queue = id; return false; }
  if (S.mp < sk.mp) { api.toast('法力不足'); return false; }
  if ((P.cd[id] || 0) > 0) { api.toast('冷却中'); return false; }

  S.mp -= sk.mp;
  P.cd[id] = sk.cd;

  // —— 连招判定 ——
  const cls = api.classOf(S.cls);
  const info = chainInfo(cls, id);

  let mul = 1;
  let recMod = MISS_REC;
  let penalty = false;

  if (info.util) {
    recMod = 1;
  } else if (cls.freeChain) {
    if (!P.lastSchool) { recMod = 1; mul = 1; }
    else if (info.link) { recMod = LINK_REC; mul = 1 + 0.15 * (P.combo + 1); }
    else { recMod = MISS_REC; penalty = true; }
  } else {
    if (info.idx === 0) { recMod = 1; mul = 1; }
    else if (info.link) {
      recMod = LINK_REC;
      mul = 1 + 0.18 * (P.combo + 1);
      if (P.combo + 1 >= cls.chain.length - 1) mul *= 1.3;   // 这一招就是终结
    }
    else { recMod = MISS_REC; penalty = true; }
  }

  P.pending = id;
  P.castForm = P.form;
  P.castInfo = info;
  P.mul = mul;
  P.recMod = recMod * P.spdMod;
  P.penalty = penalty;
  P.state = 'cast';
  P.t = Math.max(1, Math.round(sk.cast * P.spdMod));
  P.queue = null;

  if (penalty) log('【' + sk.name + '】硬起手——没有接上连招。', 'warn');
  else if (info.link) log('连招 · ' + sk.name, 'combo');
  else log('【' + sk.name + '】', 'good');

  return true;
}

function chainInfo(cls, id) {
  const sk = SKILLS[id];
  if (sk.util) return { util: true, link: false, idx: -1 };
  if (cls.freeChain) {
    return { util: false, link: !!P.lastForm && P.form !== P.lastForm, idx: -1 };
  }
  const idx = cls.chain.indexOf(id);
  if (idx < 0) return { util: true, link: false, idx: -1 };
  return { util: false, link: P.lastIdx === idx - 1, idx: idx };
}

function resolvePlayerCast(S) {
  if (P.pending === '__basic') {
    strikeEnemy({ name: '普通攻击', power: 100 }, S);
    P.pending = null;
    P.state = 'rec';
    P.t = Math.max(1, Math.round(3 * P.recMod));
    return;
  }
  const sk = SKILLS[P.pending];
  const cls = api.classOf(S.cls);
  const info = P.castInfo || { util: true, idx: -1 };

  if (sk.buff) {
    P.buffs[sk.buff.dodge ? 'dodge' : sk.buff.guard ? 'guard' : 'power'] =
      (sk.buff.dodge || sk.buff.guard || sk.buff.power) + 60;   // 60 tick = 12s
    log('增益生效。', 'good');
  }  if (sk.stun) { E.state = 'stun'; E.t = sk.stun; log(E.name + ' 被控住！', 'combo'); }
  if (sk.power) strikeEnemy(sk, S);
  if (sk.heal) {
    const d = api.derived(S);
    const h = Math.round(d.maxHp * sk.heal);
    S.hp = Math.min(d.maxHp, S.hp + h);
    log('回复 ' + h + ' 点生命。', 'heal');
  }
  if (sk.selfDmg) {
    const d = api.derived(S);
    const h = Math.round(d.maxHp * sk.selfDmg);
    S.hp = Math.max(1, S.hp - h);
    log('反噬，损失 ' + h + ' 点生命。', 'hurt');
  }

  // 提交连招状态
  if (!info.util) {
    if (cls.freeChain) {
      const f = P.castForm || P.form;
      if (!P.lastForm) P.combo = 0;
      else if (f !== P.lastForm) P.combo = Math.min(5, P.combo + 1);
      else P.combo = 0;
      P.lastForm = f;
    } else {
      if (info.link || info.idx === 0) P.combo = info.idx === 0 ? 0 : Math.min(cls.chain.length - 1, P.combo + 1);
      else P.combo = 0;
      P.lastIdx = info.idx;
    }
  }

  // 终结判定
  const finished = !cls.freeChain && cls.chain.length > 1 && P.combo >= cls.chain.length - 1 && !info.util;
  if (finished && sk.power) {
    log('连招完成！' + cls.chain.map(x => SKILLS[x].name).join(' → '), 'combo');
    const back = Math.round(sk.mp * 0.5);
    const d = api.derived(S);
    S.mp = Math.min(d.maxMp, S.mp + back);
    E.defDown = 3;
    log('返灵 ' + back + ' 点法力，' + E.name + ' 破防。', 'combo');
    P.combo = 0;
    P.lastIdx = -1;
  }

  P.state = 'rec';
  P.t = Math.max(1, Math.round(sk.rec * P.recMod));
}

function strikeEnemy(sk, S) {
  const d = api.derived(S);
  const scale = sk.scale || api.classOf(S.cls).main;
  const atk = d.atk[scale];
  const hits = sk.hits || 1;

  // 敌方闪避
  if (Math.random() * 100 < Math.max(0, E.spd * 0.4 - 1)) {
    log(E.name + ' 侧身闪开。', 'mute');
    return;
  }

  let mult = P.mul;
  let tag = '';
  if (E.state === 'cast') { mult *= 1.25; tag = ' · 打断！'; E.state = 'stun'; E.t = 3; log('你打断了 ' + E.name + ' 的施法！', 'combo'); }
  else if (E.state === 'rec') { mult *= OPENING_DMG; tag = ' · 破绽'; }

  let total = 0, crit = false;
  for (let i = 0; i < hits; i++) {
    let dmg = atk * (sk.power / 100) * (0.92 + Math.random() * 0.16) * mult;
    const def = E.def * (1 - (sk.pierce || 0)) * (1 - (E.defDown > 0 ? 0.25 : 0));
    dmg *= 100 / (100 + def * 1.6);
    if (Math.random() * 100 < d.crit + (sk.crit || 0)) { dmg *= 1.8; crit = true; }
    total += Math.max(1, Math.round(dmg));
  }
  E.hp = Math.max(0, E.hp - total);
  log(sk.name + ' 命中，' + total + ' 伤害' + (crit ? '（暴击）' : '') + tag, crit ? 'crit' : 'dmg');
}

/* ---------------------------------------------------------------- 敌人 */
function enemyDecide(S) {
  if (E.state !== 'idle') return;
  const d = api.derived(S);

  // 可用技能
  const pool = E.skills.filter((s, i) => (E.cd[i] || 0) <= 0);
  if (!pool.length) {
    // 普攻兜底
    E.state = 'cast'; E.t = 2; E.pending = { name: '普通攻击', power: 100, cast: 2, rec: 3, cd: 0 };
    E.castLen = 2;
    return;
  }

  // 玩家正在前摇 → 优先用快招打断
  let pick = null;
  if (P.state === 'cast') {
    pick = pool.find(s => (s.cast || 3) <= P.t + 1);
  }
  if (!pick) {
    // 玩家在后摇 → 打重招
    if (P.state === 'rec') {
      const heavy = pool.filter(s => (s.power || 0) >= 140);
      if (heavy.length && Math.random() < 0.7) pick = heavy[Math.floor(Math.random() * heavy.length)];
    }
  }
  if (!pick) pick = pool[Math.floor(Math.random() * pool.length)];

  const idx = E.skills.indexOf(pick);
  if (idx >= 0) E.cd[idx] = pick.cd || 20;
  E.pending = pick;
  E.state = 'cast';
  E.castLen = Math.max(1, Math.round((pick.cast || 3) * (1 - Math.min(0.2, E.spd * 0.006))));
  E.t = E.castLen;
}

function resolveEnemyCast(S) {
  const sk = E.pending;
  const d = api.derived(S);

  if (sk.buff) {
    E.atkUp = 60; log(E.name + ' 气势暴涨。', 'hurt');
    E.state = 'rec'; E.t = 3;
    return;
  }

  // 玩家闪避
  let dodge = d.dodge + (P.buffs.dodge ? 30 : 0);
  if (Math.random() * 100 < dodge) {
    log('你闪开了 ' + E.name + ' 的【' + sk.name + '】。', 'mute');
    E.state = 'rec'; E.t = 3;
    return;
  }

  let mult = 1 + (E.atkUp > 0 ? 0.3 : 0);
  if (P.state === 'rec') { mult *= OPENING_DMG; log('你露出了破绽！', 'warn'); }
  if (P.buffs.guard) mult *= 0.55;

  const hits = sk.hits || 1;
  let total = 0;
  for (let i = 0; i < hits; i++) {
    let dmg = E.atk * ((sk.power || 100) / 100) * (0.9 + Math.random() * 0.2) * mult;
    dmg *= 100 / (100 + d.def * 1.6);
    total += Math.max(1, Math.round(dmg));
  }

  S.hp = Math.max(0, S.hp - total);
  log(E.name + ' 的【' + sk.name + '】命中，你受到 ' + total + ' 点伤害。', 'hurt');

  // 打断玩家前摇
  if (P.state === 'cast') {
    P.state = 'stun'; P.t = 3; P.pending = null; P.combo = 0;
    log('你的施法被打断了！', 'warn');
  }

  E.state = 'rec';
  E.t = Math.max(1, Math.round((sk.rec || 4) * (1 - Math.min(0.2, E.spd * 0.006))));
}

/* ---------------------------------------------------------------- 结算 */
function checkEnd(S) {
  if (S.hp <= 0) { end('lose'); return; }
  if (E.hp <= 0) { end('win'); return; }
}

function end(result) {
  if (!running) return;
  running = false;
  clearInterval(timer);
  timer = null;
  render();
  lastResult = result;

  const S = api.S;
  const secs = ((Date.now() - startTime) / 1000).toFixed(1);
  lastSecs = (Date.now() - startTime) / 1000;

  let html = '';
  if (result === 'win') {
    S.kills = (S.kills || 0) + 1;
    S.gold += E.gold;
    log('击败 ' + E.name + '。', 'good');
    log('获得经验 ' + E.exp + '，银币 ' + E.gold + '。', 'sys');
    (E.loot || []).forEach(l => {
      if (Math.random() < (l.p == null ? 1 : l.p)) {
        api.addItem(l.id, l.n || 1);
        log('获得 ' + ITEMS[l.id].name + ' ×' + (l.n || 1), 'sys');
      }
    });
    api.addExp(E.exp);
    api.saveGame();
    api.updateUI();
    html = '<button class="act-btn" data-act="continue" style="grid-column:1/-1">' +
           '<span class="an">继 续</span><span class="ac">用时 ' + secs + ' 秒 · 离开战斗</span></button>';
  } else if (result === 'lose') {
    S.hp = 1;
    api.saveGame(); api.updateUI();
    log('你倒下了。', 'hurt');
    html = '<button class="act-btn" data-act="continue" style="grid-column:1/-1">' +
           '<span class="an">复 活</span></button>';
  } else {
    api.saveGame();
    html = '<button class="act-btn" data-act="continue" style="grid-column:1/-1">' +
           '<span class="an">撤 退</span></button>';
  }

  const acts = api.el('battle-actions');
  if (acts) acts.innerHTML = html;
  const strip = api.el('combo-strip');
  if (strip) strip.className = 'combo-strip';

  lastSecs = lastSecs || 0;
  lastResult = { result: result, seconds: lastSecs };

  const btn = acts && acts.querySelector('[data-act="continue"]');
  if (btn) {
    btn.addEventListener('click', () => {
      if (!onEndCb) return;
      const cb = onEndCb;
      onEndCb = null;
      cb(result);
    });
  }
}

/* ---------------------------------------------------------------- 撤退 */
function flee() {
  if (!running || P.state !== 'idle') return;
  const S = api.S;
  const d = api.derived(S);
  const ok = Math.random() * 100 < 35 + S.agi * 2;
  if (ok) { log('你退开了，脱离战斗。', 'good'); end('flee'); }
  else {
    log('没能脱身！', 'warn');
    P.state = 'rec'; P.t = 6; P.penalty = true;
  }
}

/* ---------------------------------------------------------------- 渲染 */
function el(id) { return document.getElementById ? document.getElementById(id) : api.el(id); }

function buildBattleUI() {
  const S = api.S;
  api.paintPortrait('self-avatar', S.cls, 'face');
  renderActions();
}

/* 技能按钮 + 千机伞形态条 */
function renderActions() {
  const S = api.S;
  const box = api.el('battle-actions');
  if (!box) return;
  P.form = P.form || S.form || 'sword';

  let h = '';
  if (S.cls === 'sanren') {
    h += '<div class="form-row">';
    UMBRELLA_FORMS.forEach(f => {
      h += '<button class="form-chip' + (f.id === P.form ? ' on' : '') + '"' +
           ' data-form="' + f.id + '">' + f.name + '</button>';
    });
    h += '</div>';
  }

  h += '<button class="act-btn" data-act="attack" data-id="__basic">' +
       '<span class="an">普通攻击</span><span class="ac">无消耗 · 会断连</span></button>';

  api.skillBarOf(S, P.form).forEach(id => {
    const sk = SKILLS[id];
    if (!sk) return;
    h += '<button class="act-btn skill" data-act="skill" data-id="' + id + '">' +
         '<i class="cdmask"></i><span class="an">' + sk.name + '</span>' +
         '<span class="ac">MP ' + sk.mp + '</span></button>';
  });

  h += '<button class="act-btn" data-act="flee"><span class="an">撤退</span>' +
       '<span class="ac">敏捷判定</span></button>';

  box.innerHTML = h;

  Array.prototype.forEach.call(box.querySelectorAll('.form-chip'), c => {
    c.addEventListener('click', () => {
      if (!running) return;
      P.form = c.dataset.form;
      api.S.form = P.form;
      renderActions();
      render();
    });
  });

  P.btns = Array.prototype.map.call(box.querySelectorAll('.act-btn'), b => ({
    el: b, act: b.dataset.act, id: b.dataset.id,
    mask: b.querySelector('.cdmask'), sub: b.querySelector('.ac')
  }));
  P.btns.forEach(b => {
    b.el.addEventListener('click', () => {
      if (!running) return;
      if (b.act === 'flee') { flee(); return; }
      if (b.act === 'attack') { tryBasic(); return; }
      tryCast(api.S, b.id);
    });
  });
}
function tryBasic() {
  if (P.state === 'rec') { P.queue = '__basic'; return; }
  if (P.state !== 'idle') return;
  P.queue = null;
  P.combo = 0; P.lastIdx = -1; P.lastSchool = null; P.lastForm = null;
  P.pending = '__basic';
  P.mul = 1; P.recMod = 1 * P.spdMod; P.penalty = false;
  P.state = 'cast'; P.t = 2;
  log('普通攻击。', 'mute');
}

function render() {
  const S = api.S;
  const d = api.derived(S);
  const $ = api.el;

  // 敌人
  const fn = $('foe-name'), fl = $('foe-lv'), fh = $('foe-hp'), ft = $('foe-hptext');
  if (fn) fn.textContent = E.name;
  if (fl) fl.textContent = 'Lv.' + E.level + (E.boss ? ' · BOSS' : '') +
    (E.defDown > 0 ? ' · 破防' : '') + (E.atkUp > 0 ? ' · 强化' : '');
  if (fh) fh.style.width = Math.max(0, E.hp / E.maxHp * 100) + '%';
  if (ft) ft.textContent = Math.max(0, E.hp) + ' / ' + E.maxHp;

  // 敌人施法条
  const fc = $('foe-cast');
  if (fc) {
    if (E.state === 'cast' && E.pending) {
      const p = 1 - (E.t / (E.castLen || 3));
      fc.style.opacity = 1;
      fc.className = 'cast-bar on';
      fc.querySelector('i').style.width = (p * 100) + '%';
      fc.querySelector('span').textContent = E.pending.name;
    } else if (E.state === 'stun') {
      fc.style.opacity = 1; fc.className = 'cast-bar stun';
      fc.querySelector('i').style.width = '100%';
      fc.querySelector('span').textContent = '硬直';
    } else {
      fc.style.opacity = 0;
    }
  }

  // 玩家
  const sb = $('self-bars');
  if (sb) {
    sb.innerHTML =
      '<div class="bar hp"><i style="width:' + Math.max(0, S.hp / d.maxHp * 100) + '%"></i>' +
      '<b>' + Math.round(S.hp) + ' / ' + d.maxHp + '</b></div>' +
      '<div class="bar mp"><i style="width:' + Math.max(0, S.mp / d.maxMp * 100) + '%"></i>' +
      '<b>' + Math.round(S.mp) + ' / ' + d.maxMp + '</b></div>';
  }

  const sc = $('self-cast');
  if (sc) {
    if (P.state === 'cast') {
      const ps = P.pending === '__basic' ? 2 : (SKILLS[P.pending] ? SKILLS[P.pending].cast : 2);
      sc.className = 'cast-bar on mine';
      sc.querySelector('i').style.width = ((1 - P.t / Math.max(1, ps)) * 100) + '%';
      sc.querySelector('span').textContent = '前摇 · ' +
        (P.pending === '__basic' ? '普通攻击' : (SKILLS[P.pending] ? SKILLS[P.pending].name : ''));
    } else if (P.state === 'rec') {
      sc.className = 'cast-bar ' + (P.penalty ? 'warn' : 'rec');
      sc.querySelector('i').style.width = '100%';
      sc.querySelector('span').textContent = P.penalty ? '后摇 · 破绽！' : '后摇';
    } else if (P.state === 'stun') {
      sc.className = 'cast-bar stun';
      sc.querySelector('span').textContent = '硬直';
    } else {
      sc.className = 'cast-bar idle';
      sc.querySelector('span').textContent = P.queue ? '已预输入' : '可行动';
    }
  }

  // 连招条
  renderCombo();

  // 按钮
  const cls = api.classOf(S.cls);
  (P.btns || []).forEach(b => {
    if (b.act === 'flee') { b.el.disabled = P.state !== 'idle'; return; }
    if (b.act === 'attack') { b.el.disabled = P.state === 'stun'; return; }
    const sk = SKILLS[b.id];
    const cd = P.cd[b.id] || 0;
    const noMp = S.mp < sk.mp;
    const next = isNextSkill(cls, b.id);
    b.el.disabled = cd > 0 || noMp || P.state === 'stun';
    b.el.classList.toggle('next', next);
    if (b.mask) b.mask.style.width = cd > 0 ? Math.min(100, cd / sk.cd * 100) + '%' : '0%';
    if (b.sub) {
      b.sub.textContent = cd > 0 ? 'CD ' + (cd / 5).toFixed(1) + 's'
        : noMp ? '法力不足'
        : (sk.cast + ' 拍 / ' + sk.rec + ' 拍');
    }
  });
}

function isNextSkill(cls, id) {
  const sk = SKILLS[id];
  if (sk.util) return false;
  if (cls.freeChain) {
    return !!P.lastForm && P.form !== P.lastForm;
  }
  const idx = cls.chain.indexOf(id);
  if (idx < 0) return false;
  return idx === P.lastIdx + 1;
}

function renderCombo() {
  const box = api.el('combo-strip');
  if (!box) return;
  const cls = api.classOf(api.S.cls);
  let h = '<span class="cb-tag">连招</span>';

  if (cls.freeChain) {
    const last = P.lastForm ? (FORM_NAME[P.lastForm] + '形态') : '任意起手';
    const canLink = !P.lastForm || P.form !== P.lastForm;
    h += '<span class="cb-step ' + (P.lastForm ? 'on' : 'next') + '">' + last + '</span>';
    h += '<span class="cb-arrow">→</span>';
    h += '<span class="cb-step ' + (canLink ? 'next' : '') + '">' +
         (canLink ? '可接' : '换形态可接') + '</span>';
    if (P.combo > 0) h += '<span class="cb-count">×' + (P.combo + 1) + '</span>';
  } else {
    const chain = cls.chain;
    chain.forEach((sid, i) => {
      let c = '';
      if (i <= P.lastIdx) c = 'on';
      else if (i === P.lastIdx + 1) c = 'next';
      h += '<span class="cb-step ' + c + '">' + SKILLS[sid].name + '</span>';
      if (i < chain.length - 1) h += '<span class="cb-arrow">›</span>';
    });
    if (P.combo > 0) h += '<span class="cb-count">×' + (P.combo + 1) + '</span>';
    if (P.penalty) h += '<span class="cb-penalty">断连 · 破绽</span>';
  }

  box.className = 'combo-strip' + (P.combo > 0 ? ' live' : '');
  box.innerHTML = h;
}

/* ---------------------------------------------------------------- 日志 */
function log(msg, kind) {
  const box = api.el('battle-log');
  if (!box) return;
  const d = document.createElement('div');
  d.className = 'log-line ' + (kind || '');
  d.textContent = msg;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  while (box.children.length > 60) box.removeChild(box.firstChild);
}

/* ---------------------------------------------------------------- 对外 */
return {
  configure: configure,
  start: function (enemyId, opts) {
    onEndCb = opts && opts.onEnd;
    start(enemyId, opts);
  },
  flee: flee,
  lastSeconds: () => lastSecs,
  isRunning: () => running
};

})();
