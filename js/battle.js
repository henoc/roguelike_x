var battle;
(function (battle) {
    var Status = (function () {
        function Status(max_hp, hp, atk, def) {
            this.max_hp = max_hp;
            this.hp = hp;
            this.atk = atk;
            this.def = def;
        }
        Status.of_food = function (max_hp) {
            return new Status(max_hp, 0, 0, 0);
        };
        Status.of_drink = function (hp) {
            return new Status(0, hp, 0, 0);
        };
        Status.prototype.copy = function () {
            var copied = new Status(this.max_hp, this.hp, this.atk, this.def);
            return copied;
        };
        /**
         * return new attacked status of that
         * 必ず1は毎回減る
         */
        Status.prototype.attackTo = function (that) {
            var that2 = that.copy();
            // [0, hp - 1]
            that2.hp = utils.limit(that2.hp + that.def - this.atk, 0, that2.hp);
            return that2;
        };
        return Status;
    }());
    battle.Status = Status;
})(battle || (battle = {}));
