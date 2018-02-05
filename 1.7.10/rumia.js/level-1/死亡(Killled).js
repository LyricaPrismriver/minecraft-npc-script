//死亡时生成二阶段
var x = npc.getX(),y = npc.getY(),z = npc.getZ();
//level-1,level-2,level-3分别保存为Rumia-一阶段 Rumia-二阶段 EX-Rumia-三阶段
world.spawnClone(x, y - 1, z, 6, "Rumia-二阶段");

npc.despawn();