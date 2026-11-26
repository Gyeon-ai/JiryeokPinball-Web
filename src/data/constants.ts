import type { ColorTheme } from '../types/ColorTheme';

export const initialZoom = 30;
export const canvasWidth = 1600;
export const canvasHeight = 900;
export const zoomThreshold = 5;
export const STUCK_DELAY = 5000;
export const UI_FONT_FAMILY = `'Pretendard Variable', Pretendard, 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', system-ui, sans-serif`;
// 칠판 출근부(2026-11-27 지력사무소 판, 시안 `시안\지력사무소핀볼-칠판\`)의 캔버스용 색과 글꼴. 패널 쪽 값은 assets/style.scss의 :root.
// 경기장은 칠판, 미니맵·당첨 상자는 나무 틀을 두른 작은 칠판(이름은 다른 사이트와 맞추려고 DOT_ 그대로).
export const DOT_LINE = '#9a6a45'; // 나무 틀(미니맵·당첨 상자 테두리)
export const DOT_INK = '#26473b'; // 칠판 초록
export const DOT_TEXT_SOFT = '#e9e3d2'; // 분필 글자(순위 인원수)
export const DOT_ACCENT = '#f7d55c'; // 노랑 분필('당 첨' 글자)
export const DOT_RED = '#c2566a'; // 분홍 분필
export const NAME_FONT_FAMILY = `'Noto Sans KR', sans-serif`;
export const DOT_FONT_FAMILY = `'Noto Sans KR', sans-serif`;
export const NUMBER_FONT_FAMILY = `'Noto Sans KR', sans-serif`;
export const WINNER_NAME_FONT_FAMILY = `'Noto Sans KR', sans-serif`;

export enum Skills {
  None,
  Impact,
}

export const Themes: Record<string, ColorTheme> = {
  light: {
    background: '#eee',
    marbleLightness: 50,
    marbleWinningBorder: 'black',
    skillColor: '#69c',
    coolTimeIndicator: '#999',
    entity: {
      box: {
        fill: '#226f92',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
      circle: {
        fill: 'yellow',
        outline: '#ed7e11',
        bloom: 'yellow',
        bloomRadius: 0,
      },
      polyline: {
        fill: 'white',
        outline: 'black',
        bloom: 'cyan',
        bloomRadius: 0,
      },
    },
    rankStroke: 'black',
    minimapBackground: '#fefefe',
    minimapViewport: '#6699cc',

    winnerBackground: 'rgba(255, 255, 255, 0.5)',
    winnerOutline: 'black',
    winnerText: '#cccccc',
  },
  dark: {
    background: '#26473b', // 지력사무소 판(2026-11-27 칠판 출근부): 칠판 초록, 바는 노랑 분필, 핀은 분홍 분필, 벽은 흰 분필
    marbleLightness: 80, // 75 → 80: 칠판 초록 위 순위 이름(외곽선 없음)이 잘 보이게(가장 어두운 파랑 명암비 3.1 → 4.1)
    marbleWinningBorder: 'white',
    skillColor: 'white',
    coolTimeIndicator: 'red',
    entity: {
      box: {
        fill: '#f7d55c',
        outline: '#f7d55c',
        bloom: '#f7d55c',
        bloomRadius: 6,
      },
      circle: {
        fill: '#f2a0b0',
        outline: '#f2a0b0',
        bloom: '#f2a0b0',
        bloomRadius: 6,
      },
      polyline: {
        fill: '#ece7d6',
        outline: '#ece7d6',
        bloom: '#f6f3e8',
        bloomRadius: 8,
      },
    },
    rankStroke: '',
    minimapBackground: '#1f3c32',
    minimapViewport: '#f6f3e8',
    winnerBackground: 'rgba(38, 71, 59, 0.97)',
    winnerOutline: '',
    winnerText: 'white',
  },
};
