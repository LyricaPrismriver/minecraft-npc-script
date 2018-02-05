
//var npc = event.npc;
//var data = npc.getTempdata();
//var melee = npc.getStats().	getMelee();
var atk_speed = 20;//攻击速度
//连击
var double_hit_percent = 0.3;
if(npc.hasTempData("double_hit"))
{
    var double_hit_count = npc.getTempData("double_hit");
    if(double_hit_count >= 1)
    {
        npc.removeTempData("double_hit");
        npc.setMeleeSpeed(20);
        //melee.setDelay(atk_speed);
    }
    else
        npc.setTempData("double_hit", double_hit_count+=1);

}else
{
    npc.setTempData("double_hit", 0)
    npc.setMeleeSpeed(2);
}

if(npc.hasTempData("no_attack"))
    event.setCancelled(true);