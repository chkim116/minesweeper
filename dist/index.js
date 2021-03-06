"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var canvas = document.getElementById('canvas');
var icon = document.querySelector('.header-icon');
var mineCount = document.querySelector('.header-mine-count');
var timeCount = document.querySelector('.header-time-count');
var result = document.querySelector('.result');
var allOpenBtn = document.querySelector('.all-btn');
var retryBtn = document.querySelector('.retry-btn');
var MATRIX = 9;
var BUTTON_SIZE = 30;
var MINE = 'π£';
var FLAG = 'β³οΈ';
var map = new Map();
var flagPlace = [];
var minePlace = [];
var openCount = 0;
var time = 0;
var tick = 0;
function toKey(pos) {
    var _a = __read(pos.split('-'), 2), i = _a[0], j = _a[1];
    return i + "-" + j;
}
function fromKey(pos) {
    return pos.split('-').map(function (i) { return +i; });
}
function isMine(value) {
    return value === MINE;
}
// λλ€μΌλ‘ μ§λ’°λ₯Ό μ¬μμ§ μ μ¬μμ§
function isEmptyZone() {
    return Boolean(Math.round(Math.random() * 3));
}
// μ νν ν€λ₯Ό μ€μμΌλ‘ λκ³  ν¬μ§μλ νμΈ
function getBoundZones(key) {
    var _a = __read(fromKey(key), 2), i = _a[0], j = _a[1];
    var boundZones = [
        [i - 1, j - 1],
        [i - 1, j],
        [i - 1, j + 1],
        [i, j - 1],
        [i, j + 1],
        [i + 1, j - 1],
        [i + 1, j],
        [i + 1, j + 1],
    ];
    return boundZones.filter(function (_a) {
        var _b = __read(_a, 2), i = _b[0], j = _b[1];
        return i >= 0 && j >= 0 && MATRIX > i && MATRIX > j;
    });
}
// κ²μ μΉλ¦¬ μ
function gameWin() {
    canvas.style.pointerEvents = 'none';
    icon.textContent = 'π₯³';
    clearInterval(tick);
    timeCount.textContent = time + "s";
    result.textContent = "\uC131\uACF5! \uC2DC\uAC04 " + time + "s";
}
// κ²μ ν¨λ°° μ
function gameSet() {
    canvas.style.pointerEvents = 'none';
    icon.textContent = 'π';
    clearInterval(tick);
    timeCount.textContent = time + "s";
    result.textContent = "\uC2E4\uD328.. \uC2DC\uAC04 " + time + "s";
}
// key κ°μ μμΉν λ²νΌ μ€ν
function openTarget(key) {
    var button = document.querySelector("[data-pos='" + key + "']");
    // νλκ·Έκ° μμΉν κ³³μ΄μλ€λ©΄ μ§μμ€
    if (flagPlace.includes(key)) {
        flagPlace = flagPlace.filter(function (flag) { return flag !== key; });
        activeAllOpenButton();
    }
    if (button.disabled)
        return;
    var value = map.get(key) || '';
    button.value = value;
    button.textContent = value;
    button.disabled = isMine(value) ? false : true;
    button.style.pointerEvents = 'none';
    openCount++;
    // λͺ¨λ μ μ΄μμΌλ©΄ κ²μ μΉλ¦¬
    if (map.size - minePlace.length === openCount) {
        gameWin();
    }
}
// ν­νμΌμ, λͺ¨λ  ν­ν μ€ν
function openBombs(key) {
    var e_1, _a;
    var button = document.querySelector("[data-pos='" + key + "']");
    button.textContent = map.get(key) || '';
    button.style.background = '#dc5c5c';
    try {
        for (var minePlace_1 = __values(minePlace), minePlace_1_1 = minePlace_1.next(); !minePlace_1_1.done; minePlace_1_1 = minePlace_1.next()) {
            var place = minePlace_1_1.value;
            var mine = document.querySelector("[data-pos='" + place + "']");
            mine.textContent = map.get(place) || '';
            mine.style.background = '#dc5c5c';
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (minePlace_1_1 && !minePlace_1_1.done && (_a = minePlace_1.return)) _a.call(minePlace_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
// κΉλ°μ μ€μΉλ μ§λ’° μ λ§νΌ μ€μΉνκ² λλ©΄ λͺ¨λ μ€νν΄ λ³Ό μ μμ.
function activeAllOpenButton() {
    if (flagPlace.length === minePlace.length) {
        allOpenBtn.disabled = false;
        allOpenBtn.addEventListener('click', handleClickAllOpen);
        return;
    }
    allOpenBtn.disabled = true;
    function handleClickAllOpen() {
        var e_2, _a;
        var isMine = 0;
        try {
            for (var map_1 = __values(map), map_1_1 = map_1.next(); !map_1_1.done; map_1_1 = map_1.next()) {
                var _b = __read(map_1_1.value, 1), mapKey = _b[0];
                var key = toKey(mapKey);
                if (!flagPlace.includes(key)) {
                    openTarget(key);
                    if (minePlace.includes(key)) {
                        openBombs(key);
                        isMine++;
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (map_1_1 && !map_1_1.done && (_a = map_1.return)) _a.call(map_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (isMine !== 0) {
            gameSet();
        }
        allOpenBtn.removeEventListener('click', handleClickAllOpen);
    }
}
function init() {
    initialCells();
    insertMine();
    showMineCount();
    showTimeCount();
    retryBtn.addEventListener('click', retry);
    // κ°λ°λͺ¨λ
    // onlyDev();
    if (MATRIX / 2 > minePlace.length) {
        retry();
    }
    console.log("\uD83D\uDD25 \uC9C0\uB8B0 " + minePlace.length + "\uAC1C \uC0DD\uC131! \uD83D\uDE00");
    // μ΅μ΄ μΉΈμ λ§λ€κ³ , κ·Έ Mapμ μΌλ¨ λΉμΉΈμΌλ‘ μ±μ΄λ€.
    function initialCells() {
        for (var i = 0; i < MATRIX; i++) {
            for (var j = 0; j < MATRIX; j++) {
                map.set(i + "-" + j, '');
                var button = createButtonElement(i, j);
                button.addEventListener('click', handleClick);
                button.addEventListener('contextmenu', handleContextMenu);
                canvas.appendChild(button);
                canvas.style.display = 'grid';
                canvas.style.gridTemplateColumns = "repeat(" + MATRIX + ", " + BUTTON_SIZE + "px)";
            }
        }
        function createButtonElement(i, j) {
            var button = document.createElement('button');
            button.style.border = '1px solid #dbdbdb';
            button.style.width = BUTTON_SIZE + "px";
            button.style.height = BUTTON_SIZE + "px";
            button.dataset.pos = i + "-" + j;
            return button;
        }
        function handleContextMenu(e) {
            e.preventDefault();
            var target = e.target;
            var textContent = target.textContent, pos = target.dataset.pos;
            if (!pos)
                return;
            if (textContent === FLAG) {
                flagPlace = flagPlace.filter(function (flag) { return flag !== pos; });
                target.textContent = '';
                activeAllOpenButton();
                return;
            }
            flagPlace.push(pos);
            target.textContent = FLAG;
            activeAllOpenButton();
        }
        function handleClick(e) {
            var target = e.target;
            var pos = target.dataset.pos;
            if (!pos)
                return;
            var key = toKey(pos);
            var targetValue = map.get(key);
            if (targetValue) {
                if (isMine(targetValue)) {
                    openBombs(key);
                    gameSet();
                    return;
                }
                openTarget(key);
                return;
            }
            // emptyλΌλ©΄ κ·Όμ ν λͺ¨λ  empty μ€ν
            if (!targetValue) {
                emptyOpen(key);
            }
            function emptyOpen(key) {
                var e_3, _a;
                openTarget(key);
                var isEmpty = !map.get(key);
                if (isEmpty) {
                    try {
                        for (var _b = __values(getBoundZones(key)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var _d = __read(_c.value, 2), i = _d[0], j = _d[1];
                            var key_1 = toKey(i + "-" + j);
                            var button = document.querySelector("[data-pos='" + i + "-" + j + "']");
                            if (!button.disabled)
                                emptyOpen(key_1);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
        }
    }
    // λ§μΈ μ¬κΈ°
    function insertMine() {
        var e_4, _a;
        try {
            // λ³Έκ²© λ§μΈ μ½μ
            for (var map_2 = __values(map), map_2_1 = map_2.next(); !map_2_1.done; map_2_1 = map_2.next()) {
                var _b = __read(map_2_1.value, 1), mapKey = _b[0];
                var key = toKey(mapKey);
                map.set(key, randomMine(key));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (map_2_1 && !map_2_1.done && (_a = map_2.return)) _a.call(map_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        function randomMine(key) {
            var e_5, _a;
            if (isEmptyZone()) {
                return map.get(key) || '';
            }
            try {
                // λ§μΈ μ½μ μ, μ£Όλ³ μΉΈλ 1μ© μ¦κ° μν΄
                for (var _b = __values(getBoundZones(key)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), x = _d[0], y = _d[1];
                    var target = Number(map.get(x + "-" + y));
                    if (isFinite(target)) {
                        map.set(x + "-" + y, String(target + 1));
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            minePlace.push(key);
            return MINE;
        }
    }
    // λ§μΈ λͺκ°μΈμ§?
    function showMineCount() {
        mineCount.textContent = MINE + " " + minePlace.length;
    }
    // κ²½κ³Ό μκ°μ?
    function showTimeCount() {
        timeCount.textContent = time + "s";
        tick = setInterval(function () {
            timeCount.textContent = ++time + "s";
        }, 1000);
    }
    // λ€μ
    function retry() {
        var e_6, _a;
        console.log('------ λ€μ ------');
        try {
            for (var _b = __values(Array.from(canvas.childNodes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var node = _c.value;
                node.remove();
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        initializeState();
        init();
        function initializeState() {
            clearInterval(tick);
            retryBtn.removeEventListener('click', retry);
            canvas.style.pointerEvents = 'auto';
            icon.textContent = 'π';
            result.textContent = '';
            map = new Map();
            flagPlace = [];
            minePlace = [];
            openCount = 0;
            time = 0;
            tick = 0;
        }
    }
    // κ°λ°ν λλ μ§λ’°μ μ«μκ° μ λ³΄μ¬μΌμ§.
    // function onlyDev() {
    // 	const buttons = canvas.querySelectorAll('button');
    // 	buttons.forEach((node) => {
    // 		for (const [mapKey] of map) {
    // 			const key = toKey(mapKey);
    // 			if (node.dataset.pos === key) {
    // 				node.textContent = map.get(key) || '';
    // 			}
    // 		}
    // 	});
    // }
}
init();
