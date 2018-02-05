//击杀
var maxhealth = npc.getMaxHealth();
var new_health = npc.getHealth() + 20;
if(new_health > maxhealth)
    new_health = maxhealth;
npc.setHealth(new_health);