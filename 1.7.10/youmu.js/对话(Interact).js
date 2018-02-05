var damage_score = npc.getTempData("damage_score");
for(var player_name in damage_score)
{
    npc.say(player_name + "造成" + Math.ceil(damage_score[player_name]) + "点伤害");
}