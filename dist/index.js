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
var MINE = '💣';
var FLAG = '⛳️';
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
// 랜덤으로 지뢰를 심을지 안 심을지
function isEmptyZone() {
    return Boolean(Math.round(Math.random() * 3));
}
// 선택한 키를 중앙으로 두고 포지셔닝 확인
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
// 게임 승리 시
function gameWin() {
    canvas.style.pointerEvents = 'none';
    icon.textContent = '🥳';
    clearInterval(tick);
    timeCount.textContent = time + "s";
    result.textContent = "\uC131\uACF5! \uC2DC\uAC04 " + time + "s";
}
// 게임 패배 시
function gameSet() {
    canvas.style.pointerEvents = 'none';
    icon.textContent = '😅';
    clearInterval(tick);
    timeCount.textContent = time + "s";
    result.textContent = "\uC2E4\uD328.. \uC2DC\uAC04 " + time + "s";
}
// key 값에 위치한 버튼 오픈
function openTarget(key) {
    var button = document.querySelector("[data-pos='" + key + "']");
    // 플래그가 위치한 곳이었다면 지워줌
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
    // 모두 잘 열었으면 게임 승리
    if (map.size - minePlace.length === openCount) {
        gameWin();
    }
}
// 폭탄일시, 모든 폭탄 오픈
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
// 깃발을 설치된 지뢰 수 만큼 설치하게 되면 모두 오픈해 볼 수 있음.
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
    // 개발모드
    // onlyDev();
    if (MATRIX / 2 > minePlace.length) {
        retry();
    }
    console.log("\uD83D\uDD25 \uC9C0\uB8B0 " + minePlace.length + "\uAC1C \uC0DD\uC131! \uD83D\uDE00");
    // 최초 칸을 만들고, 그 Map을 일단 빈칸으로 채운다.
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
            // empty라면 근접한 모든 empty 오픈
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
    // 마인 심기
    function insertMine() {
        var e_4, _a;
        try {
            // 본격 마인 삽입
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
                // 마인 삽입 시, 주변 칸도 1씩 증가 시킴
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
    // 마인 몇개인지?
    function showMineCount() {
        mineCount.textContent = MINE + " " + minePlace.length;
    }
    // 경과 시간은?
    function showTimeCount() {
        timeCount.textContent = time + "s";
        tick = setInterval(function () {
            timeCount.textContent = ++time + "s";
        }, 1000);
    }
    // 다시
    function retry() {
        var e_6, _a;
        console.log('------ 다시 ------');
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
            icon.textContent = '🙂';
            result.textContent = '';
            map = new Map();
            flagPlace = [];
            minePlace = [];
            openCount = 0;
            time = 0;
            tick = 0;
        }
    }
    // 개발할때는 지뢰와 숫자가 잘 보여야지.
    function onlyDev() {
        var buttons = canvas.querySelectorAll('button');
        buttons.forEach(function (node) {
            var e_7, _a;
            try {
                for (var map_3 = __values(map), map_3_1 = map_3.next(); !map_3_1.done; map_3_1 = map_3.next()) {
                    var _b = __read(map_3_1.value, 1), mapKey = _b[0];
                    var key = toKey(mapKey);
                    if (node.dataset.pos === key) {
                        node.textContent = map.get(key) || '';
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (map_3_1 && !map_3_1.done && (_a = map_3.return)) _a.call(map_3);
                }
                finally { if (e_7) throw e_7.error; }
            }
        });
    }
}
init();
