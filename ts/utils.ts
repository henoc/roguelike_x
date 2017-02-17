namespace utils{
  /**
   * board[pre_y][pre_x] へ二次元的に paper を代入する
   * @param board 破壊的変更を受ける
   */
  export function paste(board:number[][], paper:number[][], pre_y:number,pre_x:number){
    for(var i = pre_y; i < pre_y + paper.length; i++){
      for(var j = pre_x; j < pre_x + paper[i - pre_y].length; j++){
        board[i][j] = paper[i - pre_y][j - pre_x]
      }
    }
  }

  export function randInt(max:number):number {
    return Math.floor( Math.random() * max )
  }

  export class Pos{
    x:number
    y:number
    constructor(x:number,y:number){
      this.x = x
      this.y = y
    }
    add(that:Pos){
      return new Pos(this.x + that.x, this.y + that.y)
    }
    sub(that:Pos){
      return new Pos(this.x - that.x, this.y - that.y)
    }
    mul(that:Pos){
      return new Pos(this.x * that.x, this.y * that.y)
    }
    mul_bloadcast(n:number){
      return new Pos(this.x * n, this.y * n)
    }
    div_bloadcast(divisor:number){
      return new Pos(this.x / divisor, this.y / divisor)
    }
    equals(that:Pos){
      return this.x == that.x && this.y == that.y
    }
    map(f:(n:number)=>number){
      return new Pos(f(this.x),f(this.y))
    }
  }

  export function all<T>(ary:T[],fn : (elem:T) => boolean){
    for(let v of ary){
      if(!fn(v)) return false
    }
    return true
  }

  export function exist<T>(ary:T[], fn: (elem:T) => boolean){
    for(let v of ary){
      if(fn(v)) return true
    }
    return false
  }
  
  /**
   * [min,max)
   */
  export function limit(n:number,min:number,max:number){
    return n < min ? min : (n >= max ? max - 1 : n)
  }

  export abstract class Option<T>{
    abstract get():T;
    abstract foreach(fn:(e:T) => void):void
    abstract get_or_else(e:T):T
    abstract map<U>(fn:(e:T)=>U):Option<U>
    abstract exist():boolean
  }

  export class Some<T> extends Option<T>{
    constructor(private t:T){
      super()
    }
    get(){
      return this.t
    }
    foreach(fn:(e:T) => void):void{
      fn(this.t)
    }
    map<U>(fn:(e:T) => U):Option<U>{
      return some(fn(this.t))
    }
    get_or_else(e:T):T{
      return this.t
    }
    exist(){
      return true
    }
  }

  export class None<T> extends Option<T>{
    get():T{
      throw "get() call of none";
    }
    foreach(fn:(e:T) => void):void{
    }
    map<U>(fn:(e:T)=>U):Option<U>{
      return none<U>()
    }
    get_or_else(e:T):T{
      return e
    }
    exist(){
      return false
    }
  }

  export function none<T>(){
    return new None<T>()
  }

  export function some<T>(t:T){
    return new Some(t)
  }

  export function fillText_n(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, font_size:number, newline_size:number){
    var strs = text.split("\n")
    for(var i = 0; i < strs.length; i++){
      ctx.fillText(strs[i],x,y + newline_size * i)
    }
  }

  export class Frame{
    pos:Pos
    wh:Pos
    color:string
    contents:any[]
    /**
     * start points of contents
     */
    start_points:Pos[]
    margin:number
    font_size:number
    text_color:string
    life:number
    constructor(x:number,y:number,w:number,h:number,margin:number,color:string,life?:number){
      this.pos = new Pos(x,y)
      this.wh = new Pos(w,h)
      this.color = color
      this.margin = margin
      this.font_size = 14
      this.text_color = "white"
      this.contents = []
      this.start_points = [this.pos.add(new Pos(margin,margin))]
      this.life = life
    }
    insert_text(text:string){
      this.contents.push({
        type:"text",
        text:text,
        font_size:this.font_size,
        color:this.text_color
      })
      var last = this.start_points[this.start_points.length - 1]
      this.start_points.push(last.add(new Pos(0,this.font_size * 1.2)))
    }
    insert_subframe(width:Option<number>,height:Option<number>,color:string,margin?:number){
      if(margin == undefined) margin = this.margin
      var last = this.start_points[this.start_points.length - 1]
      var width2 = width.get_or_else(this.pos.x + this.wh.x - last.x - this.margin)
      var height2 = height.get_or_else(this.pos.y + this.wh.y - last.y - this.margin)
      // inherits parent frame properties
      var inner = new Frame(last.x,last.y,width2,height2,margin,color)
      inner.font_size = this.font_size
      inner.text_color = this.text_color

      this.contents.push({
        type:"frame",
        frame:inner
      })
      this.start_points.push(last.add(new Pos(0,height2)))
      return inner
    }

    /**
     * move a start point of next content to right
     * 
     * @param per percentage of moving
     */
    move_point_x(per:number){
      var inner_width = this.wh.x - 2 * this.margin
      var last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(inner_width * per,0))
    }

    move_point_y(per:number){
      var inner_height = this.wh.y - 2 * this.margin
      var last = this.start_points.length - 1
      this.start_points[last] = this.start_points[last].add(new Pos(0,inner_height * per))
    }


    reset_point(){
      this.start_points.pop()
      this.start_points.push(this.pos.add(new Pos(this.margin,this.margin)))
    }

    print(ctx:CanvasRenderingContext2D){
      ctx.fillStyle = this.color
      ctx.fillRect(this.pos.x,this.pos.y,this.wh.x,this.wh.y)
      for(var i = 0; i < this.contents.length; i++){
        var pos = this.start_points[i]
        var content = this.contents[i]
        switch(content["type"]){
          case "text":
          ctx.font = "normal " + content["font_size"] + "px sans-serif"
          ctx.fillStyle = content["color"]
          ctx.fillText(content["text"],pos.x,pos.y)
          break
          case "frame":
          var sub_frame = (<Frame>content["frame"])
          if(sub_frame.life == undefined || sub_frame.life >=0 ) sub_frame.print(ctx)
          break
          default:
          throw "default reached"
        }
      }
      if(this.life != undefined && this.life >= 0){
        this.life -= main.sp60f
      }
    }
  }

  // export class ScrollableFrame extends Frame {
  //   inner_canvas : HTMLCanvasElement  // size w * h
  //   inner_pos : Pos
  //   inner_wh : Pos
  //   constructor(x:number,y:number,w:number,h:number,inner_w:number,inner_h:number,margin:number,color:string,life?:number){
  //     super(x,y,w,h,margin,color,life)
  //     this.inner_wh = new Pos(inner_w, inner_h)
  //     this.inner_pos = new Pos(inner_w - w, inner_h - h)
  //   }

  //   print(ctx:CanvasRenderingContext2D){

  //   }
  // }

  export var frame_tasks :Frame[] = []
  export function print_frame(ctx:CanvasRenderingContext2D){
    for(var i = 0; i < frame_tasks.length; i++){
      frame_tasks[i].print(ctx)
      if(frame_tasks[i].life != undefined && frame_tasks[i].life < 0) {
        frame_tasks.splice(i,1)
        i--
      }
    }
  }

  var tmp_frame : Option<Frame> = none<Frame>()
  export function start_tmp_frame(text:string){
    if(tmp_frame.exist()) tmp_frame.get().life = 80
    else{
      var window_w = view.window_usize.x * view.unit_size.x
      var window_h = view.window_usize.y * view.unit_size.y
      var tf = new utils.Frame(window_w * 0.6, window_h * 0.4, window_w * 0.3, window_h * 0.2, window_h * 0.03, "rgba(0,0,0,0.6)",80)
      tf.font_size = window_h / 32
      tmp_frame = some(tf)
    }
    tmp_frame.get().insert_text(text)
  }
  export function print_tmp_frame(ctx:CanvasRenderingContext2D){
    tmp_frame.foreach(t => {
      t.print(ctx)
      if(t.life != undefined && t.life < 0) tmp_frame = none<Frame>()
    })
  }
  export function delete_tmp_frame(){
    tmp_frame = none<Frame>()
  }

  export function shallow_copy(obj:any):any {
    var clone = {}
    for(var str in obj){
      clone[str] = obj[str]
    }
    return clone
  }

  class TmpAnim{
    name:string
    counter:number
    fps:number
    pos:Pos
    src_wh:Pos
    repeat:number
    constructor(name:string, fps:number, pos:Pos,src_wh:Pos,repeat:number){
      this.name = name
      this.counter = 0
      this.fps = fps
      this.pos = pos
      this.src_wh = src_wh
      this.repeat = repeat
    }
    print(ctx:CanvasRenderingContext2D){
      var cnt = Math.floor(this.counter / this.fps) % main.Asset.image_frames[this.name]
      ctx.drawImage(main.Asset.images[this.name],0,this.src_wh.y * cnt,this.src_wh.x,this.src_wh.y,this.pos.x,this.pos.y,this.src_wh.x,this.src_wh.y)
      this.counter++
    }
  }
  var tmp_anim_tasks:TmpAnim[] = []
  export function start_anim(name:string, fps:number, pos:Pos, src_wh:Pos, repeat?:number){
    if(repeat == undefined) repeat = 1
    tmp_anim_tasks.push(new TmpAnim(name,fps,pos,src_wh,repeat))
  }
  export function print_anims(ctx:CanvasRenderingContext2D){
    for(var i = 0; i < tmp_anim_tasks.length; i++){
      tmp_anim_tasks[i].print(ctx)
      if(tmp_anim_tasks[i].counter / tmp_anim_tasks[i].fps >= main.Asset.image_frames[tmp_anim_tasks[i].name] * tmp_anim_tasks[i].repeat) {
        tmp_anim_tasks.splice(i,1)
        i--
      }
    }
  }

  var tmp_num_tasks:{number:number,color:string,pos:Pos,counter:number}[] = []
  /**
   * damage expression
   */
  export function start_tmp_num(n:number,color:string,pos:Pos){
    tmp_num_tasks.push({number:n, color:color, pos:pos, counter:80 / main.sp60f})
  }
  export function print_tmp_num(ctx:CanvasRenderingContext2D){
    function print_number(k:string, pos:Pos, cnt:number):Pos{
      if(cnt >= 0){
        cnt = limit(cnt, 0, 10 / main.sp60f)
        var delta = view.window_usize.y * view.unit_size.y / 240
        ctx.fillText(k, pos.x, pos.y - (10 / main.sp60f - cnt) * delta)
      }
      var w = ctx.measureText(k).width
      return pos.add(new Pos(w,0))
    }

    for(var i = 0; i < tmp_num_tasks.length; i++){
      var tmp_num_task = tmp_num_tasks[i]
      ctx.font = "normal " + (view.window_usize.y * view.unit_size.y / 40) + "px sans-serif"
      ctx.fillStyle = tmp_num_task.color
      var num_text = tmp_num_task.number + ""
      var pos = tmp_num_task.pos
      for(var j = 0; j < num_text.length; j++){
        pos = print_number(num_text[j],pos,80 / main.sp60f - tmp_num_task.counter - j * 10 / main.sp60f)
      }
      tmp_num_task.counter--
      if(tmp_num_task.counter <= 0) {
        tmp_num_tasks.splice(i,1)
        i--
      }
    }
  }
}