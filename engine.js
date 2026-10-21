/* ==========================================================================
   荣耀 · 第十区  —   引擎
   场景 / 面板 / 存档 / 副本榜单 / 知名度
   ========================================================================== */
'use strict';

(function () {

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SAVE_KEY = 'glory10.save.v2';

let S = null;
let curTab = 'attr';
let selClass = 'jianke';
let selSchool = '剑士系';
let curChoices = [];

const classOf = id => CLASSES[id];

/* ---------------------------------------------------------- 派生数值 */
function derived(st) {
  const bonus = { atk: 0, def: 0, hp: 0, mp: 0, spd: 0, crit: 0 };
  ['weapon', 'armor'].forEach(slot => {
    const id = st.equip && st.equip[slot];
    const it = id ? ITEMS[id] : null;
    if (it && it.bonus) for (const k in it.bonus) bonus[k] += it.bonus[k];
  });
  const lv = st.level;
  const atkOf = m => Math.round(10 + st[m] * 2.2 + lv * 2 + bonus.atk);
  return {
    maxHp: Math.round(110 + st.con * 13 + lv * 14 + bonus.hp),
    maxMp: Math.round(50 + st.int * 8 + lv * 5 + bonus.mp),
    def:   Math.round(4 + st.con * 1.1 + lv * 1 + bonus.def),
    spd:   Math.round(8 + st.agi * 1.5 + bonus.spd),
    crit:  Math.round((4 + st.agi * 0.5 + bonus.crit) * 10) / 10,
    dodge: Math.round((2 + st.agi * 0.3) * 10) / 10,
    atk: { str: atkOf('str'), agi: atkOf('agi'), int: atkOf('int'), con: atkOf('con') }
  };
}

const expNeed = lv => Math.round(90 * Math.pow(1.3, lv - 1));

/* ------------------------------------------------------------------ 提示 */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* -------------------------------------------------------------- 背包 */
function addItem(id, n) {
  if (!ITEMS[id]) return;
  S.inv[id] = (S.inv[id] || 0) + (n || 1);
}
function removeItem(id, n) {
  n = n || 1;
  if (!S.inv[id]) return;
  S.inv[id] -= n;
  if (S.inv[id] <= 0) delete S.inv[id];
}
function sellItem(id) {
  const it = ITEMS[id];
  if (!it) return;
  const price = Math.floor((it.price || 0) * 0.5);
  removeItem(id, 1);
  S.gold += price;
  toast('卖出 ' + it.name + '，+' + price + ' 银币');
  updateUI(); saveGame();
}

function addExp(n) {
  S.exp += n;
  let up = 0;
  while (S.exp >= expNeed(S.level)) {
    S.exp -= expNeed(S.level);
    S.level++;
    S.free += 3;
    up++;
  }
  if (up) {
    const p = derived(S);
    S.hp = p.maxHp; S.mp = p.maxMp;
    toast('等级提升！Lv.' + S.level + '　获得 ' + (up * 3) + ' 点自由属性');
  }
}

/* -------------------------------------------------------------- 屏幕 */
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('show'));
  $('#' + id).classList.add('show');
}

/* ---------------------------------------------------------- 打字机 */
const typing = { text: '', i: 0, timer: null, done: null, active: false };

function typeText(text, done) {
  clearTimeout(typing.timer);
  const el = $('#prose');
  el.textContent = '';
  $('#choices').innerHTML = '';
  $('#stage').scrollTop = 0;
  typing.text = text; typing.i = 0; typing.done = done; typing.active = true;

  const step = () => {
    if (!typing.active) return;
    typing.i += 2;
    if (typing.i >= text.length) { finishTyping(); return; }
    el.textContent = text.slice(0, typing.i);
    typing.timer = setTimeout(step, 10);
  };
  step();
}

function finishTyping() {
  if (!typing.active) return;
  typing.active = false;
  clearTimeout(typing.timer);
  $('#prose').innerHTML = esc(typing.text)
    .replace(/【([^】\n]*)】/g, '<span class="sys">【$1】</span>');
  $('#stage').scrollTop = 0;
  const cb = typing.done; typing.done = null;
  if (cb) cb();
}

/* ---------------------------------------------------------- 场景引擎 */
function go(id) {
  if (!SCENES[id]) { console.warn('缺少场景：' + id); return; }
  S.scene = id;
  const sc = SCENES[id];
  if (sc.onEnter) sc.onEnter(S);

  const dp = derived(S);
  S.hp = clamp(S.hp, 0, dp.maxHp);
  S.mp = clamp(S.mp, 0, dp.maxMp);

  saveGame();
  renderScene();
}

function renderScene() {
  const sc = SCENES[S.scene];
  if (!sc) return;

  $('#tb-chapter').textContent = sc.chapter || '荣耀 · 第十区';
  $('#art').className = 'art art-' + (sc.art || 'night');
  paintPortrait('#art-char', S.cls, 'char');
  updateUI();

  const text = typeof sc.text === 'function' ? sc.text(S) : (sc.text || '');

  if (sc.instant) {
    clearTimeout(typing.timer);
    typing.active = false; typing.text = text; typing.done = null;
    $('#prose').innerHTML = esc(text).replace(/【([^】\n]*)】/g, '<span class="sys">【$1】</span>');
    $('#choices').innerHTML = '';
    $('#stage').scrollTop = 0;
    renderChoices(sc);
  } else {
    typeText(text, () => renderChoices(sc));
  }
}

function renderChoices(sc) {
  const list = typeof sc.choices === 'function' ? sc.choices(S) : (sc.choices || []);
  curChoices = list;
  const wrap = $('#choices');
  wrap.innerHTML = '';
  list.forEach((ch, i) => {
    const ok = !ch.req || ch.req(S);
    const b = document.createElement('button');
    b.className = 'choice';
    b.disabled = !ok;
    b.innerHTML =
      '<span class="num">' + (i + 1) + '</span>' +
      '<span class="txt">' + esc(ch.label) + '</span>' +
      (ch.hint ? '<span class="hint">' + esc(ch.hint) + '</span>' : '') +
      (!ok && ch.reqText ? '<span class="lock">需 ' + esc(ch.reqText) + '</span>' : '');
    if (ok) b.addEventListener('click', () => choose(ch));
    wrap.appendChild(b);
  });
}

function choose(ch) {
  if (ch.req && !ch.req(S)) return;
  if (ch.combat) {
    startCombat(ch.combat.enemy, {
      win: ch.combat.win, lose: ch.combat.lose, flee: ch.combat.flee,
      dungeon: ch.combat.dungeon
    });
    return;
  }
  if (ch.run) {
    const before = S.scene;
    if (typeof ch.run === 'string') { if (RUN[ch.run]) RUN[ch.run](); }
    else ch.run();
    if (S.scene === before) renderChoices(SCENES[S.scene]);
    return;
  }
  if (ch.to) go(ch.to);
}

const RUN = {};

/* ---------------------------------------------------------- 战斗入口 */
function startCombat(enemyId, opts) {
  opts = opts || {};
  Combat.start(enemyId, {
    onEnd: function (result) {
      const ov = $('#overlay');
      if (ov) ov.hidden = true;
      if (result === 'win' && opts.dungeon) {
        recordDungeon(opts.dungeon, Combat.lastSeconds());
      }
      const target = result === 'win' ? (opts.win || S.scene)
                   : result === 'lose' ? (opts.lose || 's_death')
                   : (opts.flee || S.scene);
      go(target);
    }
  });
}

/* ---------------------------------------------------------- 副本榜单 */
function rankOf(did, t) {
  const d = DUNGEONS[did];
  if (!d) return 0;
  return d.board.filter(b => b.time < t).length + 1;
}

function recordDungeon(did, seconds) {
  const d = DUNGEONS[did];
  if (!d) return;
  S.records = S.records || {};
  const t = Math.max(1, Math.round(seconds * 10) / 10);
  const prev = S.records[did];
  const msg = [];

  if (!prev) {
    S.records[did] = { best: t, clears: 1 };
    S.fame = (S.fame || 0) + 50;
    msg.push('首杀！知名度 +50');
  } else if (t < prev.best) {
    const gain = Math.max(3, Math.round((prev.best - t) * 2));
    S.records[did].best = t;
    S.records[did].clears = (prev.clears || 1) + 1;
    S.fame = (S.fame || 0) + gain;
    msg.push('刷新记录 ' + prev.best.toFixed(1) + 's → ' + t.toFixed(1) + 's，知名度 +' + gain);
  } else {
    S.records[did].clears = (prev.clears || 1) + 1;
    msg.push('通关 ' + t.toFixed(1) + 's（个人最好 ' + prev.best.toFixed(1) + 's）');
  }

  const rank = rankOf(did, S.records[did].best);
  msg.push('系统榜单第 ' + rank + ' 位');
  S.lastRecord = msg.join('　');

  if (did === 'qianbo' && !S.flags.ch1) S.flags.ch1 = true;
  saveGame();
  toast(msg[0]);
}

function buildBoardText(st) {
  let out = '系统榜单 · 第十区\n';
  Object.keys(DUNGEONS).forEach(id => {
    const d = DUNGEONS[id];
    out += '\n【' + d.name + '】' + d.lv + '\n';
    const rows = d.board.map(b => ({ name: b.name, time: b.time, mine: false }));
    const rec = st.records && st.records[id];
    rows.push(rec ? { name: st.name + '（我）', time: rec.best, mine: true }
                  : { name: '—— 未上榜 ——', time: null, mine: true });
    rows.sort((a, b) => (a.time == null ? 1e9 : a.time) - (b.time == null ? 1e9 : b.time));
    rows.slice(0, 6).forEach((r, i) => {
      const rank = String(i + 1).padStart(2, ' ');
      const tm = r.time == null ? '   —   ' : r.time.toFixed(1) + 's';
      out += '　' + rank + '. ' + r.name.padEnd(12, '　') + tm + (r.mine ? '  ◀' : '') + '\n';
    });
  });
  return out;
}

function skillBarOf(st, form) {
  if (st.cls !== 'sanren') return CLASSES[st.cls].skillIds;
  return FORM_SKILLS[form || st.form || 'sword'] || [];
}

/* ---------------------------------------------------------- 立绘 */
function paintPortrait(sel, clsId, mode) {
  const el = sel.charAt(0) === '#' ? $(sel) : $('#' + sel);
  if (!el) return;
  mode = mode || 'full';
  const key = clsId + '|' + mode;
  if (el.dataset.cls === key) return;
  el.dataset.cls = key;
  el.innerHTML = portraitSVG(clsId, mode);
  el.style.setProperty('--pc', portraitColor(clsId));
}

/* ---------------------------------------------------------- 面板 */
function barHtml(cls, v, max) {
  const pct = clamp(v / max * 100, 0, 100);
  return '<div class="bar ' + cls + '"><i style="width:' + pct + '%"></i>' +
         '<b>' + Math.round(v) + ' / ' + Math.round(max) + '</b></div>';
}

function updateUI() {
  if (!S) return;
  const p = derived(S);
  S.hp = clamp(S.hp, 0, p.maxHp);
  S.mp = clamp(S.mp, 0, p.maxMp);

  $('#tb-name').textContent = S.name;
  $('#tb-class').textContent = CLASSES[S.cls].name;
  $('#tb-gold').textContent = S.gold + ' 银';
  const fam = $('#tb-fame');
  if (fam) fam.textContent = '知名度 ' + (S.fame || 0);

  $('#p-name').textContent = S.name;
  $('#p-meta').textContent = 'Lv.' + S.level + ' · ' + CLASSES[S.cls].name;

  paintPortrait('#p-portrait', S.cls, 'face');

  $('#p-bars').innerHTML =
    barHtml('hp', S.hp, p.maxHp) + barHtml('mp', S.mp, p.maxMp) +
    barHtml('xp', S.exp, expNeed(S.level));

  renderTab();
}

function row(k, v) {
  return '<div class="stat-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
}

function sanrenSkillTab() {
  const cur = S.form || 'sword';
  let h = '<div class="sec-title">千机伞 · 12 形态</div>';
  h += '<p class="chain-note">散人没有固定技能栏：伞换个形态就是换一整套技能，120 个低阶技能全部可用。' +
       '战斗中随时变形，<b>换过形态的下一招必定接上连招</b>（+15%）；同一个形态连打会断连。</p>';
  UMBRELLA_FORMS.forEach(f => {
    const on = f.id === cur;
    h += '<div class="form-card' + (on ? ' on' : '') + '" data-formset="' + f.id + '">' +
         '<div class="fc-h"><b>' + f.name + '形态</b><span>' + f.desc + '</span>' +
         (on ? '<em>当前</em>' : '') + '</div>' +
         '<div class="fc-sk">' + FORM_SKILLS[f.id].map(id => SKILLS[id].name).join('　') + '</div>' +
         '</div>';
  });
  return h;
}

function setSanrenForm(id) {
  if (!FORM_SKILLS[id]) return;
  S.form = id;
  S.skills = FORM_SKILLS[id].slice();
  saveGame();
  renderTab();
  toast('千机伞 · ' + FORM_NAME[id] + '形态');
}
function renderTab() {
  const body = $('#p-body');
  const p = derived(S);
  const cls = CLASSES[S.cls];
  let h = '';

  if (curTab === 'attr') {
    h += '<div class="sec-title">基础属性</div>';
    if (S.free > 0) h += '<div class="free-pt">可分配点数：' + S.free + '</div>';
    const rows = [['str', '力量'], ['agi', '敏捷'], ['int', '智力'], ['con', '体质']];
    rows.forEach(r => {
      h += '<div class="stat-row"><span class="k">' + r[1] + (cls.main === r[0] ? ' <em>主</em>' : '') +
        '</span><span class="v">' + S[r[0]] +
        (S.free > 0 ? ' <button class="plus" data-plus="' + r[0] + '">+</button>' : '') +
        '</span></div>';
    });
    h += '<div class="sec-title">战斗数值</div>';
    h += row('攻击', p.atk[cls.main]);
    h += row('防御', p.def);
    h += row('生命', p.maxHp);
    h += row('法力', p.maxMp);
    h += row('速度', p.spd);
    h += row('暴击', p.crit + '%');
    h += row('闪避', p.dodge + '%');
    h += '<div class="sec-title">档案</div>';
    h += row('派系', cls.school);
    h += row('定位', cls.role);
    h += row('知名度', S.fame || 0);
    h += row('击杀', S.kills || 0);
  }

  if (curTab === 'bag') {
    h += '<div class="sec-title">装备中</div>';
    const slotName = { weapon: '武器', armor: '防具' };
    ['weapon', 'armor'].forEach(slot => {
      const id = S.equip[slot];
      const it = id ? ITEMS[id] : null;
      h += '<div class="item-row"><span class="nm">' + (it ? it.name : '（空）') +
           '<small>' + slotName[slot] + '</small></span></div>';
    });
    h += '<div class="sec-title">背包</div>';
    const ids = Object.keys(S.inv).filter(id => S.inv[id] > 0);
    if (!ids.length) h += '<div class="empty">空空如也。</div>';
    ids.forEach(id => {
      const it = ITEMS[id];
      if (!it) return;
      let btn = '';
      if (it.type === 'consume') btn = '<button class="mini" data-use="' + id + '">使用</button>';
      else if (it.type === 'equip') btn = '<button class="mini" data-equip="' + id + '">装备</button>';
      else btn = '<button class="mini" data-sell="' + id + '">卖出</button>';
      h += '<div class="item-row"><span class="nm">' + it.name +
           '<small>' + it.desc + '</small></span>' +
           '<span class="ct">×' + S.inv[id] + '</span>' + btn + '</div>';
    });
  }

  if (curTab === 'skill') {
    if (cls.freeChain) {
      h += sanrenSkillTab();
    } else {
      h += '<div class="sec-title">' + cls.name + ' · 连招链</div>';
      const chain = cls.chain;
      h += '<div class="chain-path">' + chain.map((x, i) =>
        (i ? '<span class="ar">›</span>' : '') +
        '<span>' + SKILLS[x].name + '</span>').join('') + '</div>';
      h += '<p class="chain-note">按顺序命中后摇只有 55%，伤害逐层 +18%；打满整套额外 +30%、返还一半法力、并使目标破防。不按顺序放，后摇 160% 且挂破绽。</p>';
      h += '<div class="sec-title">技能</div>';
      cls.skillIds.forEach(id => {
        const sk = SKILLS[id];
        const ci = cls.chain.indexOf(id);
        const pos = ci >= 0 ? (ci + 1) + ' 式' : '辅助';
        h += '<div class="skill-row"><div class="sn"><b>' + sk.name + '</b>' +
             '<span>' + pos + ' · ' + sk.cast + '+' + sk.rec + ' 拍</span></div>' +
             '<p>' + sk.desc + '</p>' +
             '<p class="chainpos"><span>MP ' + sk.mp + ' · CD ' + (sk.cd / 5).toFixed(1) + 's</span></p></div>';
      });
    }
  }

  if (curTab === 'sys') {
    h += '<div class="sec-title">存档</div>';
    h += '<div class="item-row"><span class="nm">自动存档已开启</span>' +
         '<button class="mini" data-cmd="save">立即保存</button></div>';
    h += '<div class="item-row"><span class="nm">读取上次存档</span>' +
         '<button class="mini" data-cmd="load">读取</button></div>';
    h += '<div class="item-row"><span class="nm">重新开始</span>' +
         '<button class="mini" data-cmd="restart">重来</button></div>';
    h += '<div class="sec-title">记录</div>';
    h += row('章节', (SCENES[S.scene] && SCENES[S.scene].chapter) || '—');
    h += row('知名度', S.fame || 0);
    h += row('击杀', S.kills || 0);
    Object.keys(S.records || {}).forEach(id => {
      h += row(DUNGEONS[id] ? DUNGEONS[id].name : id, S.records[id].best.toFixed(1) + 's');
    });
  }

  body.innerHTML = h;
}

/* -------------------------------------------------------------- 物品 */
function useItem(id) {
  const it = ITEMS[id];
  if (!it) return;
  if (it.type === 'equip') { equipItem(id); return; }
  if (it.type !== 'consume') return;
  const p = derived(S);
  if (it.heal) {
    if (S.hp >= p.maxHp) { toast('生命已满。'); return; }
    S.hp = Math.min(p.maxHp, S.hp + it.heal);
  }
  if (it.mana) {
    if (S.mp >= p.maxMp) { toast('法力已满。'); return; }
    S.mp = Math.min(p.maxMp, S.mp + it.mana);
  }
  removeItem(id, 1);
  toast('使用了 ' + it.name);
  updateUI(); saveGame();
}

function equipItem(id) {
  const it = ITEMS[id];
  if (!it || it.type !== 'equip' || !S.inv[id]) return;
  const old = S.equip[it.slot];
  S.equip[it.slot] = id;
  removeItem(id, 1);
  if (old) addItem(old, 1);
  toast('装备 ' + it.name);
  updateUI(); saveGame();
}

function autoEquip() {
  const worth = it => it
    ? (it.bonus.atk || 0) * 2 + (it.bonus.def || 0) + (it.bonus.hp || 0) / 10 + (it.bonus.crit || 0)
    : -1;
  ['weapon', 'armor'].forEach(slot => {
    let best = null;
    let bestV = worth(S.equip[slot] ? ITEMS[S.equip[slot]] : null);
    Object.keys(S.inv).forEach(id => {
      const it = ITEMS[id];
      if (!it || it.type !== 'equip' || it.slot !== slot || !S.inv[id]) return;
      const v = worth(it);
      if (v > bestV) { best = id; bestV = v; }
    });
    if (best) equipItem(best);
  });
}

/* -------------------------------------------------------------- 存档 */
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 忽略 */ }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const o = JSON.parse(raw);
    if (!o || !o.cls || !CLASSES[o.cls] || !SCENES[o.scene]) return false;
    S = o;
    if (!S.records) S.records = {};
    if (S.fame == null) S.fame = 0;
    return true;
  } catch (e) { return false; }
}
function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

/* -------------------------------------------------------------- 新建 */
function newGame() {
  const name = ($('#inp-name').value || '').trim().slice(0, 8) || '无名氏';
  const c = CLASSES[selClass];
  S = {
    name: name, cls: selClass,
    level: 1, exp: 0, free: 0,
    str: c.base.str, agi: c.base.agi, int: c.base.int, con: c.base.con,
    hp: 1, mp: 1, gold: 300, fame: 0,
    inv: { potion_s: 3 },
    equip: { weapon: 'w_wood', armor: null },
    skills: c.freeChain ? FORM_SKILLS.sword.slice() : c.skillIds.slice(),
    form: c.freeChain ? 'sword' : null,
    flags: {}, kills: 0, records: {},
    scene: 's_open', startedAt: Date.now()
  };
  const p = derived(S);
  S.hp = p.maxHp; S.mp = p.maxMp;
  showScreen('scr-game');
  curTab = 'attr';
  $$('#p-tabs button').forEach(x => x.classList.toggle('on', x.dataset.tab === 'attr'));
  go('s_open');
}

/* -------------------------------------------------------------- 建档 */
function buildSchoolTabs() {
  const box = $('#school-tabs');
  box.innerHTML = '';
  SCHOOLS.forEach(school => {
    const b = document.createElement('button');
    b.textContent = school;
    b.className = school === selSchool ? 'on' : '';
    b.addEventListener('click', () => { selSchool = school; buildSchoolTabs(); buildClassCards(); });
    box.appendChild(b);
  });
}

function buildClassCards() {
  const g = $('#class-grid');
  g.innerHTML = '';
  const list = classList(selSchool);
  list.forEach(id => {
    const c = CLASSES[id];
    const b = document.createElement('button');
    b.className = 'class-card' + (id === selClass ? ' on' : '');
    b.innerHTML =
      '<div class="cc-cat">' + c.school + '</div>' +
      '<div class="cc-name">' + c.name + '</div>' +
      '<div class="cc-tag">' + c.role + '</div>';
    b.addEventListener('click', () => {
      selClass = id;
      buildClassCards();
      showClassDetail();
    });
    g.appendChild(b);
  });
  showClassDetail();
  checkEnter();
}

function showClassDetail() {
  const c = CLASSES[selClass];
  paintPortrait('#c-portrait', selClass, 'full');
  const list = c.freeChain
    ? '<em>千机伞 · 12 形态 · 120 个低阶技能</em>　换形态即换技能组'
    : c.skillIds.map(id => '· <em>' + SKILLS[id].name + '</em>').join('　');
  $('#class-detail').innerHTML =
    '<b>' + c.name + '</b>　<span class="cd-school">' + c.school + ' · ' + c.role + '</span><br>' +
    c.desc.replace(/\n/g, '<br>') +
    '<br><br>' + list;
}

function checkEnter() {
  $('#btn-enter').disabled = ($('#inp-name').value || '').trim().length === 0;
}

/* -------------------------------------------------------------- 事件 */
function bindEvents() {
  $('#btn-new').addEventListener('click', () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    buildSchoolTabs();
    buildClassCards();
    $('#inp-name').value = '';
    checkEnter();
    showScreen('scr-create');
    setTimeout(() => $('#inp-name').focus(), 60);
  });
  $('#btn-load').addEventListener('click', () => {
    if (loadGame()) {
      showScreen('scr-game');
      renderScene();
      toast('读取存档成功。');
    } else toast('没有可读取的存档。');
  });

  $('#inp-name').addEventListener('input', checkEnter);
  $('#inp-name').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !$('#btn-enter').disabled) $('#btn-enter').click();
  });
  $('#btn-back').addEventListener('click', () => showScreen('scr-title'));
  $('#btn-enter').addEventListener('click', newGame);

  $('#stage').addEventListener('click', () => {
    if (typing.active) finishTyping();
  });

  $('#btn-panel').addEventListener('click', () => $('#panel').classList.toggle('open'));

  $('#p-tabs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    curTab = b.dataset.tab;
    $$('#p-tabs button').forEach(x => x.classList.toggle('on', x === b));
    renderTab();
  });

  $('#p-body').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.plus) {
      if (S.free > 0) { S[b.dataset.plus]++; S.free--; updateUI(); saveGame(); }
    } else if (b.dataset.eq) equipSanrenSkill(b.dataset.eq);
    else if (b.dataset.un) unequipSanrenSkill(b.dataset.un);
    else if (b.dataset.formset) setSanrenForm(b.dataset.formset);
    else if (b.dataset.use) useItem(b.dataset.use);
    else if (b.dataset.equip) equipItem(b.dataset.equip);
    else if (b.dataset.sell) sellItem(b.dataset.sell);
    else if (b.dataset.cmd) {
      const cmd = b.dataset.cmd;
      if (cmd === 'save') { saveGame(); toast('已保存。'); }
      if (cmd === 'load') { if (loadGame()) { renderScene(); toast('已读取。'); } else toast('没有存档。'); }
      if (cmd === 'restart') {
        if (confirm('清空当前存档，重新开始？')) {
          try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
          S = null; showScreen('scr-title'); $('#btn-load').disabled = !hasSave();
        }
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (!$('#scr-game').classList.contains('show')) return;
    if (typing.active && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); finishTyping(); return; }
    if (Combat.isRunning()) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        const btns = $$('#battle-actions .act-btn');
        const b = btns[n - 1];
        if (b && !b.disabled) b.click();
      }
      return;
    }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) {
      const btns = $$('#choices .choice');
      const b = btns[n - 1];
      if (b && !b.disabled) b.click();
    }
  });
}

/* -------------------------------------------------------------- 启动 */
function boot() {
  bindEvents();
  $('#btn-load').disabled = !hasSave();
  buildSchoolTabs();
  buildClassCards();

  window.GameAPI = {
    get S() { return S; },
    derived: derived,
    classOf: classOf,
    skillBarOf: skillBarOf,
    addExp: addExp,
    addItem: addItem,
    saveGame: saveGame,
    updateUI: updateUI,
    toast: toast,
    go: go,
    el: id => document.getElementById(id),
    paintPortrait: paintPortrait,
    openOverlay: () => { const o = $('#overlay'); if (o) o.hidden = false; }
  };
  Combat.configure(window.GameAPI);

  window.addItem = addItem;
  window.toast = toast;
  window.saveGame = saveGame;
  window.updateUI = updateUI;
  window.startCombat = startCombat;
  window.autoEquip = autoEquip;
  window.buildBoardText = buildBoardText;
  window.Glory = {
    go: go, startCombat: startCombat, autoEquip: autoEquip,
    addItem: addItem, toast: toast, saveGame: saveGame, updateUI: updateUI,
    derived: derived, expNeed: expNeed, recordDungeon: recordDungeon
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
