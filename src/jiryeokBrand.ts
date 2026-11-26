// 지력사무소 핀볼 이름표(왼쪽 위, 미니맵 위): 힌콕 이름표 자리·크기 그대로, 업무 태블릿 제목 모양(그림 없이 글자만).
// 미니맵은 화면 폭 1280px보다 좁으면 비례해 줄어든다. 이름표도 같은 비율로 줄인다.
function syncMinimapScale() {
  const scale = Math.min(1, window.innerWidth / 1280);
  document.documentElement.style.setProperty('--mm-scale', String(scale));
}

export function setupJiryeokBrand() {
  if (typeof document === 'undefined') return;
  syncMinimapScale();
  window.addEventListener('resize', syncMinimapScale);
}
