var Thread = Java.type("java.lang.Thread");

var xianshi_cooldown = 10;//现世斩冷却时间,单位秒
var xianshi_spell_latency = 700;//符卡宣言后释放延时
var chengfo_cooldown = 20;//成佛得脱斩冷却时间,单位秒
var mirai_cooldown = 25;//未来永劫斩冷却时间,单位秒
var spell_latency =  700;//符卡宣言后释放延时
/*
var liugen_cooldown = 25;//六根清净斩冷却时间,单位秒
var liugen_spell_latency = 500;//符卡宣言后释放延时
var liugen_block_duration = 1000;//格挡时间
*/
var yinian_cooldown = 25;//一念无量劫冷却时间,单位秒
var yinian_spell_latency = 500;//符卡宣言后释放延时
var yinian_block_duration = 1000;//格挡时间

var yinghua_cooldown = 15;//樱花闪闪冷却时间,单位秒
var yinghua_spell_latency = 600;//符卡宣言后释放延时
var yinghua_blast_latency = 500;//冲锋后爆炸延时

var atk_speed = 20;//攻击速度
var count_ticks = 100;//100次仍然忙认为出错,清除所有冷却时间
var rest_time = 2000;//休息时间

//var npc = event.npc;
if(npc.isAlive())
{
    //var data = event.npc.getTempdata();
    var ct = npc.getTempData("count_ticks");
    //清除冷却计数
    if(ct > count_ticks)
    {
        ct = 0;
        if(npc.hasTempData("mirai_cooldown"))
            npc.removeTempData("mirai_cooldown");
        if(npc.hasTempData("chengfo_cooldown"))
            npc.removeTempData("chengfo_cooldown");
        if(npc.hasTempData("xianshi_cooldown"))
            npc.removeTempData("xianshi_cooldown");
        if(npc.hasTempData("yinghua_cooldown"))
            npc.removeTempData("yinghua_cooldown");
        if(npc.hasTempData("yinian_cooldown"))
            npc.removeTempData("yinian_cooldown");
        if(npc.hasTempData("is_busy"))
            npc.removeTempData("is_busy");
        if(npc.hasTempData("Invincible"))
            npc.removeTempData("Invincible");
        if(npc.hasTempData("no_attack"))
            npc.removeTempData("no_attack");

        npc.setTempData("damage_score", new Object);
    }
    //释放符卡
    if(!npc.hasTempData("is_busy"))
    {
        //技能释放顺序
        miari_event(event);
        chengfo_event(event);
        yinghua_event(event);
        yinian_event(event);
        xianshi_event(event);
    }
    
    
    npc.setTempData("count_ticks", ct + 1);
}

//樱花闪闪
function yinghua_event(event)
{
    //var npc = event.npc;
	//var data = event.npc.getTempdata();
    //var world = npc.getWorld();
    var target = npc.getAttackTarget();
        
    if(npc.hasTempData("yinghua_cooldown"))
    {//计算冷却的地方
        var cd = npc.getTempData("yinghua_cooldown");
        if(cd <= world.getTotalTime())
            npc.removeTempData("yinghua_cooldown");
    }
    if(!npc.hasTempData("yinghua_cooldown")&&target&& npc.isAttacking()&&!npc.hasTempData("is_busy"))
    {
        npc.setTempData("is_busy", 1);//NPC忙标志
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var rotation = npc.getRotation();
        var range = 15;//冲刺距离
        var radian = (rotation + 90) / 180 * Math.PI;
        var x2 = x + (range * Math.cos(radian)),y2 = y,z2 = z + (range * Math.sin(radian));
        var players = [];
        var dmg = 5;//每个爆炸的伤害
        //第一列
        var MyThread_Yinghua = Java.extend(Thread, { 
            run: function() { 
                npc.executeCommand("/playsound se.spell music @p");

                Thread.sleep(yinghua_spell_latency);

                yinghua_dash(x, y, z, x2, y, z2, 2, 1.1, event);

                Thread.sleep(yinghua_blast_latency);

                yinghua_serial_blast(x, y + 4, z, x2, y2 + 4, z2, 0.75, dmg, event)
                
                Thread.sleep(rest_time);

                if(npc.hasTempData("is_busy"))
                {
                    npc.removeTempData("is_busy");
                    npc.setTempData("count_ticks", 0);
                }
            } 
        }); 
        npc.say("剑伎「樱花闪闪」");
        var th_yinghua = new MyThread_Yinghua(); 
        th_yinghua.start(); 

        npc.setTempData("yinghua_cooldown", world.getTotalTime() + yinghua_cooldown * 20);//冷却标志
        //event.setCancelled(true);
    }
}
//一念无量劫
function yinian_event(event)
{
    //var npc = event.npc;
	//var data = event.npc.getTempdata();
    //var world = npc.getWorld();
    var target = npc.getAttackTarget();
        
    if(npc.hasTempData("yinian_cooldown"))
    {//计算冷却的地方
        var cd = npc.getTempData("yinian_cooldown");
        if(cd <= world.getTotalTime())
            npc.removeTempData("yinian_cooldown");
    }
    if(!npc.hasTempData("yinian_cooldown")&&target&& npc.isAttacking()&&!npc.hasTempData("is_busy"))
    {
        npc.setTempData("is_busy", 1);//NPC忙标志
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var players = [];
        var first_dmg = 2;//第一击的伤害
        var chop_dmg = 2;//连斩伤害
        //var first_r = 2;//第一击的爆炸范围
        var second_dmg = 5;//第二击的伤害
        var second_r = 3;//第二击的爆炸范围
        var chop_density = 40;//斩击密度,次/秒
        var chop_r = 4;//斩击范围,以目标为中心的正方体
        var chop_time = 2000;//斩击时间,毫秒
        var density = 5//圈密度
        //第一列
        var MyThread_yinian = Java.extend(Thread, { 
            run: function() { 
                npc.executeCommand("/playsound se.spell music @p");

                Thread.sleep(yinian_spell_latency);
                var MyThread1 = Java.extend(Thread, { 
                    run: function() { 
                        Hold(1, 20, npc);
                    } 
                }); 
                var th1 = new MyThread1(); 
                th1.start(); 

                npc.setTempData("yinian_block", 1);
                npc.setTempData("no_attack", 1);

                Thread.sleep(yinian_block_duration);

                if(npc.hasTempData("yinian_block_target"))
                {
                    var target = npc.getTempData("yinian_block_target");
                    var x2 = target.getX(),y2 = target.getY(),z2 = target.getZ();
                    players.push(target);
                    //控制目标
                    var MyThread2 = Java.extend(Thread, { 
                        run: function() { 
                            Hold(3.6, 20, target);
                        } 
                    }); 
                    var th2 = new MyThread2(); 
                    th2.start();

                    Thread.sleep(500);
                    
                    npc.setTempData("Invincible", 1);//NPC无敌标志
                    yinian_dash(x, y + 1, z, x2, y2 + 1, z2, 1, 1.4, event);
                    doParticleDamage(players, first_dmg, 10, event, "se.sword_hit");
                    //var display = npc.getDisplay();
                    //使npc静止
                    var MyThread3 = Java.extend(Thread, { 
                        run: function() { 
                            Hold(3, 20, npc);
                        } 
                    }); 
                    var th3 = new MyThread3(); 
                    th3.start(); 

                    Thread.sleep(500);

                    yinian_chop(target, chop_r, chop_density, chop_time, chop_dmg, event);

                    Thread.sleep(500);

                    yinian_dash(x2, y2 + 10, z2, x2, y2 + 1, z2, 2, 1.1, event);
                    yinian_blast(x2, y2 + 1, z2, second_r, 5, event);
                    doParticleDamage(players, second_dmg, 10, event, "se.sharp_hit");

                    npc.removeTempData("yinian_block_target");
                }
                //清除无敌标记
                if(npc.hasTempData("Invincible"))
                    npc.removeTempData("Invincible");
                //清除禁止攻击标记
                if(npc.hasTempData("no_attack"))
                    npc.removeTempData("no_attack");
                //清除格挡标记
                if(npc.hasTempData("yinian_block"))
                    npc.removeTempData("yinian_block");
                
                Thread.sleep(rest_time);

                if(npc.hasTempData("is_busy"))
                {
                    npc.removeTempData("is_busy");
                    npc.setTempData("count_ticks", 0);
                }
            } 
        }); 
        npc.say("六道剑「一念无量劫」");
        var th_yinian = new MyThread_yinian(); 
        th_yinian.start(); 

        npc.setTempData("yinian_cooldown", world.getTotalTime() + yinian_cooldown * 20);//冷却标志
        //event.setCancelled(true);
    }
}
//现世斩
function xianshi_event(event)
{
    //var npc = event.npc;
	//var data = event.npc.getTempdata();
    //var world = npc.getWorld();
    var target = npc.getAttackTarget();
        
    if(npc.hasTempData("xianshi_cooldown"))
    {//计算冷却的地方
        var cd = npc.getTempData("xianshi_cooldown");
        if(cd <= world.getTotalTime())
            npc.removeTempData("xianshi_cooldown");
    }
    if(!npc.hasTempData("xianshi_cooldown")&&target&& npc.isAttacking()&&!npc.hasTempData("is_busy"))
    {
        npc.setTempData("is_busy", 1);//NPC忙标志
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var x2 = target.getX(),y2 = target.getY(),z2 = target.getZ();
        var players = [];
        var dmg = 7;//伤害
        //npc.setTempData("mirai_lock", 1);//释放期间禁止npc攻击
        //第一列
        var MyThread_Xianshi = Java.extend(Thread, { 
            run: function() { 
                npc.executeCommand("/playsound se.spell music @p");
                Thread.sleep(xianshi_spell_latency);
                
                players = drawMiraiLine(x, y + 1, z, x2, y2 + 1, z2, 1, 1.4, event);
                doParticleDamage(players, dmg, 30, event, "se.sword_hit");

                
                Thread.sleep(rest_time);

                if(npc.hasTempData("is_busy"))
                {
                    npc.removeTempData("is_busy");
                    npc.setTempData("count_ticks", 0);
                }
            } 
        }); 
        npc.say("人符「现世斩」");
        var th_xianshi = new MyThread_Xianshi(); 
        th_xianshi.start(); 

        npc.setTempData("xianshi_cooldown", world.getTotalTime() + xianshi_cooldown * 20);//冷却标志
        //event.setCancelled(true);
    }
}

//成佛得脱斩
function chengfo_event(event)
{
    //var npc = event.npc;
	//var data = event.npc.getTempdata();
    //var world = npc.getWorld();
    var target = npc.getAttackTarget();
        
    if(npc.hasTempData("chengfo_cooldown"))
    {//计算冷却的地方
        var cd = npc.getTempData("chengfo_cooldown");
        if(cd <= world.getTotalTime())
            npc.removeTempData("chengfo_cooldown");
    }
    if(!npc.hasTempData("chengfo_cooldown")&&target&& npc.isAttacking()&&!npc.hasTempData("is_busy"))
    {
        npc.setTempData("is_busy", 1);//NPC忙标志
        //var in_r = 3.5;//内径
        //var out_r = 5.2;//外径
        //var explode_r = 5.2;//爆炸半径
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var x2 = target.getX(),y2 = target.getY(),z2 = target.getZ();
        var players = [];
        var dmg = 1.5;//每段伤害
        //npc.setTempData("mirai_lock", 1);//释放期间禁止npc攻击
        //第一列
        var MyThread_Chengfo = Java.extend(Thread, { 
            run: function() { 
                npc.executeCommand("/playsound se.spell music @p");
                var MyThread = Java.extend(Thread, { 
                    run: function() { 
                        Hold(1.7, 20, npc);
                        //PutHigh(0, 10, 1, players[j]);
                    } 
                }); 
                var th = new MyThread(); 
                th.start(); 

                Thread.sleep(spell_latency);
                for(var i = 0;i < 10;i++)
                {
                    players = drawchengfoLine(x, y , z, x2, y2 + 10, z2, 4, 1.35, event);
                    doParticleDamage(players, dmg, 15, event, "se.hit");
                    Thread.sleep(100);
                }
                
                
                Thread.sleep(rest_time);
                
                if(npc.hasTempData("is_busy"))
                {
                    npc.removeTempData("is_busy");
                    npc.setTempData("count_ticks", 0);
                }
            } 
        }); 
        npc.say("断灵剑「成佛得脱斩」");
        var th_chengfo = new MyThread_Chengfo(); 
        th_chengfo.start(); 

        npc.setTempData("chengfo_cooldown", world.getTotalTime() + chengfo_cooldown * 20);//冷却标志
        //event.setCancelled(true);
    }
}

//未来永劫斩
function miari_event(event)
{
    //var npc = event.npc;
	//var data = event.npc.getTempdata();
    //var world = npc.getWorld();
    var target = npc.getAttackTarget();

    if(npc.hasTempData("mirai_cooldown"))
    {//计算冷却的地方
        var cd = npc.getTempData("mirai_cooldown");
        if(cd <= world.getTotalTime())
            npc.removeTempData("mirai_cooldown");
    }
    if(!npc.hasTempData("mirai_cooldown")&&target&& npc.isAttacking()&&!npc.hasTempData("is_busy"))
    {
        npc.setTempData("is_busy", 1);//NPC忙标志
        var mr = 3.5;
        var mr2 = 5.2;
        var x = npc.getX(),y = npc.getY(),z = npc.getZ();
        var x2 = target.getX(),y2 = target.getY(),z2 = target.getZ();
        var players = [];
        var small_dmg = 0.7;//连击伤害,共16下
        var small_count = 15;//连击击中特效数
        var crit_dmg = 5;//重击伤害
        var crit_count = 30;//重击特效数
        //npc.setTempData("mirai_lock", 1);//释放期间禁止npc攻击
        //第一列
        var MyThread_Mirai = Java.extend(Thread, { 
            run: function() { 
                npc.executeCommand("/playsound se.spell music @p");
                Thread.sleep(spell_latency);
                players = drawMiraiLine(x, y + 1, z, x2, y + 1, z2, 1, 1.35, event);
                doParticleDamage(players, 2, crit_count, event, "se.sword_hit");
                for(var j in players)
                {
                    var MyThread = Java.extend(Thread, {
                        run: function() { 
                            var p = players[j];
                            PutHigh(30, 35, 1.5, p);
                            Hold(1.8, 30, p);
                            PutHigh(30, 40, 0.7, p);
                            //PutHigh(0, 10, 1, players[j]);
                        } 
                    }); 
                    var th = new MyThread(); 
                    th.start(); 
                }
                if(players.length != 0)
                {
                    
                    npc.setTempData("no_attack", 1);
                    Thread.sleep(1500);
                    x2 = players[0].getX();
                    y2 = players[0].getY()
                    z2 = players[0].getZ();

                    var dx = x2 - x;
                    //var dy = y2 - y;
                    var dz = z2 - z;
                    var l = Math.sqrt((dx*dx) + (dz*dz));
                    var az = dx / l;
                    //var ay = dy / l;
                    var ax = dz / l;

                    var sowrd_lightly_hit = "se.sowrd_lightly_hit";
                    //正方形四刀
                    drawNPCMoveLine(x2 + (ax * mr), y2 + mr + 1, z2 + (az * mr), x2 - (ax * mr), y2 + mr + 1, z2 - (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr), y2 - mr + 1, z2 - (az * mr), x2 + (ax * mr), y2 - mr + 1, z2 + (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr), y2 + mr + 1, z2 - (az * mr), x2 - (ax * mr), y2 - mr + 1, z2 - (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 + (ax * mr), y2 - mr + 1, z2 + (az * mr), x2 + (ax * mr), y2 + mr + 1, z2 + (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    //斜正方形四刀
                    drawNPCMoveLine(x2, y2 + mr2, z2, x2 + (ax * mr2), y2, z2 + (az * mr2), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2, y2 - mr2, z2, x2 - (ax * mr2), y2, z2 - (az * mr2), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 + (ax * mr2), y2, z2 + (az * mr2), x2, y2 - mr2, z2, 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr2), y2, z2 - (az * mr2), x2, y2 + mr2, z2, 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    //正方形四刀
                    drawNPCMoveLine(x2 + (ax * mr), y2 + mr + 1, z2 + (az * mr), x2 - (ax * mr), y2 + mr + 1, z2 - (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr), y2 - mr + 1, z2 - (az * mr), x2 + (ax * mr), y2 - mr + 1, z2 + (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr), y2 + mr + 1, z2 - (az * mr), x2 - (ax * mr), y2 - mr + 1, z2 - (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 + (ax * mr), y2 - mr + 1, z2 + (az * mr), x2 + (ax * mr), y2 + mr + 1, z2 + (az * mr), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    //斜正方形四刀
                    drawNPCMoveLine(x2, y2 + mr2, z2, x2 + (ax * mr2), y2, z2 + (az * mr2), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2, y2 - mr2, z2, x2 - (ax * mr2), y2, z2 - (az * mr2), 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 + (ax * mr2), y2, z2 + (az * mr2), x2, y2 - mr2, z2, 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    drawNPCMoveLine(x2 - (ax * mr2), y2, z2 - (az * mr2), x2, y2 + mr2, z2, 10, 1.05, event);
                    doParticleDamage(players, small_dmg, small_count, event, sowrd_lightly_hit);
                    
                    Thread.sleep(500);
                    
                    drawCritLine(x2, y2 - 5 + 1, z2, x2, y2 + 5 + 1, z2, 3, 1.35, event);
                    doParticleDamage(players, crit_dmg, crit_count, event, "se.sword_hit");
                }
                //清除禁止攻击标记
                if(npc.hasTempData("no_attack"))
                    npc.removeTempData("no_attack");

                Thread.sleep(rest_time + 500);
                
                if(npc.hasTempData("is_busy"))
                {
                    npc.removeTempData("is_busy");
                    npc.setTempData("count_ticks", 0);
                }

            } 
        }); 
        npc.say("人鬼「未来永劫斩」");
        var th_mirai = new MyThread_Mirai(); 
        th_mirai.start(); 

        npc.setTempData("mirai_cooldown", world.getTotalTime() + mirai_cooldown * 20);//冷却标志
        //event.setCancelled(true);
    }
}

//樱花闪闪用冲锋
function yinghua_dash(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i <= (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y + 0.25, new_z, 1.25, 1, 1.25, 0.1, 20);
        Thread.sleep(7);
        npc.setPosition(new_x, new_y, new_z);
        //dynamicBall(new_x, new_y, new_z, ball_r);
        
    }
}
//樱花闪闪连续爆炸
function yinghua_serial_blast(x1, y1, z1, x2, y2, z2, density, damage, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var blast_r = 2.25;
    var random_r = 4;

    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var new_x, new_y, new_z;

    for(var i = 0;i <= l;i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        yinghua_blast(new_x, new_y, new_z, random_r, blast_r, 3, damage, event);
        
    }

}
//樱花闪闪爆炸
function yinghua_blast(x, y, z, random_r, blast_r, density, damage, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var piece = blast_r / density;
    var dmg = damage / density;
    var center_x = x + ((Math.random() - Math.random()) * random_r);
    var center_y = y + ((Math.random() - Math.random()) * random_r);
    var center_z = z + ((Math.random() - Math.random()) * random_r);
    
    for(var i = piece;i <= blast_r;i+=piece)
    {
        world.spawnParticle("explode", center_x, center_y, center_z, i, i, i, 0.05, i * 15);
        world.spawnParticle("witchMagic", center_x, center_y, center_z, i, i, i, 0.1, i * 10);
        var entities = safeFindEntities(center_x, center_y, center_z, i + 1, 5, event);
        
        doParticleDamage(entities, dmg, 10, event, "se.sharp_hit");
        
        Thread.sleep(10);
    }

}


//一念无量劫用冲锋
function yinian_dash(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var piece = 1 / density;
    var min_length = 5;
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
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i <= (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y, new_z, 0.25, 0.25, 0.25, 0, 5);
        Thread.sleep(10);
        npc.setPosition(new_x, new_y, new_z);
        //dynamicBall(new_x, new_y, new_z, ball_r);
        
    }
}
//一念无量劫用爆炸
function yinian_blast(x, y, z, r, density, event)
{
    //var world = event.npc.getWorld();
    var piece = r / density;
    for(var i = piece;i <= r;i+=piece)
    {
        world.spawnParticle("explode", x, y, z, i, 1, i, 0.05, 30 * i);
        world.spawnParticle("witchMagic", x, y, z, i, 1, i, 0.1, 30 * i);
        Thread.sleep(10);
    }
}
//一念无量劫用连续斩击
function yinian_chop(target, r, density, time, damage, event)
{
    var x = target.getX(),y = target.getY(),z = target.getZ();
    var piece = 1000 / density;
    for(var i = piece;i <= time;i+=piece)
    {
        var x1 = x - r + (2* Math.random() * r);
        var x2 = x - r + (2* Math.random() * r);
        var y1 = y - r + (2* Math.random() * r) + 1.5;
        var y2 = y - r + (2* Math.random() * r) + 1.5;
        var z1 = z - r + (2* Math.random() * r);
        var z2 = z - r + (2* Math.random() * r);
        var entities = yinian_chopLine(x1, y1, z1, x2, y2, z2, 5, 1.2, event);
        doParticleDamage(entities, damage, 10, event, "se.sharp_hit");
        Thread.sleep(piece);
    }
}

//一念无量劫用连续斩击生成线
function yinian_chopLine(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var min_length = 3;
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var ret_players = [];
    if(l < min_length)
    {
        l = min_length;
    }
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i < (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y, new_z, 0, 0, 0, 0, 1);
        var entities = safeFindEntities(new_x, new_y, new_z, 0.75, 5, event);
        for(var j in entities)
        {
            if(ret_players.indexOf(entities[j]) == -1)
            {
                ret_players.push(entities[j]);
            }
        }
        //Thread.sleep(10);
    }
    return ret_players;
}

//成佛得脱斩用生成线
function drawchengfoLine(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var min_length = 12;
    var offset = 3;//在身前多少格偏移量
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var dxz = Math.sqrt((dx*dx) + (dz*dz));
    x1 = x1 + (offset * dx / dxz);//身前偏移offset格
    z1 = z1 + (offset * dz / dxz);
    dx = x2 - x1;
    dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var ret_players = [];
    if(l < min_length)
    {
        l = min_length;
    }
    var new_x, new_y, new_z;
    for(var i = 0;i <= (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("witchMagic", x1, y1 + 1, z1, 1.7, 1, 1.7, 0.1, 1);
        world.spawnParticle("explode", x1, y1 + 1, z1, 2.2, 1.5, 2.2, 0.1, 1);
        world.spawnParticle("witchMagic", new_x, new_y, new_z, 1.5, 1.5, 1.5, 0.3, 3);
        world.spawnParticle("explode", new_x, new_y, new_z, 1.5, 1.2, 1.5, 0.1, 2);
        var entities = safeFindEntities(new_x, new_y, new_z, 3.5, 5, event);
        for(var j in entities)
        {
            if(ret_players.indexOf(entities[j]) == -1)
            {
                ret_players.push(entities[j]);
            }
        }
        //dynamicBall(new_x, new_y, new_z, ball_r);
    }

    return ret_players;
}


//NPC移动路径生成线s
function drawNPCMoveLine(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var min_length = 0;
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
    npc.setPosition(x1, y1, z1);
    Thread.sleep(80);
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i < (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y, new_z, 0, 0, 0, 0, 1);
        //Thread.sleep(30);
        //dynamicBall(new_x, new_y, new_z, ball_r);
        
    }
    npc.setPosition(x2, y2, z2);

}
//未来永劫斩用生成线
function drawMiraiLine(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var min_length = 12;
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var ret_players = [];
    if(l < min_length)
    {
        l = min_length;
    }
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i <= (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y, new_z, 1.25, 0, 1.25, 0, 30);
        var entities = safeFindEntities(new_x, new_y, new_z, 2.5, 5, event);
        for(var j in entities)
        {
            if(ret_players.indexOf(entities[j]) == -1)
            {
                ret_players.push(entities[j]);
            }
        }
        Thread.sleep(10);
        npc.setPosition(new_x, new_y, new_z);
        //dynamicBall(new_x, new_y, new_z, ball_r);
        
    }

    return ret_players;
}
//未来永劫斩重击生成线
function drawCritLine(x1, y1, z1, x2, y2, z2, density, overlength, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    var min_length = 12;
    var piece = 1 / density;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l;
    var ay = dy / l;
    var az = dz / l;
    var ret_players = [];
    if(l < min_length)
    {
        l = min_length;
    }
    var new_x, new_y, new_z;
    for(var i = (l * (1 - overlength));i <= (l * overlength);i+=piece)
    {
        new_x = x1 + (ax * i);
        new_y = y1 + (ay * i);
        new_z = z1 + (az * i);
        world.spawnParticle("explode", new_x, new_y, new_z, 1, 0.3, 1, 0, 10);
        var players = safeFindEntities(new_x, new_y, new_z, 2.5, 5, event);
        for(var j in players)
        {
            if(ret_players.indexOf(players[j]) == -1)
            {
                ret_players.push(players[j]);
            }
        }
        //dynamicBall(new_x, new_y, new_z, ball_r);
    }
    npc.setPosition(new_x, new_y, new_z);

    return ret_players;
}

//将目标往高处移动并控制
function PutHigh(v0, a, t, player)
{
    var density = 30;
    var x = player.getX(), y = player.getY(), z = player.getZ();
    var piece_t = 1 / density;
    var sleep_ms = piece_t * 1000;
    var piece_a = a / density;
    //var piece_v = v / 25;
    for(var i = 0;i < t;i+=piece_t)
    {
        var l = (v0 * i) - (0.5 * a * i * i);
        player.setPosition(x, y + l, z);
        Thread.sleep(sleep_ms);
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
//实体位移
function EntityMove(x2, y2, z2, time, entity, frequency)
{
    if(!frequency)
        frequency = 20;
    var x1 = entity.getX(), y1 = entity.getY(), z1 = entity.getZ();
    var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    var l = Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
    var ax = dx / l, ay = dy / l, az = dz / l;
    var sleep_ms = 1 / frequency * 1000;
    var ds = 1 / frequency * l / time;
    for(var s = 0;s < l;s+=ds)
    {
        entity.setPosition(x1 + (ax * s), y1 + (ay * s), z1 + (az * s));
        Thread.sleep(sleep_ms);
    }
}

//造成伤害(对非玩家及NPC特攻十倍伤害), 使用kill指令
function doDamage(entity, damage, event)
{
    //var npc = event.npc;
    if(!entity)
        return;
    if(entity.isAlive())
    {
        var health = entity.getHealth();
        /*
        if(entity.getType() != 1&&entity.getType() != 2)
            damage = damage * 10;
            */
        var new_health = health - damage;
        if(new_health < 0)
            new_health = 0;
        if(new_health == 0&&entity.getType() == 1)
        {
            npc.executeCommand("/kill " + entity.getName());
            //npc.getWorld().broadcast(npc.getName() + "杀死了" + entity.getName());
        }
        else
            entity.setHealth(new_health);
    }
}

/*
//造成伤害(对非玩家及NPC特攻十倍伤害), 不使用kill指令
function doDamage(entity, damage, event)
{
    var npc = event.npc;
    if(!entity)
        return;
    if(entity.isAlive())
    {
        var health = entity.getHealth();
        if(entity.getType() != 1&&entity.getType() != 2)
            damage = damage * 10;
        var new_health = health - damage;
        if(new_health < 0)
            new_health = 0;
        if(new_health == 0&&entity.getType() == 1)
        {
            entity.setHealth(new_health);
            //npc.executeCommand("/kill " + entity.getName());
            npc.getWorld().broadcast(event.npc.getDisplay().getName() + "杀死了" + entity.getName());
        }
        else
            entity.setHealth(new_health);
    }
}
*/
//造成成吨(带特效的)伤害
function doParticleDamage(entities, damage, particle_count, event, hitsound)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    for(var j in entities)
    {
        if(hitsound)
            npc.executeCommand("/playsound "+ hitsound + " " + entities[j].getName());
        doDamage(entities[j], damage, event);
        var x = entities[j].getX(),y = entities[j].getY(),z = entities[j].getZ();
        world.spawnParticle("explode", x, y + 1, z, 0.7, 0.7, 0.7, 0.05, particle_count);
        
    }
    
}
//安全地寻找实体
function safeFindEntities(x, y, z, range, type, event)
{
    //var npc = event.npc;
    //var world = npc.getWorld();
    //var entities = [];
    var raw_entities = getNearbyPlayer(x, y, z, range, type);
    /*
    for(var j in raw_entities)
    {
        if(raw_entities[j].getUUID() != npc.getUUID())
        {
            entities.push(raw_entities[j]);
        }
    }
    return entities;
    */
    return raw_entities;
}
//根据点找到最近的玩家
function getNearbyPlayer(x, y, z, range, type) {
    var players = [];
    var entities = npc.getSurroundingEntities(32, 1);
    range = range + 1;
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