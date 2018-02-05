var Thread = Java.type("java.lang.Thread");
var tenshi_maxhealth = 1000000;
var tenshi_damage_modifier = 0.01;

function init(event)
{
    var data = event.npc.getTempdata();
    var damage_score = new Object;
    /*
    if(data.has("mirai_cooldown"))
        data.remove("mirai_cooldown")
    if(data.has("chengfo_cooldown"))
        data.remove("chengfo_cooldown")
    if(data.has("xianshi_cooldown"))
        data.remove("xianshi_cooldown")
    if(data.has("is_busy"))
        data.remove("is_busy")
    */
    data.put("health", tenshi_maxhealth);
    data.put("damage_score", damage_score);
    data.put("count_ticks", 0);
}

function damaged(event){
    /*if(event.npc.getHealth() <= event.damage)
        event.setCanceled(true);
        */
    //event.source.jump();
    
    var source = event.source;
    var data = event.npc.getTempdata();
    var isInvalid = false;
    //拥有无敌标记时无敌
    if(data.has("Invincible"))
        event.setCanceled(true);
    preventDamage(event, 32);
    event.damage = hurt(event.damage, event);
    if(source)
    {
        //伤害记录
        var damage_score = data.get("damage_score");
        if(!damage_score[source.getName()])
            damage_score[source.getName()] = event.damage;
        else
            damage_score[source.getName()] += event.damage;
    }

}
function interact(event)
{
	//event.npc.say("当前血量:" + (event.npc.getHealth() / tenshi_damage_modifier));
}

function tick(event)
{
    var npc = event.npc;
    var loss_health = npc.getMaxHealth() - npc.getHealth();
    if(npc.isAlive())
        regen(loss_health * 0.001, event);
}

function meleeAttack(event)
{
}
function died(event)
{
    var world = event.npc.getWorld();
    var data = event.npc.getTempdata();
    var damage_score = data.get("damage_score");
    var tmp_dic = new Object;
    var sort_list = new Array();
    for(var player_name in damage_score)
    {
        tmp_dic[damage_score[player_name]] = player_name;
        sort_list.push(damage_score[player_name]);
    }
    sort_list.sort(sort_DESC);

    world.broadcast(event.npc.getDisplay().getName() + "击杀成功,伤害排名如下");
    for(var i = 0;i < sort_list.length;i++)
    {
        var rank = i + 1;
        world.broadcast(rank + "." + tmp_dic[sort_list[i]] + "共造成" + Math.ceil(sort_list[i]) + "点伤害");
        var player = world.getPlayer(tmp_dic[sort_list[i]]);
        if(player)
        {
            player.setExpLevel(player.getExpLevel() + Math.ceil(sort_list[i] / 10000));
            world.broadcast("奖励" + tmp_dic[sort_list[i]] + "共" + Math.ceil(sort_list[i] / 10000) + "等级");

        }else
            world.broadcast("玩家" + tmp_dic[sort_list[i]] + "不在线");
    }

}
//统计伤害排序
function sort_DESC(a, b)
{
    return b - a;
}
//恢复生命
function regen(hp, event)
{
    var npc = event.npc;
    var new_hp = npc.getHealth() + hp;
    var max_hp = npc.getMaxHealth();
    if(new_hp >= max_hp&&npc.isAlive())
        new_hp = max_hp;
    npc.setHealth(new_hp);

}
function hurt(damage, event)
{
    var new_damage = damage;
    if(new_damage <= 10)
        event.setCanceled(true);
    else if(new_damage > 10)
        new_damage = new_damage * 0.5;
        /*
    if(new_damage > 100)
        new_damage = 100;
        */
    return new_damage;// * tenshi_damage_modifier;
}

//防止来源已死亡或太远的伤害
function preventDamage(event, distance)
{
    var npc = event.npc;
    var world = npc.getWorld();
    var source = event.source;
    var target = npc.getAttackTarget();
    
    if(source)
    {
        if(!source.isAlive())
        {
            event.setCanceled(true);
            return;
        }
    }
    if(target)
    {
        if(!target.isAlive())
        {
            event.setCanceled(true);
            return;
        }
    }
    if(!source)
    {
        event.setCanceled(true);
        return;
    }
    var raw_entities = world.getNearbyEntities(npc.getX(),npc.getY(), npc.getZ(), distance, 1);
    if(raw_entities.length == 0)
        event.setCanceled(true);
    //return false;
    
}