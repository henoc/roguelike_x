namespace battle{

  export class Status{
    hp:number
    max_hp:number
    atk:number
    def:number

    constructor(max_hp,hp,atk,def){
      this.max_hp = max_hp
      this.hp = hp
      this.atk = atk
      this.def = def
    }

    static zero(){
      return new Status(0,0,0,0)
    }

    static of_food(max_hp){
      return new Status(max_hp,0,0,0)
    }

    static of_drink(hp){
      return new Status(0,hp,0,0)
    }

    static of_knife(atk){
      return new Status(0,0,atk,0)
    }

    static of_guard(def){
      return new Status(0,0,0,def)
    }

    copy(){
      let copied = new Status(this.max_hp,this.hp,this.atk,this.def)
      return copied
    }

    add(that:Status){
      return new Status(this.max_hp + that.max_hp, utils.limit(this.hp + that.hp, 0, this.max_hp + that.max_hp + 1), this.atk + that.atk, this.def + that.def)
    }

    /**
     * return new attacked status of that
     * 必ず1は毎回減る
     */
    attackTo(that:model.Entity){
      let that_status = that.status
      let that_status2 = that_status.copy()
      let damage = this.atk - that_status.def <= 0 ? 1 : this.atk - that_status.def
      // damage expression
      utils.start_tmp_num(damage, "red", that.upos.mul(view.unit_size).sub(view.prefix_pos) )
      that_status2.hp = that_status2.hp - damage <= 0 ? 0 : that_status2.hp - damage
      return that_status2
    }
  }

  export let player_exp = 0
  export let dist_point = 0
  export function add_exp(exp:number){
    player_exp += exp
    while(player_exp >= max_exp()){
      player_exp -= max_exp()
      model.player.level++
      dist_point++
      utils.start_anim("level_up",4 / main.sp60f, model.player.upos.sub(new utils.Pos(1,2)).mul(view.unit_size).sub(view.prefix_pos), new utils.Pos(96,96))
      utils.start_tmp_frame("\u30EC\u30D9\u30EB\u304C\u4E0A\u304C\u3063\u305F")
    }
  }
  export function max_exp(){
    return Math.floor(5 * Math.pow(1.2, model.player.level))
  }

}