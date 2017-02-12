namespace items{
  /**
   * item type exclude item status
   */
  export class Item{
    name:string
    commands:string[]
    delta_status:battle.Status
    text:string
    equip_region:"head" | "body" | "hand" | "foot" | "none"
    constructor(name:string, commands:string[], add_status:battle.Status,equip_region:"head" | "body" | "hand" | "foot" | "none",
    text:string){
      this.name = name
      this.commands = commands
      this.delta_status = add_status
      this.equip_region = equip_region
      this.text = text
    }
  }

  export var type = {
    onigiri: new Item("\u304A\u306B\u304E\u308A",["use","put"],battle.Status.of_food(5),"none",
    `\u98DF\u3079\u308B\u3068\u6700\u5927HP\u304C5\u4E0A\u6607\u3059\u308B`),
    orange_juice: new Item("\u30AA\u30EC\u30F3\u30B8\u30B8\u30E5\u30FC\u30B9",["use","put"],battle.Status.of_drink(10),"none",
    `\u98F2\u3080\u3068HP\u304C10\u56DE\u5FA9\u3059\u308B`),
    knife: new Item("\u30CA\u30A4\u30D5", ["equip","put"], battle.Status.of_knife(2),"hand",
    `\u30B5\u30D0\u30A4\u30D0\u30EB\u751F\u6D3B\u3067\u5F79\u7ACB\u3064`),
    flying_pan: new Item("\u30D5\u30E9\u30A4\u30D1\u30F3", ["equip","put"], battle.Status.of_knife(1),"hand",
    `\u53E4\u4EE3\u306E\u920D\u5668\u3060\u304C\u8ABF\u7406\u306B\u3082\u4F7F\u7528\u3067\u304D\u308B`),
    dead_mame_mouse: new Item("\u8C46\u306D\u305A\u307F\u306E\u8089",["use","put"],battle.Status.of_food(1),"none",`\u8C46\u306E\u5473\u304C\u3059\u308B`),
  }

  export var commands = {
    use: "\u4F7F\u3046",
    put: "\u6368\u3066\u308B",
    equip: "\u88C5\u5099",
  }

  export class ItemEntity{
    item:Item
    constructor(item:Item){
      this.item = item
    }
  }

  export var item_entities : ItemEntity[] = []
  export var equips: { [key: string]: utils.Option<ItemEntity>; } = {}
  equips["head"] = utils.none<ItemEntity>()
  equips["body"] = utils.none<ItemEntity>()
  equips["hand"] = utils.none<ItemEntity>()
  equips["foot"] = utils.none<ItemEntity>()

  export function equips_status_sum(){
    var ret = new battle.Status(0,0,0,0)
    for(let region of ["head","body","hand","foot"]){
      if(equips[region].exist()){
        ret = ret.add(equips[region].get().item.delta_status)
      }
    }
    return ret
  }

  /**
   * equips sum replacing one equipment
   */
  export function equips_status_sum_replace(item_entity:ItemEntity){
    var ret = new battle.Status(0,0,0,0)
    for(let region of ["head","body","hand","foot"]){
      if(item_entity.item.equip_region == region){
        ret = ret.add(item_entity.item.delta_status)
      }else if(equips[region].exist()){
        ret = ret.add(equips[region].get().item.delta_status)
      }
    }
    return ret
  }
}