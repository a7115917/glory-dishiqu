/* ==========================================================================
   荣耀 · 第十区  —  职业表
   7 大派系 / 26 个可选职业 / 106 个技能
   --------------------------------------------------------------------------
   技能字段（时间单位 = tick，1 tick = 200ms）：
     cast  前摇：出手前的准备时间，此时被打中会被「打断」
     rec   后摇：收招硬直，此时是「破绽」，受到伤害 +45%
     cd    冷却：多少 tick 后才能再放
     power 伤害系数（%）
     util  辅助技，不参与连招链
   ========================================================================== */

const CLASSES = {

  /* ---------------------------------------------------------------- 散人 */
  sanren: {
    name: '散人', school: '散人', color: '#e8c25c', main: 'agi',
    role: '全能 · 自由连招', body: 'sanren', weapon: { t: 'umbrella' },
    base: { str: 6, agi: 7, int: 5, con: 5 },
    freeChain: true,
    desc: '二十四个职业，每个都学一点，也都不精。但连招可以把不同职业的招式串起来——没有固定套路，所以也没有人知道下一招是什么。前提是，你得记得住一百多个技能。\n技能库共 120 个低阶技能，战斗前自选 10 个装配。',
    skills: []
  },

  /* -------------------------------------------------------------- 剑士系 */
  jianke: {
    name: '剑客', school: '剑士系', color: '#63b7f0', main: 'str',
    role: '爆发 · 连招', body: 'sword', weapon: { t: 'blade', len: 74, w: 4.5 },
    base: { str: 7, agi: 6, int: 3, con: 5 },
    desc: '最正统的剑士。招式干净，输出连贯，没有任何花活。高手和菜鸟的差距，全在「快半拍」上。',
    skills: [
      { id: 'jk_moon', name: '银光落刃', mp: 8, cast: 2, rec: 3, cd: 16, power: 120, desc: '剑光斜落，一道银线。' },
      { id: 'jk_draw', name: '拔刀斩', mp: 12, cast: 2, rec: 3, cd: 26, power: 165, desc: '蓄力拔刀，破空而至。' },
      { id: 'jk_step', name: '剑影步', mp: 10, cast: 1, rec: 2, cd: 45, util: true, buff: { dodge: 30 }, desc: '身法虚化，闪避 +30%。' },
      { id: 'jk_phantom', name: '幻影无形剑', mp: 26, cast: 5, rec: 6, cd: 58, power: 295, pierce: 0.3, desc: '剑客的顶点，无形无相。' }
    ]
  },

  kuangjian: {
    name: '狂剑士', school: '剑士系', color: '#e0563f', main: 'str',
    role: '越残越强', body: 'sword', weapon: { t: 'blade', len: 82, w: 15 },
    base: { str: 9, agi: 4, int: 2, con: 7 },
    rage: true,
    desc: '大开大合，不讲章法。血量越低，伤害越高——残血的时候才是狂剑士真正开始的时候。',
    skills: [
      { id: 'kj_blood', name: '血气之刃', mp: 9, cast: 2, rec: 3, cd: 16, power: 125, desc: '刀身带血，越痛越快。' },
      { id: 'kj_crack', name: '崩山裂地斩', mp: 16, cast: 3, rec: 5, cd: 30, power: 180, desc: '砸地，地裂。' },
      { id: 'kj_rage', name: '暴走', mp: 14, cast: 1, rec: 2, cd: 50, util: true, buff: { power: 35 }, desc: '进入暴走，伤害 +35%。' },
      { id: 'kj_hell', name: '血魔·弑天', mp: 28, cast: 6, rec: 7, cd: 62, power: 310, selfDmg: 0.06, desc: '以血换血，自损 6%。' }
    ]
  },

  mojian: {
    name: '魔剑士', school: '剑士系', color: '#8f7cf0', main: 'int',
    role: '剑 + 法', body: 'sword', weapon: { t: 'blade', len: 72, w: 6, rune: true },
    base: { str: 6, agi: 4, int: 8, con: 4 },
    desc: '剑上带元素。近身是剑客，远一点是法师。两样都不极致，但两样都能用。',
    skills: [
      { id: 'mj_frost', name: '冰霜剑气', mp: 10, cast: 2, rec: 3, cd: 18, power: 130, scale: 'int', desc: '剑气凝霜，附带减速。' },
      { id: 'mj_ripple', name: '裂波斩', mp: 14, cast: 2, rec: 3, cd: 28, power: 170, scale: 'int', desc: '剑气成波，撕裂空气。' },
      { id: 'mj_mastery', name: '魔剑精通', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { power: 25 }, desc: '剑上附魔，伤害 +25%。' },
      { id: 'mj_storm', name: '剑气风暴', mp: 30, cast: 5, rec: 6, cd: 60, power: 300, scale: 'int', desc: '剑气成风，四散切割。' }
    ]
  },

  zhangui: {
    name: '鬼剑士·斩鬼', school: '剑士系', color: '#b04ae0', main: 'str',
    role: '鬼气 · 主 C', body: 'sword', weapon: { t: 'blade', len: 68, w: 5, curve: 14, glow: '#b04ae0' },
    base: { str: 8, agi: 6, int: 4, con: 5 },
    desc: '同一个鬼剑士，加点不同就是两个职业。斩鬼把鬼气全灌进刀里，一刀比一刀重——是纯粹的输出机器。',
    skills: [
      { id: 'zg_slash', name: '鬼斩', mp: 9, cast: 2, rec: 3, cd: 16, power: 130, desc: '刀上缠着鬼气。' },
      { id: 'zg_moon', name: '月光斩', mp: 13, cast: 2, rec: 3, cd: 26, power: 170, desc: '月牙形的刀光。' },
      { id: 'zg_shadow', name: '鬼影闪', mp: 11, cast: 1, rec: 2, cd: 45, util: true, buff: { dodge: 35 }, desc: '化影而行，闪避 +35%。' },
      { id: 'zg_kazan', name: '鬼神·卡赞', mp: 30, cast: 5, rec: 7, cd: 64, power: 320, desc: '请鬼神附身，一击定生死。' }
    ]
  },

  zhengui: {
    name: '鬼剑士·阵鬼', school: '剑士系', color: '#6ee0a8', main: 'int',
    role: '阵法 · 辅助', body: 'sword', weapon: { t: 'blade', len: 64, w: 4, curve: 8, glow: '#6ee0a8' },
    base: { str: 5, agi: 5, int: 8, con: 6 },
    desc: '同样是鬼剑士，阵鬼不挥刀，只布阵。鬼阵铺满地面的时候，敌人的每一步都在扣血。团战里的毒瘤，单刷时的慢刀子。',
    skills: [
      { id: 'zg2_frost', name: '冰霜鬼阵', mp: 10, cast: 2, rec: 3, cd: 20, power: 115, scale: 'int', desc: '阵内结霜，持续侵蚀。' },
      { id: 'zg2_erode', name: '侵蚀鬼阵', mp: 14, cast: 2, rec: 4, cd: 30, power: 155, scale: 'int', desc: '鬼气侵蚀，防御 -20%。' },
      { id: 'zg2_calm', name: '镇魂', mp: 12, cast: 1, rec: 2, cd: 45, util: true, heal: 0.12, desc: '镇魂安神，回复 12% 生命。' },
      { id: 'zg2_arr', name: '鬼神之阵', mp: 32, cast: 5, rec: 6, cd: 62, power: 285, scale: 'int', desc: '万鬼同阵，天地皆暗。' }
    ]
  },

  /* -------------------------------------------------------------- 法师系 */
  zhanfa: {
    name: '战斗法师', school: '法师系', color: '#ff8a3d', main: 'str',
    role: '近战法系', body: 'mage', weapon: { t: 'spear', len: 92 },
    base: { str: 7, agi: 6, int: 6, con: 5 },
    desc: '提着战矛冲进人堆里的法师。斗者意志攒满之后，一矛能把人捅穿——法师里最不像法师的那个。',
    skills: [
      { id: 'zf_dragon', name: '龙牙', mp: 8, cast: 2, rec: 3, cd: 14, power: 120, desc: '矛尖如龙牙，突刺。' },
      { id: 'zf_sky', name: '天击', mp: 9, cast: 1, rec: 3, cd: 20, power: 110, desc: '上挑，把人挑离地面。' },
      { id: 'zf_will', name: '斗者意志', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { power: 30 }, desc: '意志燃烧，伤害 +30%。' },
      { id: 'zf_dragon2', name: '怒龙穿心', mp: 28, cast: 5, rec: 6, cd: 58, power: 305, desc: '一矛贯穿，龙吟不止。' }
    ]
  },

  modao: {
    name: '魔道学者', school: '法师系', color: '#c8a13c', main: 'int',
    role: '道具 · 控场', body: 'mage', weapon: { t: 'broom', len: 78 },
    base: { str: 3, agi: 5, int: 9, con: 4 },
    desc: '一半是学者，一半是疯子。酸雨、烧瓶、反重力——魔道学者的战斗就是把实验室搬到战场上。',
    skills: [
      { id: 'md_ray', name: '魔法射线', mp: 8, cast: 2, rec: 3, cd: 14, power: 115, desc: '指尖射出一道紫光。' },
      { id: 'md_acid', name: '酸雨干冰', mp: 14, cast: 3, rec: 4, cd: 30, power: 165, desc: '酸雨倾泻，腐蚀护甲。' },
      { id: 'md_flask', name: '熔岩烧瓶', mp: 18, cast: 3, rec: 5, cd: 40, power: 200, desc: '砸碎烧瓶，岩浆四溅。' },
      { id: 'md_gravity', name: '万有引力', mp: 30, cast: 5, rec: 6, cd: 60, power: 300, desc: '改写重力，把人按进地里。' }
    ]
  },

  yuansu: {
    name: '元素法师', school: '法师系', color: '#b07cf0', main: 'int',
    role: '范围 · 爆发', body: 'mage', weapon: { t: 'orbstaff', len: 88 },
    base: { str: 3, agi: 4, int: 10, con: 4 },
    desc: '玻璃大炮。读条最长，伤害最高，血最少。站桩输出是它的极致，被人近身就是它的终点。',
    skills: [
      { id: 'ys_fire', name: '火球术', mp: 8, cast: 2, rec: 3, cd: 14, power: 125, desc: '最基础，也最实用。' },
      { id: 'ys_thunder', name: '雷电贯穿', mp: 16, cast: 3, rec: 4, cd: 30, power: 185, desc: '一道雷，从头顶劈下来。' },
      { id: 'ys_ice', name: '冰墙', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { guard: 45 }, desc: '冰墙护身，减伤 45%。' },
      { id: 'ys_skyfire', name: '天雷地火', mp: 34, cast: 6, rec: 6, cd: 66, power: 340, desc: '天地之间只剩火与雷。' }
    ]
  },

  zhaohuan: {
    name: '召唤师', school: '法师系', color: '#4ad0c0', main: 'int',
    role: '召唤 · 消耗', body: 'mage', weapon: { t: 'orbstaff', len: 82, orb: '#4ad0c0' },
    base: { str: 3, agi: 4, int: 9, con: 6 },
    desc: '自己不动手。哥布林、冰晶精灵、精灵王——召唤师打的是耐心，等你被耗死的时候，他还站在原地。',
    skills: [
      { id: 'zh_goblin', name: '召唤·哥布林', mp: 8, cast: 2, rec: 3, cd: 16, power: 110, desc: '一只哥布林扑上去咬。' },
      { id: 'zh_ice', name: '召唤·冰晶精灵', mp: 14, cast: 3, rec: 4, cd: 30, power: 160, desc: '冰晶炸开，寒气刺骨。' },
      { id: 'zh_sacrifice', name: '精灵献祭', mp: 12, cast: 1, rec: 2, cd: 45, util: true, heal: 0.15, desc: '献祭精灵，回复 15% 生命。' },
      { id: 'zh_king', name: '召唤·精灵王', mp: 32, cast: 6, rec: 7, cd: 68, power: 320, desc: '精灵王降临，天地变色。' }
    ]
  },

  /* -------------------------------------------------------------- 枪手系 */
  shenqiang: {
    name: '神枪手', school: '枪手系', color: '#6fe0d0', main: 'agi',
    role: '远程 · 点射', body: 'gun', weapon: { t: 'pistols' },
    base: { str: 4, agi: 9, int: 4, con: 4 },
    desc: '枪系的天花板，也是最吃手速的职业。走位、点射、拉枪线——真正的高手，很少让人近得了身。',
    skills: [
      { id: 'sq_slide', name: '滑铲', mp: 6, cast: 1, rec: 3, cd: 14, power: 110, desc: '低身滑出，抬枪就打。' },
      { id: 'sq_stomp', name: '踏射', mp: 10, cast: 2, rec: 3, cd: 24, power: 155, desc: '踩踏后仰，贴脸一枪。' },
      { id: 'sq_wild', name: '乱射', mp: 18, cast: 2, rec: 5, cd: 42, power: 75, hits: 4, desc: '四连点射，压得人抬不起头。' },
      { id: 'sq_barrett', name: '巴雷特狙击', mp: 30, cast: 5, rec: 7, cd: 62, power: 340, pierce: 0.25, desc: '一枪，穿过一切。' }
    ]
  },

  danyao: {
    name: '弹药专家', school: '枪手系', color: '#e0a04a', main: 'agi',
    role: '属性弹 · 控场', body: 'gun', weapon: { t: 'pistols', grenade: true },
    base: { str: 4, agi: 7, int: 6, con: 5 },
    desc: '打的不只是子弹，是效果。冰冻、感电、燃烧——弹药专家不在乎伤害数字，在乎的是你接下来几秒还能不能动。',
    skills: [
      { id: 'dy_ice', name: '冰冻弹', mp: 8, cast: 1, rec: 3, cd: 18, power: 115, desc: '命中减速，寒气入骨。' },
      { id: 'dy_shock', name: '感电手雷', mp: 14, cast: 2, rec: 4, cd: 30, power: 165, desc: '感电，持续掉血。' },
      { id: 'dy_burn', name: '燃烧弹', mp: 16, cast: 3, rec: 4, cd: 38, power: 190, desc: '燃烧，火舌舔上护甲。' },
      { id: 'dy_barrage', name: '弹幕轰炸', mp: 30, cast: 5, rec: 6, cd: 62, power: 300, hits: 3, desc: '弹幕覆盖，无处可躲。' }
    ]
  },

  jixie: {
    name: '机械师', school: '枪手系', color: '#7fc0e0', main: 'int',
    role: '机械 · 布置', body: 'gun', weapon: { t: 'gadget' },
    base: { str: 3, agi: 6, int: 8, con: 5 },
    desc: '一个人就是一支军队。飞爪、炮台、空投、机械军团——机械师打的是布局，你打的是他布好的局。',
    skills: [
      { id: 'jx_claw', name: '机械飞爪', mp: 8, cast: 1, rec: 3, cd: 16, power: 110, desc: '飞爪抓取，拉近距离。' },
      { id: 'jx_cannon', name: '毒蛇炮', mp: 14, cast: 2, rec: 4, cd: 30, power: 160, desc: '架起炮台，自动开火。' },
      { id: 'jx_supply', name: '空投支援', mp: 12, cast: 1, rec: 2, cd: 45, util: true, heal: 0.1, buff: { guard: 25 }, desc: '空投补给，回血减伤。' },
      { id: 'jx_army', name: '机械军团', mp: 32, cast: 5, rec: 6, cd: 64, power: 300, hits: 2, desc: '机械倾巢而出。' }
    ]
  },

  qiangpao: {
    name: '枪炮师', school: '枪手系', color: '#e0605a', main: 'str',
    role: '重火器 · 压制', body: 'gun', weapon: { t: 'cannon' },
    base: { str: 7, agi: 4, int: 5, con: 7 },
    desc: '枪炮师不瞄准，枪炮师覆盖。喷火器、榴弹、激光、卫星——它的词典里没有「精准」这个词。',
    skills: [
      { id: 'qp_flame', name: '聚焦喷火器', mp: 10, cast: 2, rec: 4, cd: 20, power: 130, desc: '烈焰持续喷射。' },
      { id: 'qp_grenade', name: '榴弹炮', mp: 14, cast: 3, rec: 4, cd: 32, power: 175, desc: '榴弹落地，爆开一片。' },
      { id: 'qp_guard', name: '重甲戒备', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { guard: 40 }, desc: '架起重甲，减伤 40%。' },
      { id: 'qp_laser', name: '卫星射线', mp: 34, cast: 6, rec: 7, cd: 68, power: 330, desc: '天上一道白光，地上没了。' }
    ]
  },

  /* -------------------------------------------------------------- 格斗系 */
  quanfa: {
    name: '拳法家', school: '格斗系', color: '#e8834a', main: 'str',
    role: '贴身 · 硬直', body: 'fighter', weapon: { t: 'fists' },
    base: { str: 8, agi: 5, int: 2, con: 8 },
    desc: '拳脚就是武器。近身之后一套连招能把人打得站不起来——前提是你能贴上去。',
    skills: [
      { id: 'qf_crash', name: '崩山击', mp: 8, cast: 2, rec: 3, cd: 16, power: 135, desc: '一记直拳，砸在胸口。' },
      { id: 'qf_eagle', name: '鹰踏', mp: 10, cast: 2, rec: 3, cd: 24, power: 95, hits: 2, desc: '连环两段，脚脚到肉。' },
      { id: 'qf_whirl', name: '旋风腿', mp: 14, cast: 3, rec: 4, cd: 34, power: 165, desc: '旋身扫堂，扫倒一片。' },
      { id: 'qf_emperor', name: '霸皇拳', mp: 30, cast: 5, rec: 7, cd: 62, power: 315, desc: '一拳下去，空气都在响。' }
    ]
  },

  liumang: {
    name: '流氓', school: '格斗系', color: '#c0b060', main: 'str',
    role: '阴招 · 干扰', body: 'fighter', weapon: { t: 'brick' },
    base: { str: 8, agi: 7, int: 2, con: 6 },
    desc: '板砖、沙土、勾拳、毒针。流氓没有武德，只有胜负。看不起它的人，通常都被一块砖拍在脸上。',
    skills: [
      { id: 'lm_brick', name: '板砖', mp: 6, cast: 1, rec: 3, cd: 14, power: 120, desc: '一块砖，糊脸。' },
      { id: 'lm_sand', name: '抛沙', mp: 8, cast: 1, rec: 2, cd: 22, power: 90, desc: '一把沙子，迷眼。打断效果极强。' },
      { id: 'lm_hook', name: '勾拳', mp: 14, cast: 2, rec: 4, cd: 32, power: 170, desc: '从下往上，勾下巴。' },
      { id: 'lm_street', name: '街头风暴', mp: 28, cast: 5, rec: 6, cd: 60, power: 300, hits: 2, desc: '抄起什么砸什么。' }
    ]
  },

  roudao: {
    name: '柔道', school: '格斗系', color: '#6a90e0', main: 'str',
    role: '抓取 · 投技', body: 'fighter', weapon: { t: 'fists' },
    base: { str: 8, agi: 5, int: 3, con: 8 },
    desc: '不挥拳，只借力。抓、摔、抛、绞——柔道的每一招都来自对手自己的力量。',
    skills: [
      { id: 'rd_throw', name: '背摔', mp: 9, cast: 2, rec: 3, cd: 18, power: 130, desc: '抓腕，过肩，砸地。' },
      { id: 'rd_toss', name: '抛投', mp: 12, cast: 2, rec: 4, cd: 28, power: 165, desc: '连人带甲抛出去。' },
      { id: 'rd_neck', name: '折颈', mp: 11, cast: 1, rec: 2, cd: 40, util: true, stun: 2, desc: '锁喉折颈，硬直 2 拍。' },
      { id: 'rd_comet', name: '螺旋彗星落', mp: 30, cast: 6, rec: 6, cd: 64, power: 320, desc: '抱住对手从空中砸落。' }
    ]
  },

  qigong: {
    name: '气功师', school: '格斗系', color: '#4fe3c8', main: 'int',
    role: '念气 · 中距离', body: 'fighter', weapon: { t: 'qiorb' },
    base: { str: 5, agi: 6, int: 8, con: 6 },
    desc: '把气推到体外，化成拳、化成罩、化成龙。气功师是格斗系里唯一一个能站在中距离打人的。',
    skills: [
      { id: 'qg_wave', name: '念气波', mp: 8, cast: 2, rec: 3, cd: 14, power: 120, desc: '一团念气推出，空气都在抖。' },
      { id: 'qg_shield', name: '念气罩', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { guard: 45 }, desc: '念气护体，减伤 45%。' },
      { id: 'qg_thunder', name: '雷霆万钧', mp: 16, cast: 3, rec: 4, cd: 32, power: 180, desc: '雷霆落下，范围击退。' },
      { id: 'qg_dragon', name: '念龙波', mp: 30, cast: 5, rec: 6, cd: 60, power: 305, desc: '念气化龙，一往无前。' }
    ]
  },

  /* -------------------------------------------------------------- 暗夜系 */
  renzhe: {
    name: '忍者', school: '暗夜系', color: '#d05a8a', main: 'agi',
    role: '忍术 · 爆发', body: 'night', weapon: { t: 'kunai' },
    base: { str: 5, agi: 9, int: 5, con: 4 },
    desc: '手里剑、影分身、火遁雷遁。忍者打的是「看不见」——你打中的那个，通常只是分身。',
    skills: [
      { id: 'rz_shuriken', name: '手里剑', mp: 6, cast: 1, rec: 2, cd: 12, power: 105, desc: '一枚手里剑，划破空气。' },
      { id: 'rz_clone', name: '影分身', mp: 10, cast: 1, rec: 2, cd: 40, util: true, buff: { dodge: 45 }, desc: '分出残影，闪避 +45%。' },
      { id: 'rz_fire', name: '火遁·火龙炎弹', mp: 16, cast: 3, rec: 4, cd: 32, power: 185, desc: '一条火龙，贴地而来。' },
      { id: 'rz_thunder', name: '雷遁·雷虎', mp: 30, cast: 5, rec: 6, cd: 62, power: 315, desc: '雷虎扑出，天地皆白。' }
    ]
  },

  daozei: {
    name: '盗贼', school: '暗夜系', color: '#90c04a', main: 'agi',
    role: '陷阱 · 偷取', body: 'night', weapon: { t: 'kunai' },
    base: { str: 5, agi: 8, int: 5, con: 5 },
    desc: '盗贼不跟你正面打。布好陷阱，撒上毒，扔个烟雾弹，然后从背后把东西拿走。',
    skills: [
      { id: 'dz_poison', name: '毒刃', mp: 7, cast: 1, rec: 2, cd: 14, power: 110, desc: '刀上淬毒，持续掉血。' },
      { id: 'dz_smoke', name: '烟雾弹', mp: 9, cast: 1, rec: 2, cd: 38, util: true, buff: { dodge: 40 }, desc: '一团烟，人影全无。' },
      { id: 'dz_trap', name: '爆炎陷阱', mp: 15, cast: 2, rec: 4, cd: 34, power: 190, desc: '埋好了，就等你踩。' },
      { id: 'dz_steal', name: '偷天换日', mp: 28, cast: 4, rec: 6, cd: 60, power: 300, desc: '一击得手，顺走一件。' }
    ]
  },

  cike: {
    name: '刺客', school: '暗夜系', color: '#e0557a', main: 'agi',
    role: '暴击 · 收割', body: 'night', weapon: { t: 'daggers' },
    base: { str: 5, agi: 10, int: 3, con: 4 },
    desc: '要么一套秒人，要么一套之后自己躺下。玩刺客的人多少有点赌性。',
    skills: [
      { id: 'ck_arc', name: '弧光闪', mp: 7, cast: 1, rec: 2, cd: 12, power: 115, desc: '一道弧光，快得看不见。' },
      { id: 'ck_throat', name: '割喉', mp: 13, cast: 2, rec: 3, cd: 26, power: 165, crit: 25, desc: '暴击率 +25%。' },
      { id: 'ck_blink', name: '瞬身', mp: 10, cast: 1, rec: 2, cd: 40, util: true, buff: { dodge: 45 }, desc: '瞬移，闪避 +45%。' },
      { id: 'ck_trade', name: '舍命一击', mp: 26, cast: 4, rec: 6, cd: 58, power: 350, selfDmg: 0.08, desc: '自损 8%，换 350% 的一击。' }
    ]
  },

  shushi: {
    name: '术士', school: '暗夜系', color: '#9050d0', main: 'int',
    role: '诅咒 · 吸蚀', body: 'night', weapon: { t: 'curseorb' },
    base: { str: 3, agi: 5, int: 9, con: 6 },
    desc: '术士不打你，术士诅咒你。等你发现血条在掉的时候，诅咒已经叠了三层。',
    skills: [
      { id: 'ss_arrow', name: '暗影箭', mp: 8, cast: 2, rec: 3, cd: 14, power: 120, desc: '一支黑箭，无声无息。' },
      { id: 'ss_bind', name: '死亡缠绕', mp: 14, cast: 2, rec: 3, cd: 28, power: 160, desc: '黑藤缠身，吸取生命。' },
      { id: 'ss_fear', name: '恐惧术', mp: 12, cast: 1, rec: 2, cd: 44, util: true, stun: 2, desc: '恐惧，硬直 2 拍。' },
      { id: 'ss_curse', name: '血之诅咒', mp: 32, cast: 5, rec: 6, cd: 64, power: 310, desc: '血咒缠身，无处可逃。' }
    ]
  },

  /* -------------------------------------------------------------- 圣职系 */
  mushi: {
    name: '牧师', school: '圣职系', color: '#e8e0b0', main: 'int',
    role: '治疗 · 续航', body: 'holy', weapon: { t: 'holystaff' },
    base: { str: 3, agi: 4, int: 9, con: 7 },
    desc: '输出最弱的职业之一，但没有牧师的一方，通常活不到最后。',
    skills: [
      { id: 'ms_bolt', name: '圣光弹', mp: 7, cast: 2, rec: 3, cd: 14, power: 110, desc: '一团柔和的圣光。' },
      { id: 'ms_heal', name: '治疗术', mp: 12, cast: 2, rec: 3, cd: 40, util: true, heal: 0.22, desc: '回复 22% 生命。' },
      { id: 'ms_purify', name: '净化之光', mp: 10, cast: 1, rec: 2, cd: 46, util: true, buff: { guard: 35 }, heal: 0.08, desc: '净化，减伤并回血。' },
      { id: 'ms_pray', name: '神圣祈祷', mp: 26, cast: 5, rec: 6, cd: 62, power: 240, heal: 0.15, desc: '圣光降临，伤害并回复 15%。' }
    ]
  },

  qishi: {
    name: '骑士', school: '圣职系', color: '#e8c25c', main: 'con',
    role: '坦克 · 冲锋', body: 'holy', weapon: { t: 'shieldsword' },
    base: { str: 6, agi: 4, int: 4, con: 10 },
    desc: '最厚的那堵墙。血最多、防最高、最能扛——但别指望它快速解决战斗。',
    skills: [
      { id: 'qs_charge', name: '冲锋', mp: 8, cast: 1, rec: 3, cd: 18, power: 120, desc: '顶盾冲撞，撞开一条路。' },
      { id: 'qs_bash', name: '盾击', mp: 12, cast: 2, rec: 3, cd: 28, power: 160, desc: '盾面拍脸，附带硬直。' },
      { id: 'qs_oath', name: '守护誓约', mp: 12, cast: 1, rec: 2, cd: 45, util: true, buff: { guard: 50 }, desc: '誓约护体，减伤 50%。' },
      { id: 'qs_cross', name: '圣光十字斩', mp: 28, cast: 5, rec: 6, cd: 60, power: 300, desc: '十字圣光，劈开前方。' }
    ]
  },

  shouhu: {
    name: '守护天使', school: '圣职系', color: '#a8d8ff', main: 'int',
    role: '护盾 · 复活', body: 'holy', weapon: { t: 'wings' },
    base: { str: 3, agi: 5, int: 9, con: 7 },
    desc: '整个荣耀里唯一能让人「再站起来一次」的职业。它自己打不死人，但它能让队友不死。',
    skills: [
      { id: 'sh_wing', name: '天使之翼', mp: 10, cast: 2, rec: 3, cd: 22, power: 115, desc: '羽翼展开，光刃扫过。' },
      { id: 'sh_shield', name: '圣光庇护', mp: 12, cast: 1, rec: 2, cd: 40, util: true, buff: { guard: 55 }, desc: '圣光庇护，减伤 55%。' },
      { id: 'sh_song', name: '净化圣歌', mp: 14, cast: 2, rec: 3, cd: 46, util: true, heal: 0.25, desc: '圣歌，回复 25% 生命。' },
      { id: 'sh_revive', name: '神圣复苏', mp: 32, cast: 5, rec: 6, cd: 70, power: 250, heal: 0.3, desc: '圣光重生，回复 30%。' }
    ]
  },

  qumo: {
    name: '驱魔师', school: '圣职系', color: '#e07050', main: 'int',
    role: '符咒 · 退魔', body: 'holy', weapon: { t: 'talisman' },
    base: { str: 4, agi: 6, int: 8, con: 6 },
    desc: '画符、念咒、请式神。驱魔师打的是「退治」——专克鬼剑士这一类带着鬼气的东西。',
    skills: [
      { id: 'qm_fu', name: '驱魔符', mp: 8, cast: 1, rec: 3, cd: 14, power: 115, desc: '一张黄符贴上去，烧穿。' },
      { id: 'qm_thunder', name: '落雷符', mp: 14, cast: 2, rec: 4, cd: 30, power: 170, desc: '符纸引雷，当头劈下。' },
      { id: 'qm_shiki', name: '式神·白虎', mp: 18, cast: 3, rec: 4, cd: 38, power: 195, desc: '白虎式神，扑杀。' },
      { id: 'qm_five', name: '五雷正法', mp: 32, cast: 5, rec: 6, cd: 64, power: 320, desc: '五雷齐落，邪祟尽散。' }
    ]
  }
};

/* ---------------------------------------------------------------- 索引 */
const SKILLS = {};
const SCHOOLS = ['散人', '剑士系', '法师系', '枪手系', '格斗系', '暗夜系', '圣职系'];

Object.keys(CLASSES).forEach(cid => {
  const c = CLASSES[cid];
  c.id = cid;
  c.skillIds = c.skills.map(s => s.id);
  c.chain = c.freeChain ? [] : c.skills.filter(s => !s.util).map(s => s.id);
  c.skills.forEach(s => {
    SKILLS[s.id] = Object.assign({ cls: cid, color: c.color, owner: c.name }, s);
    SKILLS[s.id].school = s.school2 || c.school;
  });
});

function classList(school) {
  return Object.keys(CLASSES).filter(k => !school || CLASSES[k].school === school);
}
