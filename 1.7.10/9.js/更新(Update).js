var Thread = Java.type("java.lang.Thread");

var perfect_freeze_cooldown = 20;//冷却时间,单位秒


if(npc.hasTempData("perfect_freeze_cooldown"))
{
    var cd = npc.getTempData("perfect_freeze_cooldown");
    cd -= 10;
    var entities = npc.getSurroundingEntities(20, 1);
    if(entities.length >= 3 && npc.isAttacking() && cd <= 0)
    {
        
        cd = perfect_freeze_cooldown * 20;
        // 带有run方法的子类
        var MyThread = Java.extend(Thread, { 
            run: function() { 
                perfect_freeze(10, 10, 2, 3.5);//次数, 冰爆生成半径, 冰爆最小半径, 冰爆最大半径
            } 
        }); 
        var th = new MyThread(); 
        th.start(); 
        //th.join();
        //perfect_freeze(10, 10, 2, 3.5);//次数, 冰爆生成半径, 冰爆最小半径, 冰爆最大半径
    }
    npc.setTempData("perfect_freeze_cooldown", cd);
}
else
    npc.setTempData("perfect_freeze_cooldown", perfect_freeze_cooldown * 20);


//完美冻结,times为次数, r为冰爆生成半径, min_r冰爆最小半径, max_r冰爆最大半径
function perfect_freeze(times, r, min_r, max_r)
{
    npc.say("完");Thread.sleep(500);
    npc.say("美");Thread.sleep(500);
    npc.say("冻");Thread.sleep(500);
    npc.say("结");Thread.sleep(500);
    for(var t = 0;t < times;t++)
    {
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var rad = 2 * 3.1416 * Math.random();//随机角度
        var new_x = x + (r * Math.sin(rad) * Math.random());//圆内随机x坐标
        var new_z = z + (r * Math.cos(rad) * Math.random());//圆内随机z坐标
        var new_r = min_r + (Math.random() * (max_r - min_r));//圆环随机最大半径
        for(var i = 0;i < (new_r * 15);i++)//new_r * 15为圆环生成总数
        {
            var circle_r = (0.025 * i) * (1 + (0.02 * i));//前半段为初速度/10ms,后半段为加速度/10ms
            drawCircle(new_x, y + 0.5, new_z, circle_r, 20);
            Thread.sleep(10);
        }
        var players = getNearbyPlayer(new_x, y, new_z, new_r);
        for(var i in players)
        {
            players[i].addPotionEffect(2, 5, 100, true);
            players[i].addPotionEffect(4, 5, 100, true);
            players[i].addPotionEffect(8, 5, 200, true);
            players[i].addPotionEffect(18, 5, 100, true);
        }
    }
}
//画圆环,用于生成冰爆
function drawCircle(x, y, z, r, density)
{
    if(r < 0)
        return;
    var PI = 2 * 3.1416;
    //var PI = 3.1416 / 6;
    density = density * r;
    var piece = PI / density;
    for(var i = 0;i < PI;i += piece)
    {
        var new_x = x + (r * Math.cos(i));
        var new_z = z + (r * Math.sin(i));
        world.spawnParticle("snowshovel", new_x, y, new_z, 0, 0, 0, 0.1, 1);
    }
}
//根据点找到最近的玩家
function getNearbyPlayer(x, y, z, range) {
    var players = [];
    var entities = npc.getSurroundingEntities(25, 1);
    for(var i in entities) {
        var dx = entities[i].getX() - x;
        var dy = entities[i].getY() - y;
        var dz = entities[i].getZ() - z;
        if (Math.sqrt((dx * dx) + (dy * dy) + (dz * dz)) <= range) {
            players.push(entities[i]);
        }
    }
    return players;
}
