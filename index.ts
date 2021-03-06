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
const MINE: string = 'π£';
const FLAG: string = 'β³οΈ';

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

// λλ€μΌλ‘ μ§λ’°λ₯Ό μ¬μμ§ μ μ¬μμ§
function isEmptyZone() {
	return Boolean(Math.round(Math.random() * 3));
}

// μ νν ν€λ₯Ό μ€μμΌλ‘ λκ³  ν¬μ§μλ νμΈ
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

// κ²μ μΉλ¦¬ μ
function gameWin() {
	canvas.style.pointerEvents = 'none';
	icon.textContent = 'π₯³';
	clearInterval(tick);
	timeCount.textContent = `${time}s`;
	result.textContent = `μ±κ³΅! μκ° ${time}s`;
}

// κ²μ ν¨λ°° μ
function gameSet() {
	canvas.style.pointerEvents = 'none';
	icon.textContent = 'π';
	clearInterval(tick);
	timeCount.textContent = `${time}s`;
	result.textContent = `μ€ν¨.. μκ° ${time}s`;
}

// key κ°μ μμΉν λ²νΌ μ€ν
function openTarget(key: string) {
	const button = document.querySelector(
		`[data-pos='${key}']`
	) as HTMLButtonElement;

	// νλκ·Έκ° μμΉν κ³³μ΄μλ€λ©΄ μ§μμ€
	if (flagPlace.includes(key)) {
		flagPlace = flagPlace.filter((flag) => flag !== key);
		activeAllOpenButton();
	}

	if (button.disabled) return;

	const value = map.get(key) || '';

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

// κΉλ°μ μ€μΉλ μ§λ’° μ λ§νΌ μ€μΉνκ² λλ©΄ λͺ¨λ μ€νν΄ λ³Ό μ μμ.
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

	// κ°λ°λͺ¨λ
	// onlyDev();

	if (MATRIX / 2 > minePlace.length) {
		retry();
	}

	console.log(`π₯ μ§λ’° ${minePlace.length}κ° μμ±! π`);

	// μ΅μ΄ μΉΈμ λ§λ€κ³ , κ·Έ Mapμ μΌλ¨ λΉμΉΈμΌλ‘ μ±μ΄λ€.
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

			// emptyλΌλ©΄ κ·Όμ ν λͺ¨λ  empty μ€ν
			if (!targetValue) {
				emptyOpen(key);
			}

			function emptyOpen(key: string) {
				openTarget(key);
				let isEmpty = !map.get(key);
				if (isEmpty) {
					for (const [i, j] of getBoundZones(key)) {
						let key = toKey(`${i}-${j}`);
						const button = document.querySelector(
							`[data-pos='${i}-${j}']`
						) as HTMLButtonElement;
						if (!button.disabled) emptyOpen(key);
					}
				}
			}
		}
	}

	// λ§μΈ μ¬κΈ°
	function insertMine() {
		// λ³Έκ²© λ§μΈ μ½μ
		for (let [mapKey] of map) {
			const key = toKey(mapKey);
			map.set(key, randomMine(key));
		}

		function randomMine(key: string) {
			if (isEmptyZone()) {
				return map.get(key) || '';
			}

			// λ§μΈ μ½μ μ, μ£Όλ³ μΉΈλ 1μ© μ¦κ° μν΄
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

	// λ§μΈ λͺκ°μΈμ§?
	function showMineCount() {
		mineCount.textContent = `${MINE} ${minePlace.length}`;
	}

	// κ²½κ³Ό μκ°μ?
	function showTimeCount() {
		timeCount.textContent = `${time}s`;
		tick = setInterval(() => {
			timeCount.textContent = `${++time}s`;
		}, 1000);
	}

	// λ€μ
	function retry() {
		console.log('------ λ€μ ------');

		for (const node of Array.from(canvas.childNodes)) {
			node.remove();
		}

		initializeState();
		init();

		function initializeState() {
			clearInterval(tick);
			retryBtn.removeEventListener('click', retry);
			canvas.style.pointerEvents = 'auto';
			icon.textContent = 'π';
			result.textContent = '';
			map = new Map<string, string>();
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
