//攻击
var Thread = Java.type("java.lang.Thread");
//仅远程攻击时触发
if(!npc.hasTempData("atk_ball_cooldown")&&event.isRange())
{
    //var atk_ball_cooldown = 1;//冷却时间,单位秒
    //var spell_latency = 1500;
    var x = npc.getX(),y = npc.getY(),z = npc.getZ();
    var target = npc.getAttackTarget();
    var x2 = target.getX(),y2 = target.getY(),z2 = target.getZ();
    //第一列
    var MyThread1 = Java.extend(Thread, { 
        run: function() { 
            drawLine(x, y + 0.5, z, x2, y2 + 0.5, z2, 2, 1.5);
        } 
    }); 

    var th1 = new MyThread1(); 
    th1.start(); 

    //npc.setTempData("atk_ball_cooldown", world.getTotalTime() + atk_ball_cooldown * 20);//冷却标志
    event.setCancelled(true);//取消原远程攻击事件
}

//暴击
var old_dmg = event.getDamage();
var mul = 1.5;
var crt_percent = 0.3;
if(Math.random() <= crt_percent)
    event.setDamage(old_dmg*mul);

//基于两点生成线的方法
//x1,y1,z1起始点坐标
//x2,y2,z2终点坐标
//线密度,每单位坐标执行density次
//线额外长度,原长度*overlength
function drawLine(x1, y1, z1, x2, y2, z2, density, overlength)
{
    var ball_r = 1;
    var min_length = 12;
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    if(l < min_length)
    {
        l = min_length;
    }
    //执行部分
    for(var i = piece;i <= (l * overlength);i+=piece)
    {
        var new_x = x1 + (ax * i);
        var new_y = y1 + (ay * i);
        var new_z = z1 + (az * i);
        //在生成线上坐标执行的方法
        drawBall(new_x, new_y, new_z, ball_r, 7);
        var players = getNearbyPlayer(new_x, new_y, new_z, ball_r+0.5);
        if(players.length != 0)
        {
            //爆炸特效
            dynamicBall(new_x + (0.5 * ax), new_y + (0.5 * ay), new_z + (0.5 * az), 2.5);
            break;
        }
        Thread.sleep(30);
        //dynamicBall(new_x, new_y, new_z, ball_r);
        
    }
}
//球形爆炸特效
function dynamicBall(x, y, z, max_r)
{
    var damage = 0.9;//每次伤害
    var piece = 1 / 3 / 4;
    var max_ratio = Math.sqrt(max_r);
    world.explode(x, y, z, 0, false, false);
    
    for(var t = 0.7;t < max_ratio;t+=piece)
    {
        var r = t * t;//扩散速度为r^2
        //max_r * 10 = t max_r = t / 10
        drawBall(x, y, z, r, r * 5);
        //drawCircle(x, y, z, r, 10)
        Thread.sleep(30);
        var players = getNearbyPlayer(x, y, z, r+0.2);
        for(var j in players)
        {
            doDamage(players[j], damage);
        }
    }
}
//画圆形
function drawCircle(x, y, z, r, density)
{
    var PI = 2 * 3.1416;
    var piece = PI / density;
    //var density = density * r;
    for(var i = 0;i < PI;i += piece)
    {
        var rad = i;
        var new_x = x + (r * Math.cos(rad));
        var new_z = z + (r * Math.sin(rad));
        world.spawnParticle("reddust", new_x, y, new_z, 0.2, 0.2, 0.2, 0, 2);
    }
}
//画球
function drawBall(x, y, z, r, density)
{
    var PI = 3.1416;
    var d = r * density;
    var piece = r / d;
    for(var h = 0;h < r;h += piece)
    {
        var cos = h / r;
        var sin = Math.sqrt(1 - (cos * cos));
        drawCircle(x, y + h, z, r * sin, density);
    }
    
    for(var h = 0;h < r;h += piece)
    {
        var cos = h / r;
        var sin = Math.sqrt(1 - (cos * cos));
        drawCircle(x, y - h, z, r * sin, density);
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
//造成真实伤害
function doDamage(player, damage)
{
    if(player.isAlive())
    {
        var health = player.getHealth();
        var new_health = health - damage;
        if(new_health <= 1)
        {
            npc.executeCommand("/kill " + player.getName());
        }
        else
            player.setHealth(new_health);
    }
}