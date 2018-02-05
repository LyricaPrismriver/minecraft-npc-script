//初始化
//最后一次战斗的时间
npc.setTempData("last_fight", world.getTotalTime());
//伤害统计
var damage_score = new Object;
npc.setTempData("exrumia2_damage_score", damage_score);
npc.setTempData("exrumia2_count_ticks", 0);//暂不使用