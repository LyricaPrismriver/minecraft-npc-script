//初始化
if(!npc.hasTempData("last_fight"))
    npc.setTempData("last_fight", world.getTotalTime());
var damage_score = new Object;
npc.setTempData("exrumia3_damage_score", damage_score);
npc.setTempData("exrumia3_count_ticks", 0);