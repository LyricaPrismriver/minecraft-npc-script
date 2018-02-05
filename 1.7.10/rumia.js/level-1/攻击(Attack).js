//攻击
//暴击
var old_dmg = event.getDamage();
var mul = 1.5;//暴击系数
var crt_percent = 0.2;//暴击几率
if(Math.random() <= crt_percent)
    event.setDamage(old_dmg*mul);