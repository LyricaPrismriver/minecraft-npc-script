var Thread = Java.type("java.lang.Thread");
//var npc = event.npc;
//var source = event.source;
//var data = event.npc.getTempdata();
//var damageSource = event.damageSource;

var source = event.getSource();
var damage = event.getDamage();

//preventDamage(event, 32);
if(damage > 10)
{
    damage = 10;
    event.setDamage(damage);
}

var health = npc.getHealth();
if(health > 700)
    atk_speed = 30;
else if(health > 400)
    atk_speed = 20;
else
    atk_speed = 15;
//拥有无敌标记时无敌
if(npc.hasTempData("Invincible"))
    event.setCancelled(true);
if(source)
{
    if(source.getType() == 1)
    {
        /*
        //针对拔刀剑
        if(damageSource)
        {
            if((damageSource.getType() == "directMagic" || damageSource.getType() == "mob")){
                doDamage(source, event.damage, event);
            }
        }
        */
        //伤害记录
        var damage_score = npc.getTempData("damage_score");
        if(!damage_score[source.getName()])
            damage_score[source.getName()] = event.damage;
        else
            damage_score[source.getName()] += event.damage;

        //如果有格挡标记则记住目标
        if(npc.hasTempData("yinian_block"))
        {
            npc.executeCommand("/playsound se.sword_hit music @p");
            npc.setTempData("yinian_block_target", source);
            npc.removeTempData("yinian_block");
            //控制目标
            var MyThread1 = Java.extend(Thread, { 
                run: function() { 
                    Hold(1, 20, source);
                } 
            }); 
            var th1 = new MyThread1(); 
            th1.start();
            event.setCancelled(true);
        }
    }
}


//控制目标
function Hold(time, frequency, entity)
{
    var x = entity.getX(), y = entity.getY(), z = entity.getZ();
    var piece = 1000 / frequency;
    for(var i = 0;i < time * frequency;i++)
    {
        entity.setPosition(x, y, z);
        Thread.sleep(piece);
    }
}