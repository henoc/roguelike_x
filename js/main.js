var main;
(function (main) {
    var canvas;
    var ctx;
    /**
     * expore, items
     */
    main.menu_mode = ["explore"];
    /**
     * cursur[menu_mode.join(">")] にカーソルの位置が入る
     */
    main.cursor = {};
    /**
     * max
     */
    main.cursor_max = {};
    var point_dist_rate = {
        atk: 1, def: 1, effi: 2
    };
    /**
     * second per 60 frames
     */
    main.sp60f = 1;
    var Asset;
    (function (Asset) {
        Asset.assets = [
            { type: "image", name: "mame_mouse_left", src: "assets/mame_mouse_left.png", frames: 4 },
            { type: "image", name: "mame_mouse_right", src: "assets/mame_mouse_right.png", frames: 4 },
            { type: "image", name: "mame_mouse_up", src: "assets/mame_mouse_up.png", frames: 4 },
            { type: "image", name: "mame_mouse_down", src: "assets/mame_mouse_down.png", frames: 4 },
            { type: "image", name: "lang_dog_left", src: "assets/lang_dog_left.png", frames: 8 },
            { type: "image", name: "lang_dog_right", src: "assets/lang_dog_right.png", frames: 8 },
            { type: "image", name: "lang_dog_up", src: "assets/lang_dog_up.png", frames: 4 },
            { type: "image", name: "lang_dog_down", src: "assets/lang_dog_down.png", frames: 4 },
            { type: "image", name: "sacred_slime_left", src: "assets/sacred_slime_left.png", frames: 2 },
            { type: "image", name: "sacred_slime_right", src: "assets/sacred_slime_right.png", frames: 2 },
            { type: "image", name: "sacred_slime_up", src: "assets/sacred_slime_up.png", frames: 2 },
            { type: "image", name: "sacred_slime_down", src: "assets/sacred_slime_down.png", frames: 2 },
            { type: "image", name: "violent_ghost_left", src: "assets/violent_ghost_left.png", frames: 4 },
            { type: "image", name: "violent_ghost_right", src: "assets/violent_ghost_right.png", frames: 4 },
            { type: "image", name: "violent_ghost_up", src: "assets/violent_ghost_up.png", frames: 4 },
            { type: "image", name: "violent_ghost_down", src: "assets/violent_ghost_down.png", frames: 4 },
            { type: "image", name: "treasure_box", src: "assets/treasure_box.png", frames: 1 },
            { type: "image", name: "floor", src: "assets/floor.png", frames: 1 },
            { type: "image", name: "wall", src: "assets/wall.png", frames: 1 },
            { type: "image", name: "goal", src: "assets/goal.png", frames: 1 },
            { type: "image", name: "player_left", src: "assets/player_left.png", frames: 7 },
            { type: "image", name: "player_right", src: "assets/player_right.png", frames: 7 },
            { type: "image", name: "player_up", src: "assets/player_up.png", frames: 7 },
            { type: "image", name: "player_down", src: "assets/player_down.png", frames: 7 },
            { type: "image", name: "level_up", src: "assets/level_up.png", frames: 20 },
            { type: "image", name: "treasure", src: "assets/treasure.png", frames: 1 },
            { type: "image", name: "twinkle", src: "assets/twinkle.png", frames: 5 },
        ];
        Asset.images = {};
        Asset.image_frames = {};
        Asset.loadAssets = function (onComplete) {
            var total = Asset.assets.length;
            var loadCount = 0;
            function onLoad() {
                loadCount++;
                if (loadCount >= total) {
                    onComplete();
                }
            }
            Asset.assets.forEach(function (asset) {
                switch (asset.type) {
                    case "image":
                        loadImage(asset, onLoad);
                        break;
                }
            });
        };
        function loadImage(asset, onLoad) {
            var image = new Image();
            image.onload = onLoad;
            image.src = asset.src;
            Asset.images[asset.name] = image;
        }
    })(Asset = main.Asset || (main.Asset = {}));
    function init() {
        canvas = document.getElementById('maincanvas');
        ctx = canvas.getContext('2d');
        canvas.width = view.window_usize.x * view.unit_size.x;
        canvas.height = view.window_usize.y * view.unit_size.y;
        canvas.addEventListener("touchstart", main.touchstart);
        canvas.addEventListener("touchmove", main.touchmove);
        ctx.textBaseline = "top";
        // image_frames
        Asset.assets.forEach(function (asset) {
            Asset.image_frames[asset.name] = asset.frames;
        });
        model.rank = 1;
        // エンティティの配置
        model.init_entities();
        // アイテム支給
        items.item_entities = [
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.onigiri),
            new items.ItemEntity(items.type.potion),
            new items.ItemEntity(items.type.silver_knife),
            new items.ItemEntity(items.type.revival),
            new items.ItemEntity(items.type.ghost_camouflage),
        ];
        Asset.loadAssets(function () {
            requestAnimationFrame(update);
        });
    }
    main.init = init;
    var lastTimestamp = null;
    function update(timestamp) {
        requestAnimationFrame(update);
        if (lastTimestamp != null) {
            main.sp60f = (timestamp - lastTimestamp) / 1000 * 60;
        }
        lastTimestamp = timestamp;
        // key inputs
        switch (main.menu_mode[0]) {
            case "dead":
                break;
            case "explore":
                if (!view.action_lock) {
                    var moved = keys.dir_key.add(model.player.upos);
                    if (!keys.dir_key.equals(model.dir.none) &&
                        /* 壁判定は move() と重複するが仕方なし */
                        map.inner(moved) &&
                        utils.all(model.get_entities_at(moved), function (e) { return !e.tile.isWall || e.status.hp == 0; }) &&
                        !map.field_at_tile(moved).isWall) {
                        model.move();
                    }
                    else if (keys.z_key) {
                        model.attack();
                    }
                    else if (keys.x_key) {
                        main.menu_mode = ["items"];
                        main.cursor["items"] = 0;
                        main.cursor_max["items"] = items.item_entities.length;
                    }
                    else if (keys.c_key) {
                        main.menu_mode = ["dist"];
                        main.cursor["dist"] = 0;
                        main.cursor_max["dist"] = 2;
                        main.point_distributed = { atk: 0, def: 0, rest: battle.dist_point };
                    }
                }
                break;
            case "items":
                if (keys.x_key) {
                    main.menu_mode.pop();
                    if (main.menu_mode.length == 0)
                        main.menu_mode = ["explore"];
                }
                else if (keys.z_key) {
                    switch (main.menu_mode.join(">")) {
                        case "items":
                            if (main.cursor_max["items"] != 0) {
                                main.menu_mode.push("command");
                                var mode = main.menu_mode.join(">");
                                main.cursor[mode] = 0;
                                main.cursor_max[mode] = items.item_entities[main.cursor["items"]].get_valid_commands().length;
                            }
                            break;
                        case "items>command":
                            var selected = items.item_entities[main.cursor["items"]];
                            var selected_command_name = selected.get_valid_commands()[main.cursor["items>command"]];
                            if (selected_command_name.indexOf("cannot_") == 0) {
                            }
                            else
                                switch (selected_command_name) {
                                    case "use":
                                        if (selected.item.delta_status.hp > 0)
                                            utils.start_tmp_num(selected.item.delta_status.hp, "springgreen", model.player.upos.mul(view.unit_size).sub(view.prefix_pos));
                                        model.player.status = model.player.status.add(selected.item.delta_status);
                                        var more_prop_names = ["effi", "heal"];
                                        more_prop_names.forEach(function (name) {
                                            if (name in selected.more_props)
                                                model.player.more_props[name] += selected.more_props[name];
                                        });
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        break;
                                    case "put":
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        break;
                                    case "equip":
                                        var old_eq = items.equips[selected.item.equip_region];
                                        if (old_eq.exist()) {
                                            items.item_entities.push(old_eq.get());
                                            main.cursor_max["items"]++;
                                        }
                                        items.equips[selected.item.equip_region] = utils.some(selected);
                                        model.player.status = model.tiles["player"].status.get().add(items.equips_status_sum());
                                        model.player.more_props = items.equips_more_props_sum();
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        break;
                                    case "cannot_equip":
                                        break;
                                    case "decode":
                                        battle.add_exp(selected.item.more_props["exp"]);
                                        items.item_entities.splice(main.cursor["items"], 1);
                                        main.cursor_max["items"]--;
                                        main.cursor["items"] = utils.limit(main.cursor["items"], 0, main.cursor_max["items"]);
                                        main.menu_mode.pop();
                                        break;
                                    default:
                                        throw "default reached";
                                }
                            break;
                        default:
                            throw "default reached";
                    }
                }
                else if (keys.dir_key2.equals(model.dir.down)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] + 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.up)) {
                    var mode = main.menu_mode.join(">");
                    main.cursor[mode] = utils.limit(main.cursor[mode] - 1, 0, main.cursor_max[mode]);
                }
                break;
            case "dist":
                var mode = main.menu_mode.join(">");
                var dist_props = ["atk", "def"];
                if (keys.x_key || keys.c_key) {
                    main.menu_mode.pop();
                    if (main.menu_mode.length == 0)
                        main.menu_mode = ["explore"];
                }
                else if (keys.z_key) {
                    model.player.status.atk += main.point_distributed.atk;
                    model.player.status.def += main.point_distributed.def;
                    main.point_distributed = { atk: 0, def: 0, rest: main.point_distributed.rest };
                    battle.dist_point = main.point_distributed.rest;
                }
                else if (keys.dir_key2.equals(model.dir.down)) {
                    main.cursor[mode] = utils.limit(main.cursor[mode] + 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.up)) {
                    main.cursor[mode] = utils.limit(main.cursor[mode] - 1, 0, main.cursor_max[mode]);
                }
                else if (keys.dir_key2.equals(model.dir.left)) {
                    if (main.point_distributed[dist_props[main.cursor[mode]]] > 0) {
                        main.point_distributed[dist_props[main.cursor[mode]]] -= point_dist_rate[dist_props[main.cursor[mode]]];
                        main.point_distributed.rest++;
                    }
                }
                else if (keys.dir_key2.equals(model.dir.right)) {
                    if (main.point_distributed.rest > 0) {
                        main.point_distributed.rest--;
                        main.point_distributed[dist_props[main.cursor[mode]]] += point_dist_rate[dist_props[main.cursor[mode]]];
                    }
                }
                break;
            default:
                throw "default reached";
        }
        keys.keyReset();
        render();
    }
    var render_cnt = 0;
    function render() {
        view.print(ctx, render_cnt);
        render_cnt++;
    }
    function keydown(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:
                keys.dir_key = model.dir.left;
                keys.dir_key2 = model.dir.left;
                break;
            case 38:
                keys.dir_key = model.dir.up;
                keys.dir_key2 = model.dir.up;
                break;
            case 39:
                keys.dir_key = model.dir.right;
                keys.dir_key2 = model.dir.right;
                break;
            case 40:
                keys.dir_key = model.dir.down;
                keys.dir_key2 = model.dir.down;
                break;
            case 90:
                keys.z_key = true;
                break;
            case 88:
                keys.x_key = true;
            case 67:
                keys.c_key = true;
            default:
                break;
        }
    }
    main.keydown = keydown;
    function keyup(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 37:
                if (keys.dir_key.equals(model.dir.left))
                    keys.dir_key = model.dir.none;
                break;
            case 38:
                if (keys.dir_key.equals(model.dir.up))
                    keys.dir_key = model.dir.none;
                break;
            case 39:
                if (keys.dir_key.equals(model.dir.right))
                    keys.dir_key = model.dir.none;
                break;
            case 40:
                if (keys.dir_key.equals(model.dir.down))
                    keys.dir_key = model.dir.none;
                break;
            default:
                break;
        }
    }
    main.keyup = keyup;
    function touchstart(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.targetTouches[0].clientX - rect.left;
        var y = e.targetTouches[0].clientY - rect.top;
        keys.touch_start_pos = utils.some(new utils.Pos(x, y));
    }
    main.touchstart = touchstart;
    function touchmove(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.changedTouches[0].clientX - rect.left;
        var y = e.changedTouches[0].clientY - rect.top;
        keys.touch_move_pos = utils.some(new utils.Pos(x, y));
    }
    main.touchmove = touchmove;
})(main || (main = {}));
window.addEventListener('load', main.init);
window.addEventListener("keydown", main.keydown);
window.addEventListener("keyup", main.keyup);
