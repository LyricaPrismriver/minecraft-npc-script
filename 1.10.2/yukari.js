var Thread = Java.type("java.lang.Thread");

var damage_invicible_time = 34;//伤害最低延迟游戏刻

function damaged(event){
    /*if(event.npc.getHealth() <= event.damage)
        event.setCanceled(true);
        */
    //event.source.jump();
    var world = event.npc.getWorld();
    var data = event.npc.getTempdata();
    //拥有无敌标记时无敌
    if(data.has("Invincible"))
        event.setCanceled(true);
    if(data.has("damage_invicible_time"))
    {//计算冷却的地方
        var cd = data.get("damage_invicible_time");
        if(cd <= world.getTotalTime())
            data.remove("damage_invicible_time");
    }
    if(data.has("damage_invicible_time"))
        event.setCanceled(true);
    else
    {

        var new_damage = event.damage;
        /*
        if(new_damage <= 10)
            event.setCanceled(true);
        else if(new_damage > 10)
            new_damage = new_damage * 0.5;
        event.damage = new_damage;
        */

        data.put("damage_invicible_time", world.getTotalTime() + damage_invicible_time);
    }
}