type DifficultType = 'EASY' | 'MEDIUM' | 'HARD';

const canvas = document.getElementById('canvas')! as HTMLDivElement;
const icon = document.querySelector('.header-icon')! as HTMLSpanElement;
const mineCount = document.querySelector(
	'.header-mine-count'
)! as HTMLSpanElement;
const timeCount = document.querySelector(
	'.header-time-count'
)! as HTMLSpanElement;
const result = document.querySelector('.result')! as HTMLParagraphElement;
const allOpenBtn = document.querySelector('.all-btn')! as HTMLButtonElement;
const retryBtn = document.querySelector('.retry-btn')! as HTMLButtonElement;

const MATRIX: number = 9;
const BUTTON_SIZE: number = 30;
const MINE: string = '💣';
const FLAG: string = '⛳️';

let map = new Map<string, string>();
let flagPlace: string[] = [];
let minePlace: string[] = [];
let openCount: number = 0;
let time: number = 0;
let tick: number = 0;

function toKey(pos: string) {
	const [i, j] = pos.split('-');
	return `${i}-${j}`;
}

function fromKey(pos: string) {
	return pos.split('-').map((i) => +i);
}

function isMine(value: string) {
	return value === MINE;
}

// 랜덤으로 지뢰를 심을지 안 심을지
function isEmptyZone() {
	return Boolean(Math.round(Math.random() * 3));
}

// 선택한 키를 중앙으로 두고 포지셔닝 확인
function getBoundZones(key: string) {
	const [i, j] = fromKey(key);
	const boundZones = [
		[i - 1, j - 1],
		[i - 1, j],
		[i - 1, j + 1],
		[i, j - 1],
		[i, j + 1],
		[i + 1, j - 1],
		[i + 1, j],
		[i + 1, j + 1],
	];

	return boundZones.filter(
		([i, j]) => i >= 0 && j >= 0 && MATRIX > i && MATRIX > j
	);
}

// 게임 승리 시
function gameWin() {
	canvas.style.pointerEvents = 'none';
	icon.textContent = '🥳';
	clearInterval(tick);
	timeCount.textContent = `${time}`;
	result.textContent = `성공! 시간 ${time}s`;
}

// 게임 패배 시
function gameSet() {
	canvas.style.pointerEvents = 'none';
	icon.textContent = '😅';
	clearInterval(tick);
	timeCount.textContent = `${time}s`;
	result.textContent = `실패.. 시간 ${time}s`;
}

// key 값에 위치한 버튼 오픈
function openTarget(key: string) {
	const button = document.querySelector(
		`[data-pos='${key}']`
	) as HTMLButtonElement;

	// 플래그가 위치한 곳이었다면 지워줌
	if (flagPlace.includes(key)) {
		flagPlace = flagPlace.filter((flag) => flag !== key);
		activeAllOpenButton();
	}

	if (button.dataset.state === 'open') return;

	const value = map.get(key) || '';

	button.value = value;
	button.textContent = value;
	button.disabled = isMine(value) ? false : true;
	button.dataset.state = 'open';
	button.style.pointerEvents = 'none';
	openCount++;

	// 모두 잘 열었으면 게임 승리
	if (map.size - minePlace.length === openCount) {
		gameWin();
	}
}

// 폭탄일시, 모든 폭탄 오픈
function openBombs(key: string) {
	const button = document.querySelector(
		`[data-pos='${key}']`
	) as HTMLButtonElement;

	button.textContent = map.get(key) || '';
	button.style.background = '#dc5c5c';

	for (const place of minePlace) {
		const mine = document.querySelector(
			`[data-pos='${place}']`
		) as HTMLButtonElement;

		mine.textContent = map.get(place) || '';
		mine.style.background = '#dc5c5c';
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
		let isMine = 0;
		for (const [mapKey] of map) {
			const key = toKey(mapKey);

			if (!flagPlace.includes(key)) {
				openTarget(key);
				if (minePlace.includes(key)) {
					openBombs(key);
					isMine++;
				}
			}
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

	console.log(`🔥 지뢰 ${minePlace.length}개 생성! 😀`);

	// 최초 칸을 만들고, 그 Map을 일단 빈칸으로 채운다.
	function initialCells() {
		for (let i = 0; i < MATRIX; i++) {
			for (let j = 0; j < MATRIX; j++) {
				map.set(`${i}-${j}`, '');

				const button = createButtonElement(i, j);
				button.addEventListener('click', handleClick);
				button.addEventListener('contextmenu', handleContextMenu);
				canvas.appendChild(button);
				canvas.style.display = 'grid';
				canvas.style.gridTemplateColumns = `repeat(${MATRIX}, ${BUTTON_SIZE}px)`;
			}
		}

		function createButtonElement(i: number, j: number) {
			const button = document.createElement('button');
			button.style.border = '1px solid #dbdbdb';
			button.style.width = `${BUTTON_SIZE}px`;
			button.style.height = `${BUTTON_SIZE}px`;
			button.dataset.pos = `${i}-${j}`;
			return button;
		}

		function handleContextMenu(e: MouseEvent) {
			e.preventDefault();
			const target = e.target as HTMLButtonElement;
			const {
				textContent,
				dataset: { pos },
			} = target;

			if (!pos) return;

			if (textContent === FLAG) {
				flagPlace = flagPlace.filter((flag) => flag !== pos);
				target.textContent = '';
				activeAllOpenButton();
				return;
			}
			flagPlace.push(pos);
			target.textContent = FLAG;
			activeAllOpenButton();
		}

		function handleClick(e: MouseEvent) {
			const target = e.target as HTMLButtonElement;
			const {
				dataset: { pos },
			} = target;

			if (!pos) return;
			const key = toKey(pos);
			const targetValue = map.get(key);

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

			function emptyOpen(key: string) {
				setTimeout(() => {
					openTarget(key);
					let isEmpty = !map.get(key);
					if (isEmpty) {
						for (const [i, j] of getBoundZones(key)) {
							let key = toKey(`${i}-${j}`);
							const button = document.querySelector(
								`[data-pos='${i}-${j}']`
							) as HTMLButtonElement;
							if (button.dataset.state !== 'open') emptyOpen(key);
						}
					}
				}, 0);
			}
		}
	}

	// 마인 심기
	function insertMine() {
		// 본격 마인 삽입
		for (let [mapKey] of map) {
			const key = toKey(mapKey);
			map.set(key, randomMine(key));
		}

		function randomMine(key: string) {
			if (isEmptyZone()) {
				return map.get(key) || '';
			}

			// 마인 삽입 시, 주변 칸도 1씩 증가 시킴
			for (let [x, y] of getBoundZones(key)) {
				const target = Number(map.get(`${x}-${y}`));

				if (isFinite(target)) {
					map.set(`${x}-${y}`, String(target + 1));
				}
			}
			minePlace.push(key);
			return MINE;
		}
	}

	// 마인 몇개인지?
	function showMineCount() {
		mineCount.textContent = `${MINE} ${minePlace.length}`;
	}

	// 경과 시간은?
	function showTimeCount() {
		timeCount.textContent = `${time}s`;
		tick = setInterval(() => {
			timeCount.textContent = `${++time}s`;
		}, 1000);
	}

	// 다시
	function retry() {
		console.log('------ 다시 ------');

		for (const node of Array.from(canvas.childNodes)) {
			node.remove();
		}

		initializeState();
		init();

		function initializeState() {
			clearInterval(tick);
			retryBtn.removeEventListener('click', retry);
			canvas.style.pointerEvents = 'auto';
			icon.textContent = '🙂';
			result.textContent = '';
			map = new Map<string, string>();
			flagPlace = [];
			minePlace = [];
			openCount = 0;
			time = 0;
			tick = 0;
		}
	}

	// 개발할때는 지뢰와 숫자가 잘 보여야지.
	function onlyDev() {
		const buttons = canvas.querySelectorAll('button');

		buttons.forEach((node) => {
			for (const [mapKey] of map) {
				const key = toKey(mapKey);

				if (node.dataset.pos === key) {
					node.textContent = map.get(key) || '';
				}
			}
		});
	}
}

init();
