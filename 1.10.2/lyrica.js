function damaged(event){
	var tar = event.source;
	if(tar)
	{
		if(tar.getType() == 1){
			event.npc.setAttackTarget(tar);
			var x1 = event.npc.getX();var y1 = event.npc.getY();var z1 = event.npc.getZ();
			var x2 = tar.getX();var y2 = tar.getY();var z2 = tar.getZ();
			rushB(x1, y1, z1, x2, y2, z2, event);
		}
	}
	event.setCanceled(true);
}

function kill(event){
	event.npc.reset();
}

function meleeAttack(event){
	
	if(event.target.getType() == 1){
		event.target.knockback(10, event.npc.getRotation());
	}
}

function interact(event){
	var data = event.npc.getStoreddata();
	if(!data.has(event.player.getName())){
		data.put(event.player.getName(), event.player.getName());
		
		var world = event.npc.getWorld();
		var stone_shovel = world.createItem("minecraft:stone_shovel", 0, 1);
		var stone_axe = world.createItem("minecraft:stone_axe", 0, 1);
		var stone_pickaxe = world.createItem("minecraft:stone_pickaxe", 0, 1);
		var iron_sword = world.createItem("minecraft:iron_sword", 0, 1);
		var cookie = world.createItem("minecraft:cookie", 0, 32);
		var pumpkin_pie = world.createItem("minecraft:pumpkin_pie", 0, 10);
		event.npc.giveItem(event.player, iron_sword);
		event.npc.giveItem(event.player, stone_axe);
		event.npc.giveItem(event.player, stone_pickaxe);
		event.npc.giveItem(event.player, stone_shovel);
		event.npc.giveItem(event.player, cookie);
		event.npc.giveItem(event.player, pumpkin_pie);
	}
	if(Math.random() < 0.3)
		event.npc.say("传火吗?");
	else if(Math.random() < 0.3)
		event.npc.say("不想传火也可以跳下去");
	else
	{
		var gus = Math.ceil(Math.random() * 20);
		var gugugu = "";
		for(var i = 0;i < gus;i++)
		{
			gugugu += "咕";
		}
		gugugu += "?";
		
		event.npc.say(gugugu);
	}
}

function rushB(x1, y1, z1, x2, y2, z2, event){
	var world = event.npc.getWorld()
	var density = 10;
	var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var piece = 1 / density;
    for(var i = piece;i <= 1;i+=piece)
    {
        var new_x = x1 + (dx * i);
        var new_y = y1 + (dy * i) + 0.7;
		var new_z = z1 + (dz * i);
		world.spawnParticle("explode", new_x, new_y, new_z, 0,0,0, 0.1, 2);
	}
	event.npc.setPosition(x2, y2, z2);
}