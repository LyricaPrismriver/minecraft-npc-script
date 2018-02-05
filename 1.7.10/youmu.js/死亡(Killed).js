var Thread = Java.type("java.lang.Thread");
//死亡

var MyThread1 = Java.extend(Thread, { 
    run: function() { 
        npc.setTempData("last_fight", world.getTotalTime());
        var damage_score = npc.getTempData("damage_score");
        var tmp_dic = new Object;
        var sort_list = new Array();
        var rank_1 = 1;
        for(var player_name in damage_score)
        {
            tmp_dic[damage_score[player_name]] = player_name;
            sort_list.push(damage_score[player_name]);
        }
        sort_list.sort(sort_DESC);
        npc.executeCommand("/say " + npc.getName() + npc.getTitle() + "击杀成功,伤害排名如下");
        //world.broadcast(npc.getName()+ "三阶段" + "击杀成功,伤害排名如下");
        for(var i = 0;i < sort_list.length;i++)
        {
            
            var rank = i + 1;
            /*
            if(rank == rank_1)
            {
                var item = world.getTempData("EX_Rumia3_Bonus");
                var champion = world.getPlayer(tmp_dic[sort_list[i]]);
                if(champion&&item)
                    champion.giveItem(item, 1);
                else
                {
                    rank_1 += 1;
                    npc.executeCommand("/say " + "没有找到第" + rank + "位玩家,奖励将发放给排名" + (rank+1) + "的玩家");
                }
            }
            */
            npc.executeCommand("/say " + rank + "." + tmp_dic[sort_list[i]] + "共造成" + Math.ceil(sort_list[i]) + "点伤害");
            //world.broadcast(rank + "." + tmp_dic[sort_list[i]] + "共造成" + Math.ceil(sort_list[i]) + "点伤害");
        }
    } 
}); 

var th1 = new MyThread1(); 
th1.start(); 


//统计伤害排序
function sort_DESC(a, b)
{
    return b - a;
}