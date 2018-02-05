//更新
var Thread = Java.type("java.lang.Thread");

var cross_blast_cooldown = 20;//冷却时间,单位秒
var spell_latency = 1500;//宣言后释放延时
var x = npc.getX(),y = npc.getY(),z = npc.getZ();


//特效
var Myparticals = Java.extend(Thread, { 
    run: function() { 
        for(var i = 0;i < 10;i++)
        {
            world.spawnParticle("reddust", x, y + 1, z, 0.6, 0.6, 0.6, 0, 1);
            Thread.sleep(50);
        }
    } 
}); 
var particals = new Myparticals(); 
particals.start(); 

var max_return_timeout = 180;//非战斗状态回到一阶段的时间,单位秒
if(npc.isAttacking())
{
    npc.setTempData("last_fight", world.getTotalTime());
}else if(npc.isAlive())
{
    var last_fight = npc.getTempData("last_fight");
    if(last_fight + (20 * max_return_timeout) <= world.getTotalTime())
    {
        world.spawnClone(x, y - 1, z, 6, "Rumia-一阶段");//Rumia-一阶段 Rumia-二阶段 EX-Rumia-三阶段
        npc.despawn();
    }
}

if(!npc.hasTempData("cross_blast_cooldown") && npc.isAttacking() && npc.isAlive())
{
    var rand_x = Math.random() * 20;
    var rand_z = Math.sqrt((20*20) - (rand_x * rand_x));
    //第一列
    var MyThread1 = Java.extend(Thread, { 
        run: function() { 
            Thread.sleep(spell_latency);
            drawLine(x, y, z, x + rand_x, y, z + rand_z, 5);
        } 
    }); 
    //第二列
    var MyThread2 = Java.extend(Thread, { 
        run: function() { 
            Thread.sleep(spell_latency);
            drawLine(x, y, z, x + rand_z, y, z - rand_x, 5);
        } 
    }); 
    //第三列
    var MyThread3 = Java.extend(Thread, { 
        run: function() { 
            Thread.sleep(spell_latency);
            drawLine(x, y, z, x - rand_x, y, z - rand_z, 5);
        } 
    }); 
    //第四列
    var MyThread4 = Java.extend(Thread, { 
        run: function() { 
            Thread.sleep(spell_latency);
            drawLine(x, y, z, x - rand_z, y, z + rand_x, 5);
        } 
    }); 
    npc.say("「cross blast」");
    var th1 = new MyThread1(); 
    var th2 = new MyThread2(); 
    var th3 = new MyThread3(); 
    var th4 = new MyThread4(); 
    th1.start(); 
    th2.start(); 
    th3.start(); 
    th4.start(); 

    npc.setTempData("cross_blast_cooldown", cross_blast_cooldown * 20);//冷却标志
}
else
{//计算冷却的地方
    var cd = npc.getTempData("cross_blast_cooldown");
    cd -= 10;
    if(cd <= 0)
        npc.removeTempData("cross_blast_cooldown");
    else
        npc.setTempData("cross_blast_cooldown", cd);
}

function drawLine(x1, y1, z1, x2, y2, z2, density)
{
    var ball_r = 2.3;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var piece = 1 / density;
    for(var i = piece;i <= 1;i+=piece)
    {
        var new_x = x1 + (dx * i);
        var new_y = y1 + (dy * i);
        var new_z = z1 + (dz * i);
        world.explode(new_x, new_y - 0.7, new_z, 0, false, false);
        dynamicBall(new_x, new_y, new_z, ball_r);
        
    }
}

function dynamicBall(x, y, z, max_r)
{
    var damage = 2;
    var piece = 1 / 3 / 3;
    var max_ratio = Math.sqrt(max_r);
    
    for(var t = 0.3;t < max_ratio;t+=piece)
    {
        var r = t * t;
        //max_r * 10 = t max_r = t / 10
        drawBall(x, y, z, r, r * 5);
        //drawCircle(x, y, z, r, 10)
        Thread.sleep(40);
        var players = getNearbyPlayer(x, y, z, r+0.3);
        for(var j in players)
        {
            doDamage(players[j], damage);
        }
    }
}

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
        world.spawnParticle("reddust", new_x, y, new_z, 0.2, 0, 0.2, 0, 2);
    }
}
//半球
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
    /*
    for(var h = 0;h < r;h += piece)
    {
        var cos = h / r;
        var sin = Math.sqrt(1 - (cos * cos));
        drawCircle(x, y - h, z, r * sin, density);
    }*/
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
