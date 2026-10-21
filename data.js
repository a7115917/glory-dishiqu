/* ==========================================================================
   荣耀 · 第十区  —   世界数据
   物品 / 敌人 / 副本 / 榜单 / 剧情
   ========================================================================== */

/* ------------------------------------------------------------------ 物品 */
const ITEMS = {
  potion_s:  { name: '小红药', type: 'consume', heal: 70,  price: 30,  desc: '恢复 70 点生命。' },
  potion_m:  { name: '中红药', type: 'consume', heal: 180, price: 80,  desc: '恢复 180 点生命。' },
  potion_l:  { name: '大红药', type: 'consume', heal: 420, price: 200, desc: '恢复 420 点生命。' },
  potion_mp: { name: '蓝药',   type: 'consume', mana: 70,  price: 40,  desc: '恢复 70 点法力。' },

  w_wood:  { name: '新手木剑', type: 'equip', slot: 'weapon', bonus: { atk: 4 }, price: 10, desc: '削得歪歪扭扭，但总比空手强。' },
  w_iron:  { name: '精铁长剑', type: 'equip', slot: 'weapon', bonus: { atk: 16, crit: 2 }, price: 260, desc: '铁匠铺的标准货，剑身有一道流水纹。' },
  w_bone:  { name: '白骨长刃', type: 'equip', slot: 'weapon', bonus: { atk: 26, crit: 3 }, price: 800, desc: '埋骨之地出产，刀身泛着散不掉的冷光。' },
  w_frost: { name: '银武 · 霜寒', type: 'equip', slot: 'weapon', bonus: { atk: 38, crit: 6, spd: 4 }, price: 2400, desc: '银武。剑身覆着一层化不开的白霜。' },

  a_cloth:   { name: '粗布衣',   type: 'equip', slot: 'armor', bonus: { def: 3 }, price: 20, desc: '聊胜于无。' },
  a_leather: { name: '硬皮甲',   type: 'equip', slot: 'armor', bonus: { def: 9, hp: 40 }, price: 300, desc: '鞣制过的野猪皮，还算结实。' },
  a_bone:    { name: '白骨胸甲', type: 'equip', slot: 'armor', bonus: { def: 15, hp: 80 }, price: 700, desc: '不知是哪副骨架上的。' },
  a_chain:   { name: '锁子甲',   type: 'equip', slot: 'armor', bonus: { def: 20, hp: 120 }, price: 1000, desc: '一环扣一环，沉得压肩。' },

  mat_scale: { name: '蜥蜴鳞片', type: 'material', price: 8, desc: '可以卖钱，也可以留着交任务。' },
  mat_bone:  { name: '白骨碎片', type: 'material', price: 15, desc: '埋骨之地的特产。' },
  mat_core:  { name: '魂晶', type: 'material', price: 120, desc: '白骨骑士的核心，幽蓝幽蓝的。' },
  mat_frost: { name: '霜核', type: 'material', price: 90, desc: '冰霜巨魔的心脏，摸上去扎手。' }
};

/* ------------------------------------------------------------------ 敌人 */
/* 敌人技能也走实时轴：cast 前摇 / rec 后摇 / cd 冷却（tick） */
function es(name, power, cast, rec, cd) {
  return { name: name, power: power, cast: cast, rec: rec, cd: cd };
}

const ENEMIES = {
  lizard: {
    name: '沼泽蜥蜴', level: 2, hp: 300, atk: 11, def: 5, spd: 8, exp: 55, gold: 14,
    skills: [es('撕咬', 105, 3, 4, 18), es('尾扫', 90, 2, 3, 14)],
    loot: [{ id: 'mat_scale', n: 2, p: 1 }, { id: 'potion_s', n: 1, p: .3 }]
  },
  boar: {
    name: '铁鬃野猪', level: 4, hp: 460, atk: 15, def: 9, spd: 6, exp: 95, gold: 22,
    skills: [es('冲撞', 120, 4, 5, 20), es('獠牙挑', 100, 2, 3, 14)],
    loot: [{ id: 'mat_scale', n: 1, p: .8 }, { id: 'potion_s', n: 1, p: .35 }]
  },
  wolf: {
    name: '霜狼', level: 6, hp: 560, atk: 18, def: 10, spd: 14, exp: 150, gold: 40,
    skills: [es('扑咬', 120, 2, 4, 16), es('霜息', 100, 3, 3, 18)],
    loot: [{ id: 'potion_m', n: 1, p: .5 }, { id: 'mat_bone', n: 1, p: .7 }]
  },
  skeleton: {
    name: '骷髅战士', level: 7, hp: 620, atk: 20, def: 12, spd: 7, exp: 130, gold: 30,
    skills: [es('骨刃劈砍', 115, 3, 4, 16), es('亡灵嘶吼', 95, 4, 5, 22)],
    loot: [{ id: 'mat_bone', n: 2, p: 1 }, { id: 'potion_s', n: 1, p: .4 }]
  },
  lord: {
    name: '沼泽领主', level: 8, hp: 1300, atk: 20, def: 13, spd: 9, exp: 260, gold: 120, boss: true,
    skills: [es('泥沼吐息', 130, 4, 5, 20), es('鳞甲横扫', 115, 3, 4, 16),
             { name: '狂性', buff: true, cast: 2, rec: 2, cd: 45 }],
    loot: [{ id: 'w_iron', n: 1, p: 1 }, { id: 'potion_m', n: 2, p: 1 }]
  },
  boneknight: {
    name: '白骨骑士', level: 11, hp: 1900, atk: 24, def: 18, spd: 10, exp: 420, gold: 200, boss: true,
    skills: [es('死亡冲锋', 140, 5, 6, 24), es('骨刺突袭', 120, 3, 4, 18),
             { name: '亡者之怒', buff: true, cast: 2, rec: 2, cd: 50 }],
    loot: [{ id: 'w_bone', n: 1, p: 1 }, { id: 'a_bone', n: 1, p: 1 },
           { id: 'mat_core', n: 1, p: 1 }, { id: 'potion_m', n: 2, p: 1 }]
  },
  troll: {
    name: '冰霜巨魔', level: 13, hp: 2200, atk: 27, def: 20, spd: 8, exp: 520, gold: 260, boss: true,
    skills: [es('碎冰重锤', 150, 5, 6, 26), es('寒冰吐息', 125, 4, 5, 20),
             { name: '冰甲', buff: true, cast: 2, rec: 2, cd: 40 }],
    loot: [{ id: 'a_chain', n: 1, p: 1 }, { id: 'mat_frost', n: 1, p: 1 }, { id: 'potion_l', n: 2, p: 1 }]
  },
  shadow: {
    name: '暗影祭司', level: 15, hp: 2600, atk: 30, def: 17, spd: 13, exp: 640, gold: 320, boss: true,
    skills: [es('暗影箭', 130, 3, 4, 16), es('死亡缠绕', 145, 4, 5, 22),
             { name: '黑暗仪式', buff: true, cast: 2, rec: 2, cd: 45 }],
    loot: [{ id: 'w_frost', n: 1, p: .35 }, { id: 'potion_l', n: 3, p: 1 }]
  },

  arena1: {
    name: '路人 · 枪手', level: 5, hp: 520, atk: 16, def: 8, spd: 12, exp: 90, gold: 60,
    skills: [es('点射', 110, 2, 3, 12), es('滑铲', 100, 2, 3, 16)]
  },
  arena2: {
    name: '青训 · 拳家', level: 8, hp: 760, atk: 21, def: 13, spd: 9, exp: 160, gold: 120,
    skills: [es('崩拳', 125, 3, 3, 14), es('鹰踏', 90, 2, 3, 12)]
  },
  arena3: {
    name: '青训 · 剑客', level: 11, hp: 1050, atk: 26, def: 16, spd: 14, exp: 280, gold: 240,
    skills: [es('拔刀斩', 150, 3, 4, 16), es('三段斩', 70, 2, 3, 12)]
  }
};

/* ------------------------------------------------------------------ 副本 */
/* board = 系统榜单（NPC 记录，单位：秒）；par = 参考耗时 */
const DUNGEONS = {
  qianbo: {
    name: '千波湖 · 沼泽深处', lv: 'Lv.6', boss: 'lord', par: 55, need: 4,
    desc: '第十区最早开放的副本。三只蜥蜴、一只领主，是所有人第一次知道「BOSS 会打架」的地方。',
    board: [
      { name: '夜雨声烦', time: 31.4 },
      { name: '一叶之秋', time: 33.8 },
      { name: '大漠孤烟', time: 36.2 },
      { name: '索克萨尔', time: 39.5 },
      { name: '王不留行', time: 42.1 }
    ]
  },
  baigu: {
    name: '埋骨之地', lv: 'Lv.10', boss: 'boneknight', par: 80, need: 9,
    desc: '城墙都是用骨头砌的。白骨骑士站在大厅正中，两团蓝火从头盔里看着每一个进来的人。',
    board: [
      { name: '一叶之秋', time: 44.9 },
      { name: '索克萨尔', time: 48.3 },
      { name: '夜雨声烦', time: 51.0 },
      { name: '沐雨橙风', time: 55.6 },
      { name: '大漠孤烟', time: 58.2 }
    ]
  },
  bingshuang: {
    name: '冰霜裂谷', lv: 'Lv.13', boss: 'troll', par: 110, need: 12,
    desc: '谷底的寒气能把血冻住。冰霜巨魔一锤子下去，地面会裂开三丈。',
    board: [
      { name: '大漠孤烟', time: 61.7 },
      { name: '一叶之秋', time: 64.2 },
      { name: '王不留行', time: 69.8 },
      { name: '索克萨尔', time: 73.4 },
      { name: '沐雨橙风', time: 78.9 }
    ]
  },
  shenzhi: {
    name: '神之领域 · 残响', lv: 'Lv.16', boss: 'shadow', par: 140, need: 15,
    desc: '第十区唯一的隐藏副本。进去的人不多，出来的更少。',
    board: [
      { name: '一叶之秋', time: 82.5 },
      { name: '大漠孤烟', time: 86.1 },
      { name: '王不留行', time: 91.7 },
      { name: '索克萨尔', time: 95.3 },
      { name: '夜雨声烦', time: 99.8 }
    ]
  }
};

const SHOP_STOCK = ['potion_s', 'potion_m', 'potion_mp', 'a_leather',
  'w_iron', 'w_bone', 'a_bone', 'a_chain', 'w_frost'];

/* ==========================================================================
   剧情
   ========================================================================== */
const SCENES = {

  s_open: {
    chapter: '序章 · 第十区开服',
    art: 'night',
    text:
`凌晨零点整。

荣耀第十区，准时开服。

登录队列第 42,117 位。屏幕上滚动着公告：「第十区为全新服务器，所有玩家从零开始，不继承任何区服数据。」

四年，七个区，十一个号。最长的一次坚持到 47 级，然后在一个下雨的夜里把鼠标摔了。

这一次不太一样——S10 赛季的转会期刚过，三个老牌战队都在找新人。而新区，是唯一还会给路人机会的地方。

【系统】创建角色成功。祝你好运。`,
    choices: [{ label: '登录', to: 's_arrive' }]
  },

  s_arrive: {
    chapter: '第一章 · 千波湖',
    art: 'lake',
    text:
`白光散去。

你在千波湖的滩涂上站定，脚下是潮湿的黑土，远处芦苇被风吹得沙沙响。

【系统】当前区域：千波湖。推荐等级 1–6。
【系统】右侧面板「技能」页可以看到你的连招顺序——先看一遍，再看风景。

一个灰袍引导员飘过来，笑得很职业：

【新手引导】荣耀的战斗没有回合。你出手有前摇，收手有后摇。前摇被打中会断招，后摇被人抓住就是破绽。`,
    choices: [
      { label: '打开技能面板，记住连招', to: 's_tutorial' },
      { label: '不用了，直接上', to: 's_hub' }
    ]
  },

  s_tutorial: {
    chapter: '第一章 · 千波湖',
    art: 'lake',
    instant: true,
    text:
`面板展开。

【连招】每个职业都有一条固定的连招链。按顺序打，后摇只有 55%，伤害一层比一层高。
【断连】不按顺序放，后摇变成 160%，全程挂「破绽」——对面打你会更疼。这就是不背连招的代价。
【预输入】收招的时候可以先把下一招点下去，它会在硬直结束的瞬间自动接上。高手都是这么打的。
【打断】对面头顶有一条红色施法条。在前摇结束前打中他，技能直接没了，还会进入硬直。

【新手引导】记住一句话：看对面的条，算自己的条。`,
    choices: [{ label: '明白了', to: 's_hub' }]
  },

  s_hub: {
    chapter: '第一章 · 第十区',
    art: 'city',
    instant: true,
    text: (S) =>
`空积城，中央广场。

喷泉边上永远蹲着三个挂机的。城门口永远有人在喊「收材料」。世界频道在刷屏：

　　[世界] 千波湖沼泽深处副本 首杀还空着，有队吗
　　[世界] 埋骨之地 48 秒通关，队里还缺一个
　　[世界] 收霜核，价格好说

你的知名度：${S.fame || 0}。

【提示】首杀和刷新记录都会上系统榜单，也会涨知名度。知名度过关，才有人会来找你。`,
    choices: (S) => {
      const c = [];
      if (!S.flags.ch1) c.push({ label: '▶ 下千波湖副本', hint: '主线 · 需 Lv.4', req: S => S.level >= 4, reqText: 'Lv.4', to: 's_dungeon_qb' });
      else if (!S.flags.ch2) c.push({ label: '▶ 去挑战赛报名处看看', hint: '主线 · 需知名度 60', req: S => (S.fame || 0) >= 60, reqText: '知名度 60', to: 's_qualify' });
      c.push({ label: '去千波湖刷怪', hint: '练级', run: () => {
        const pool = S.level >= 6 ? ['boar', 'wolf', 'wolf'] : ['lizard', 'lizard', 'boar'];
        startCombat(pool[Math.floor(Math.random() * pool.length)], { win: 's_hub', lose: 's_death' });
      } });
      c.push({ label: '下副本', hint: '支线 · 刷榜', to: 's_dungeons' });
      c.push({ label: '系统榜单', hint: '看排名', to: 's_board' });
      c.push({ label: '去竞技场', to: 's_arena' });
      c.push({ label: '逛交易所', to: 's_shop' });
      c.push({ label: '回客栈休息', hint: '回满状态', to: 's_rest' });
      return c;
    }
  },

  /* ------------------------------------------------------------ 副本入口 */
  s_dungeons: {
    chapter: '第一章 · 第十区',
    art: 'tomb',
    instant: true,
    text:
`副本入口的石碑上刻着「荣耀」两个字，被摸得发亮。

每个副本都有三条记录：首杀、最快通关、以及你自己的最好成绩。`,
    choices: (S) => {
      const c = Object.keys(DUNGEONS).map(id => {
        const d = DUNGEONS[id];
        const rec = S.records && S.records[id];
        return {
          label: d.name,
          hint: d.lv + (rec ? ' · 我的记录 ' + rec.best.toFixed(1) + 's' : ' · 未通关'),
          req: S => S.level >= (d.need || 1),
          reqText: 'Lv.' + (d.need || 1),
          to: DUNGEON_SCENE[id]
        };
      });
      c.push({ label: '回广场', to: 's_hub' });
      return c;
    }
  },

  s_dungeon_qb: {
    chapter: '第一章 · 千波湖',
    art: 'lake',
    text:
`沼泽深处的入口是一道裂开的地缝，里面往外冒白气。

【系统】副本「千波湖 · 沼泽深处」 Lv.6
【系统】首杀：空缺。

公告栏上这句话已经挂了六个小时。六个小时里，第十区还没有一个人把它拿下来。

你看了看自己的血条，走了进去。`,
    choices: [
      { label: '进入副本', hint: 'BOSS · 计时开始', combat: { enemy: 'lord', win: 's_qb_win', lose: 's_death', dungeon: 'qianbo' } },
      { label: '再准备一下', to: 's_hub' }
    ]
  },

  s_dungeon_baigu: {
    chapter: '第一章 · 埋骨之地',
    art: 'tomb',
    text:
`埋骨之地，副本门口堆着一地白骨，风一吹，骨粉打着旋往人脸上扑。

【系统】副本「埋骨之地」 Lv.10
【系统】当前最快：一叶之秋 · 44.9 秒。`,
    choices: [
      { label: '进入副本', hint: 'BOSS · 计时开始', combat: { enemy: 'boneknight', win: 's_bg_win', lose: 's_death', dungeon: 'baigu' } },
      { label: '退回去', to: 's_dungeons' }
    ]
  },

  s_dungeon_bingshuang: {
    chapter: '第一章 · 冰霜裂谷',
    art: 'snow',
    text:
`裂谷底部的寒气能把血冻住。

【系统】副本「冰霜裂谷」 Lv.13
【系统】当前最快：大漠孤烟 · 61.7 秒。`,
    choices: [
      { label: '进入副本', hint: 'BOSS · 计时开始', combat: { enemy: 'troll', win: 's_bs_win', lose: 's_death', dungeon: 'bingshuang' } },
      { label: '退回去', to: 's_dungeons' }
    ]
  },

  s_dungeon_shenzhi: {
    chapter: '第一章 · 神之领域',
    art: 'night',
    text:
`隐藏副本。地图上根本找不到这个地方，是一个 NPC 在城门口小声告诉你的。

【系统】副本「神之领域 · 残响」 Lv.16
【系统】当前最快：一叶之秋 · 82.5 秒。`,
    choices: [
      { label: '进入副本', hint: '隐藏 BOSS · 计时开始', combat: { enemy: 'shadow', win: 's_sz_win', lose: 's_death', dungeon: 'shenzhi' } },
      { label: '退回去', to: 's_dungeons' }
    ]
  },

  s_qb_win: {
    chapter: '第一章 · 千波湖',
    art: 'lake',
    text: (S) => `沼泽领主轰然倒进泥里。

【系统】首杀达成！${S.lastRecord || ''}

公告栏上那行挂了一整晚的字，变成了你的名字。

【世界】？？？千波湖首杀被拿了
【世界】谁啊，没听说过
【世界】一个人？`,
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_bg_win: {
    chapter: '第一章 · 埋骨之地',
    art: 'tomb',
    text: (S) => `白骨骑士跪了下去，铠甲一节节垮成废铁。

【系统】${S.lastRecord || '通关'}

【世界】埋骨之地有人进前五了
【世界】ID 没见过，新号？`,
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_bs_win: {
    chapter: '第一章 · 冰霜裂谷',
    art: 'snow',
    text: (S) => `冰霜巨魔砸进冰里，裂谷震了一下。

【系统】${S.lastRecord || '通关'}`,
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_sz_win: {
    chapter: '第一章 · 神之领域',
    art: 'night',
    text: (S) => `暗影祭司化成一团黑雾散了。

【系统】${S.lastRecord || '通关'}

你站在空荡荡的厅里，听见自己心跳的声音。`,
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  /* ------------------------------------------------------------ 榜单 */
  s_board: {
    chapter: '第一章 · 第十区',
    art: 'city',
    instant: true,
    text: (S) => buildBoardText(S),
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_qualify: {
    chapter: '第二章 · 挑战赛',
    art: 'arena',
    text: (S) =>
`挑战赛报名处在竞技场后门，一张桌子，一块牌子。

桌子后面坐着个打瞌睡的工作人员。他抬眼看了看你的资料：

「第十区，知名度 ${S.fame || 0}。够了。」

他把一张表格推过来：「职业战队青训的选拔赛，三轮。赢了进名单，输了回去继续刷副本。」

「想好了？」

【系统】挑战赛 · 第一轮对手：路人 · 枪手`,
    choices: [
      { label: '报名', combat: { enemy: 'arena1', win: 's_ch1_next', lose: 's_death' } },
      { label: '再等等', to: 's_hub' }
    ]
  },

  s_ch1_next: {
    chapter: '第二章 · 挑战赛',
    art: 'arena',
    text:
`第一轮赢了。

对手从地上爬起来，冲你抱了个拳，没说话。

第二轮名单贴出来的时候，你在上面看到了几个熟悉的名字——都是别的区的老人，来第十区重新开号的。

【系统】第二轮对手：青训 · 拳家`,
    choices: [
      { label: '打第二轮', combat: { enemy: 'arena2', win: 's_ch2_next', lose: 's_death' } },
      { label: '先缓缓', to: 's_hub' }
    ]
  },

  s_ch2_next: {
    chapter: '第二章 · 挑战赛',
    art: 'arena',
    text:
`第二轮也赢了。

看台上开始有人议论。你听见有人念你的 ID，念了两遍才对上音。

【系统】第三轮对手：青训 · 剑客`,
    choices: [
      { label: '打第三轮', combat: { enemy: 'arena3', win: 's_ch2_end', lose: 's_death' } },
      { label: '先缓缓', to: 's_hub' }
    ]
  },

  s_ch2_end: {
    chapter: '第二章 · 完',
    art: 'arena',
    text: (S) =>
`第三轮，你赢了。

场地安静了两秒，然后才响起来。

工作人员把一份文件推过来，上面印着某支战队的队徽。

「签吧。」他说，「从今天起你不是路人了。」

【第二章 · 完】

——当前：Lv.${S.level} · 知名度 ${S.fame || 0} · 击杀 ${S.kills} · 银币 ${S.gold}`,
    onEnter: S => { S.flags.ch2 = true; },
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  /* ------------------------------------------------------------ 其它 */
  s_arena: {
    chapter: '第一章 · 空积城',
    art: 'arena',
    text:
`竞技场在西边。

石碑上刻着一行字：「胜负之外，皆是虚名。」

报名处的 NPC 抬头看了你一眼：「单人竞技，随机匹配。打吗？」`,
    choices: [
      { label: '打一场', hint: 'PVP', combat: { enemy: 'arena1', win: 's_arena_win', lose: 's_death' } },
      { label: '回去', to: 's_hub' }
    ]
  },

  s_arena_win: {
    chapter: '第一章 · 空积城',
    art: 'arena',
    text: `对手化作一道白光。

【系统】竞技积分 +12。知名度 +4。

竞技场的对手和野怪不一样——它们会跑、会躲，会在你以为占了上风的时候突然反打。`,
    onEnter: S => { S.fame = (S.fame || 0) + 4; },
    choices: [
      { label: '再来一场', combat: { enemy: 'arena2', win: 's_arena_win2', lose: 's_death' } },
      { label: '回广场', to: 's_hub' }
    ]
  },

  s_arena_win2: {
    chapter: '第一章 · 空积城',
    art: 'arena',
    text: `第二场赢得很勉强。

【系统】竞技积分 +28。知名度 +6。`,
    onEnter: S => { S.fame = (S.fame || 0) + 6; },
    choices: [
      { label: '打第三场', combat: { enemy: 'arena3', win: 's_arena_win3', lose: 's_death' } },
      { label: '见好就收', to: 's_hub' }
    ]
  },

  s_arena_win3: {
    chapter: '第一章 · 空积城',
    art: 'arena',
    text: `第三场，你赢了。

【系统】段位提升。
【系统】获得 400 银币。`,
    onEnter: S => { S.gold += 400; S.fame = (S.fame || 0) + 10; },
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_shop: {
    chapter: '第一章 · 空积城',
    art: 'city',
    instant: true,
    text:
`交易所。两排摊位从街口排到城墙根。

穿灰袍的老头冲你招手：「新人？都是实在价。」`,
    choices: (S) => {
      const c = SHOP_STOCK.map(id => {
        const it = ITEMS[id];
        return {
          label: it.name, hint: it.price + ' 银 · ' + it.desc,
          run: () => {
            if (S.gold < it.price) { toast('银币不够。'); return; }
            S.gold -= it.price; addItem(id, 1);
            toast('购入 ' + it.name); saveGame(); updateUI();
          }
        };
      });
      c.push({ label: '离开', to: 's_hub' });
      return c;
    }
  },

  s_rest: {
    chapter: '第一章 · 空积城',
    art: 'city',
    text: `城门边的客栈。一百文一晚，床板硬得能敲出声。

【系统】生命与法力已恢复。`,
    onEnter: S => { S.hp = 99999; S.mp = 99999; },
    choices: [{ label: '回广场', to: 's_hub' }]
  },

  s_death: {
    chapter: '—',
    art: 'night',
    text: `视野褪成灰色。

【系统】你已死亡。
【系统】3 秒后在最近的主城复活，损失 10% 银币。`,
    onEnter: S => { S.gold = Math.max(0, Math.floor(S.gold * 0.9)); S.hp = 99999; S.mp = 99999; },
    choices: [{ label: '复活', to: 's_hub' }]
  }
};

/* 副本场景 id 映射 */
const DUNGEON_SCENE = {
  qianbo: 's_dungeon_qb',
  baigu: 's_dungeon_baigu',
  bingshuang: 's_dungeon_bingshuang',
  shenzhi: 's_dungeon_shenzhi'
};
