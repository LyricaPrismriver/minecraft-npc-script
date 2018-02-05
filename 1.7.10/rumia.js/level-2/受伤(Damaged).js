//受伤
var source = event.getSource();
var damage = event.getDamage();
if(source&&damage)//是否有伤害来源
{
    if(source.getType() == 1)//伤害来源为玩家时统计伤害
    {
        var damage_score = npc.getTempData("exrumia2_damage_score");
        if(!damage_score[source.getName()])
            damage_score[source.getName()] = event.damage;
        else
            damage_score[source.getName()] += event.damage;
    }
}
