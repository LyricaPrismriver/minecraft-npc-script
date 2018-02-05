//youmu.js是从1.10.2版本的customnpc脚本移植到1.7.10的customnpc的,所以会有许多注释
npc.setTempData("last_fight", world.getTotalTime());

var damage_score = new Object;
npc.setTempData("damage_score", damage_score);
npc.setTempData("count_ticks", 0);