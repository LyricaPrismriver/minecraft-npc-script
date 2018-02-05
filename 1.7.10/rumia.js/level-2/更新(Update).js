//更新
var Thread = Java.type("java.lang.Thread");
var x = npc.getX(),y = npc.getY(),z = npc.getZ();
//(不卡的)环绕特效
var Myparticals = Java.extend(Thread, { 
    run: function() { 
        for(var i = 0;i < 5;i++)
        {
            world.spawnParticle("reddust", x, y + 1, z, 0.3, 0.5, 0.3, 0, 1);
            Thread.sleep(100);
        }
    } 
}); 
var particals = new Myparticals(); 
particals.start(); 

var max_return_timeout = 120;//非战斗状态回到一阶段的时间,单位秒
if(npc.isAttacking())
{
    npc.setTempData("last_fight", world.getTotalTime());
}else
{
    var last_fight = npc.getTempData("last_fight");
    //超过时间变回一阶段
    if(last_fight + (20 * max_return_timeout) <= world.getTotalTime())
    {
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        world.spawnClone(x, y - 1, z, 6, "Rumia-一阶段");//Rumia-一阶段 Rumia-二阶段 EX-Rumia-三阶段
    
        npc.despawn();
    }
}