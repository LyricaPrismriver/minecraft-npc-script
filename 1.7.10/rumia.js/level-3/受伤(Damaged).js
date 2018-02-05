//受伤
var source = event.getSource();
var damage = event.getDamage();
if(source&&damage)
{
    if(source.getType() == 1)
    {
        var damage_score = npc.getTempData("exrumia3_damage_score");
        if(!damage_score[source.getName()])
            damage_score[source.getName()] = event.damage;
        else
            damage_score[source.getName()] += event.damage;
    }
}