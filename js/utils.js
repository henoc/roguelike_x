var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils;
(function (utils) {
    /**
     * board[pre_y][pre_x] へ二次元的に paper を代入する
     * @param board 破壊的変更を受ける
     */
    function paste(board, paper, pre_y, pre_x) {
        for (var i = pre_y; i < pre_y + paper.length; i++) {
            for (var j = pre_x; j < pre_x + paper[i - pre_y].length; j++) {
                board[i][j] = paper[i - pre_y][j - pre_x];
            }
        }
    }
    utils.paste = paste;
    function randInt(max) {
        return Math.floor(Math.random() * max);
    }
    utils.randInt = randInt;
    var Pos = (function () {
        function Pos(x, y) {
            this.x = x;
            this.y = y;
        }
        Pos.prototype.add = function (that) {
            return new Pos(this.x + that.x, this.y + that.y);
        };
        Pos.prototype.sub = function (that) {
            return new Pos(this.x - that.x, this.y - that.y);
        };
        Pos.prototype.mul = function (that) {
            return new Pos(this.x * that.x, this.y * that.y);
        };
        Pos.prototype.mul_bloadcast = function (n) {
            return new Pos(this.x * n, this.y * n);
        };
        Pos.prototype.div_bloadcast = function (divisor) {
            return new Pos(this.x / divisor, this.y / divisor);
        };
        Pos.prototype.equals = function (that) {
            return this.x == that.x && this.y == that.y;
        };
        Pos.prototype.map = function (f) {
            return new Pos(f(this.x), f(this.y));
        };
        return Pos;
    }());
    utils.Pos = Pos;
    function all(ary, fn) {
        for (var _i = 0, ary_1 = ary; _i < ary_1.length; _i++) {
            var v = ary_1[_i];
            if (!fn(v))
                return false;
        }
        return true;
    }
    utils.all = all;
    /**
     * [min,max)
     */
    function limit(n, min, max) {
        return n < min ? min : (n >= max ? max - 1 : n);
    }
    utils.limit = limit;
    var Option = (function () {
        function Option() {
        }
        return Option;
    }());
    utils.Option = Option;
    var Some = (function (_super) {
        __extends(Some, _super);
        function Some(t) {
            var _this = _super.call(this) || this;
            _this.t = t;
            return _this;
        }
        Some.prototype.get = function () {
            return this.t;
        };
        Some.prototype.foreach = function (fn) {
            fn(this.t);
        };
        Some.prototype.map = function (fn) {
            return some(fn(this.t));
        };
        Some.prototype.get_or_else = function (e) {
            return this.t;
        };
        Some.prototype.exist = function () {
            return true;
        };
        return Some;
    }(Option));
    utils.Some = Some;
    var None = (function (_super) {
        __extends(None, _super);
        function None() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        None.prototype.get = function () {
            throw "get() call of none";
        };
        None.prototype.foreach = function (fn) {
        };
        None.prototype.map = function (fn) {
            return none();
        };
        None.prototype.get_or_else = function (e) {
            return e;
        };
        None.prototype.exist = function () {
            return false;
        };
        return None;
    }(Option));
    utils.None = None;
    function none() {
        return new None();
    }
    utils.none = none;
    function some(t) {
        return new Some(t);
    }
    utils.some = some;
    function fillText_n(ctx, text, x, y, font_size, newline_size) {
        var strs = text.split("\n");
        for (var i = 0; i < strs.length; i++) {
            ctx.fillText(strs[i], x, y + newline_size * i);
        }
    }
    utils.fillText_n = fillText_n;
    var Frame = (function () {
        function Frame(x, y, w, h, margin, color) {
            this.pos = new Pos(x, y);
            this.wh = new Pos(w, h);
            this.color = color;
            this.margin = margin;
            this.font_size = 14;
            this.text_color = "white";
            this.contents = [];
            this.start_points = [this.pos.add(new Pos(margin, margin))];
        }
        Frame.prototype.insert_text = function (text) {
            this.contents.push({
                type: "text",
                text: text,
                font_size: this.font_size,
                color: this.text_color
            });
            var last = this.start_points[this.start_points.length - 1];
            this.start_points.push(last.add(new Pos(0, this.font_size * 1.2)));
        };
        Frame.prototype.insert_subframe = function (width, height, color) {
            var last = this.start_points[this.start_points.length - 1];
            var width2 = width.get_or_else(this.pos.x + this.wh.x - last.x - this.margin);
            var height2 = height.get_or_else(this.pos.y + this.wh.y - last.y - this.margin);
            // inherits parent frame properties
            var inner = new Frame(last.x, last.y, width2, height2, this.margin, color);
            inner.font_size = this.font_size;
            inner.text_color = this.text_color;
            this.contents.push({
                type: "frame",
                frame: inner
            });
            this.start_points.push(last.add(new Pos(0, height2)));
            return inner;
        };
        /**
         * move a start point of next content to right
         *
         * @param per percentage of moving
         */
        Frame.prototype.move_point_x = function (per) {
            var inner_width = this.wh.x - 2 * this.margin;
            var last = this.start_points.length - 1;
            this.start_points[last] = this.start_points[last].add(new Pos(inner_width * per, 0));
        };
        Frame.prototype.move_point_y = function (per) {
            var inner_height = this.wh.y - 2 * this.margin;
            var last = this.start_points.length - 1;
            this.start_points[last] = this.start_points[last].add(new Pos(0, inner_height * per));
        };
        Frame.prototype.reset_point = function () {
            this.start_points.pop();
            this.start_points.push(this.pos.add(new Pos(this.margin, this.margin)));
        };
        Frame.prototype.print = function (ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.pos.x, this.pos.y, this.wh.x, this.wh.y);
            for (var i = 0; i < this.contents.length; i++) {
                var pos = this.start_points[i];
                var content = this.contents[i];
                switch (content["type"]) {
                    case "text":
                        ctx.font = "normal " + content["font_size"] + "px sans-serif";
                        ctx.fillStyle = content["color"];
                        ctx.fillText(content["text"], pos.x, pos.y);
                        break;
                    case "frame":
                        content["frame"].print(ctx);
                        break;
                }
            }
        };
        return Frame;
    }());
    utils.Frame = Frame;
})(utils || (utils = {}));
