// 지력사무소 핀볼의 공 그림(2026-11-26, 얼굴 B안): 사원 10명의 얼굴을 동그랗게 잘라 테두리에 직책 색을 두른다.
// 얼굴 그림은 assets/faces/*.png(원본 384×384). 허락받아 이 사이트에서만 쓰며 MIT 대상이 아니다. 재배포하지 않는다.
// 공마다 10명 중 누구 얼굴을 쓸지는 참가자 이름의 해시로 고른다(같은 이름은 항상 같은 얼굴, 힌콕 공과 같은 방식).
// 공 크기·물리는 그대로이고 그림만 바꾼다. 못 불러온 얼굴은 직책 색 테두리의 빈 동그라미로 그린다.
// 확인용 주소: ?faces=0 이면 얼굴을 불러오지 않고 빈 동그라미만 쓴다.

/** 직책별 테두리 색(대장 전달, 2026-11-26) */
export const ROLE_COLORS = {
  소장: '#f2b84b',
  반장: '#7fb0ff',
  비서: '#7fb0ff',
  사원: '#c9d3e3',
} as const;

type Role = keyof typeof ROLE_COLORS;

/** 사원 10명(순서 고정: 해시 결과가 바뀌지 않게 순서를 바꾸지 않는다) */
const STAFF: { name: string; role: Role; url: string }[] = [
  { name: '지피티', role: '소장', url: new URL('../assets/faces/gpt.png', import.meta.url).toString() },
  { name: '라무', role: '반장', url: new URL('../assets/faces/ramu.png', import.meta.url).toString() },
  { name: '한아련', role: '비서', url: new URL('../assets/faces/hanaryeon.png', import.meta.url).toString() },
  { name: '싱유', role: '사원', url: new URL('../assets/faces/singyu.png', import.meta.url).toString() },
  { name: '모나양', role: '사원', url: new URL('../assets/faces/monayang.png', import.meta.url).toString() },
  { name: '김병살', role: '사원', url: new URL('../assets/faces/kimbyeongsal.png', import.meta.url).toString() },
  { name: '김쿼카', role: '사원', url: new URL('../assets/faces/kimquokka.png', import.meta.url).toString() },
  { name: '목츄리', role: '사원', url: new URL('../assets/faces/mokchuri.png', import.meta.url).toString() },
  { name: '메루', role: '사원', url: new URL('../assets/faces/meru.png', import.meta.url).toString() },
  { name: '이투', role: '사원', url: new URL('../assets/faces/itu.png', import.meta.url).toString() },
];

const LOAD_TIMEOUT_MS = 6000;
const FACES_ON = new URLSearchParams(globalThis.location?.search ?? '').get('faces') !== '0';

/** 공 그림 한 장의 크기(px). 경기 중에는 공 크기에 맞춰 줄여 그린다 */
const SIZE = 192;
/** 테두리 두께(그림 폭 대비). 2026-11-26 사용자 "흰 테두리가 좀 굵어보이거든? 얇게 해봐": 0.09 → 0.045 */
const RING = 0.045;

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (value: HTMLImageElement | null) => {
      if (done) return;
      done = true;
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), LOAD_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      finish(img.naturalWidth > 0 ? img : null);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = url;
  });
}

/** 얼굴을 동그랗게 잘라 직책 색 테두리를 두른 공 그림 */
function makeBall(face: HTMLImageElement | null, ringColor: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const c = SIZE / 2;
  const ring = SIZE * RING;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c - ring, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#dde4ee';
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (face) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const inner = SIZE - ring * 2;
    ctx.drawImage(face, ring, ring, inner, inner);
  }
  ctx.restore();
  return canvas;
}

let balls: HTMLCanvasElement[] = [];
let sources: ('face' | 'blank')[] = [];
let loading: Promise<HTMLCanvasElement[]> | null = null;

/** 10명 공 그림을 한 번만 준비한다 */
export function loadJiryeokBalls(): Promise<HTMLCanvasElement[]> {
  if (typeof document === 'undefined') return Promise.resolve([]);
  if (!loading) {
    loading = (async () => {
      const faces = FACES_ON ? await Promise.all(STAFF.map((s) => loadImage(s.url))) : STAFF.map(() => null);
      balls = STAFF.map((s, i) => makeBall(faces[i], ROLE_COLORS[s.role]));
      sources = faces.map((f) => (f ? 'face' : 'blank'));
      return balls;
    })();
  }
  return loading;
}

function nameHash(name: string): number {
  let hash = 0;
  for (const character of name) hash = (Math.imul(hash, 31) + (character.codePointAt(0) ?? 0)) >>> 0;
  // 마지막에 한 번 섞는다(murmur3 fmix32). 31을 곱하는 해시만으로는 10으로 나눈 나머지가 글자 코드의 합에만 따라가서
  // 10명이 고루 나오지 않았다(2026-11-26 이름 6,480개 시험: 331~928개로 치우침).
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/** 이름 → 사원 번호. 사원 이름과 똑같으면(앞뒤 빈칸 무시) 그 사원 얼굴, 아니면 이름 해시로 10명 중 1명
 *  (2026-11-26 사용자 "각자 애들 이름은 그 얼굴로 나오게하고 나머지는 랜덤으로") */
function staffIndexOf(name: string): number {
  const own = STAFF.findIndex((s) => s.name === name.trim());
  return own >= 0 ? own : nameHash(name) % STAFF.length;
}

/** 같은 이름은 항상 같은 얼굴. 아직 준비 전이면 undefined(색 공으로 그린다) */
export function getJiryeokBall(name: string): HTMLCanvasElement | undefined {
  if (balls.length === 0) return undefined;
  return balls[staffIndexOf(name)];
}

/** 이름이 어느 사원 얼굴을 쓰는지(확인용) */
export function jiryeokStaffOf(name: string): string {
  return STAFF[staffIndexOf(name)].name;
}

/** 지력사무소 공 그림인지 */
export function isJiryeokBall(image: unknown): boolean {
  return typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement && balls.includes(image);
}

// 확인용: 브라우저 콘솔에서 사원 목록·불러온 결과·이름별 얼굴을 볼 수 있게 열어 둔다
(globalThis as any).__jiryeokBalls = {
  staff: () => STAFF.map((s, i) => ({ name: s.name, role: s.role, ring: ROLE_COLORS[s.role], source: sources[i] })),
  of: jiryeokStaffOf,
  list: () => balls,
};
