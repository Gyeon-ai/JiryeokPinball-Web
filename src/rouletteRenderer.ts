import type { Camera } from './camera';
import { getJiryeokBall, loadJiryeokBalls } from './jiryeokBall';
import {
  canvasHeight,
  canvasWidth,
  DOT_ACCENT,
  DOT_LINE,
  DOT_FONT_FAMILY,
  initialZoom,
  NAME_FONT_FAMILY,
  NUMBER_FONT_FAMILY,
  Themes,
  UI_FONT_FAMILY,
  WINNER_NAME_FONT_FAMILY,
} from './data/constants';

/** 당첨 상자 '당 첨' 분필 손글씨 글꼴(index.html에서 Google Fonts로 불러옴) */
const CHALK_HAND_FONT_FAMILY = `'Nanum Pen Script', ${DOT_FONT_FAMILY}`;
import type { StageDef } from './data/maps';
import type { GameObject } from './gameObject';
import type { Marble } from './marble';
import type { ParticleManager } from './particleManager';
import type { ColorTheme } from './types/ColorTheme';
import type { MapEntityState } from './types/MapEntity.type';
import type { VectorLike } from './types/VectorLike';
import type { UIObject } from './UIObject';

export type RenderParameters = {
  camera: Camera;
  stage: StageDef;
  entities: MapEntityState[];
  marbles: Marble[];
  winners: Marble[];
  particleManager: ParticleManager;
  effects: GameObject[];
  winnerRank: number;
  winner: Marble | null;
  size: VectorLike;
  theme: ColorTheme;
  interpolation: number;
};

const MAX_DISPLAY_WIDTH = 1920;
// 타이머 상자와 당첨 상자 사이를 더 띄우는 거리(CSS px)
const WINNER_PANEL_DROP = 16;

export class RouletteRenderer {
  protected _canvas!: HTMLCanvasElement;
  protected _sceneCanvas!: HTMLCanvasElement;
  protected ctx!: CanvasRenderingContext2D;
  private _displayCtx!: CanvasRenderingContext2D;
  public sizeFactor = 1;

  protected _theme: ColorTheme = Themes.dark;
  get width() {
    return this._sceneCanvas.width;
  }

  get height() {
    return this._sceneCanvas.height;
  }

  get canvas() {
    return this._canvas;
  }

  set theme(value: ColorTheme) {
    this._theme = value;
  }

  async init() {
    await this._load();

    this._canvas = document.createElement('canvas');
    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;
    this._displayCtx = this._canvas.getContext('2d', {
      alpha: false,
    }) as CanvasRenderingContext2D;

    this._sceneCanvas = document.createElement('canvas');
    this._sceneCanvas.width = canvasWidth;
    this._sceneCanvas.height = canvasHeight;
    this.ctx = this._sceneCanvas.getContext('2d', {
      alpha: false,
    }) as CanvasRenderingContext2D;

    document.body.appendChild(this._canvas);

    const resizing = (entries?: ResizeObserverEntry[]) => {
      const realSize = entries ? entries[0].contentRect : this._canvas.getBoundingClientRect();
      if (realSize.width <= 0 || realSize.height <= 0) return;

      const width = Math.max(realSize.width / 2, 640);
      const height = (width / realSize.width) * realSize.height;
      this._sceneCanvas.width = width;
      this._sceneCanvas.height = height;
      this.sizeFactor = width / realSize.width;

      const displayWidth = Math.min(realSize.width, MAX_DISPLAY_WIDTH);
      this._canvas.width = displayWidth;
      this._canvas.height = (displayWidth / realSize.width) * realSize.height;
    };

    const resizeObserver = new ResizeObserver(resizing);

    resizeObserver.observe(this._canvas);
    resizing();
  }

  /**
   * Request the web-font glyphs for these names ahead of time. The winner name and rank list fonts are
   * served in pieces by character, so without this the winner name is first drawn in a fallback font
   * and switches a moment later. Fire-and-forget; drawing never waits for it.
   */
  preloadNameFonts(names: string[]) {
    if (typeof document === 'undefined' || !document.fonts) return;
    const glyphs = Array.from(new Set(Array.from(names.join('')))).join('');
    if (!glyphs) return;
    for (const font of [`400 12px ${NAME_FONT_FAMILY}`, `700 12px ${NAME_FONT_FAMILY}`, `48px ${WINNER_NAME_FONT_FAMILY}`]) {
      document.fonts.load(font, glyphs).catch(() => {});
    }
  }

  private async _loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((rs) => {
      const img = new Image();
      img.addEventListener('load', () => {
        rs(img);
      });
      img.src = url;
    });
  }

  private async _load(): Promise<void> {
    // 캔버스에 쓰는 웹폰트를 미리 요청해 둔다. 기다리지는 않는다(늦게 오면 그때부터 그 글꼴로 그려진다).
    if (typeof document !== 'undefined' && document.fonts) {
      for (const font of [
        `400 12px ${NAME_FONT_FAMILY}`,
        `700 12px ${NAME_FONT_FAMILY}`,
        `700 12px ${DOT_FONT_FAMILY}`,
        `600 11px ${NUMBER_FONT_FAMILY}`,
        `700 48px ${WINNER_NAME_FONT_FAMILY}`,
        `400 48px ${CHALK_HAND_FONT_FAMILY}`, // 당첨 상자 '당 첨' 분필 손글씨(첫 당첨 때 글씨체가 바뀌어 보이지 않게)
      ]) {
        document.fonts.load(font, '당첨 0123#').catch(() => {});
      }
    }
    await loadJiryeokBalls(); // 사원 10명 얼굴 공을 경기 전에 한 번만 준비한다(src/jiryeokBall.ts)
  }

  // 지력사무소 판: 공 그림은 사원 10명 얼굴 중 하나(이름 해시, 같은 이름은 항상 같은 얼굴. 힌콕과 같은 방식)
  private getMarbleImage(name: string): HTMLCanvasElement | undefined {
    return getJiryeokBall(name);
  }

  protected onBeforeEntities(): void {}
  protected onAfterScene(): void {}
  render(renderParameters: RenderParameters, uiObjects: UIObject[]) {
    this._theme = renderParameters.theme;
    this.ctx.fillStyle = this._theme.background;
    this.ctx.fillRect(0, 0, this._sceneCanvas.width, this._sceneCanvas.height);

    this.ctx.save();
    this.ctx.scale(initialZoom, initialZoom);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.font = `400 0.4pt ${UI_FONT_FAMILY}`;
    this.ctx.lineWidth = 3 / (renderParameters.camera.zoom + initialZoom);
    let marbleTransform: DOMMatrix | null = null;
    renderParameters.camera.renderScene(this.ctx, () => {
      this.onBeforeEntities();
      this.renderEntities(renderParameters.entities);
      this.renderEffects(renderParameters);
      marbleTransform = this.ctx.getTransform();
    });
    this.ctx.restore();
    this.onAfterScene();

    // Keep the map at scene resolution, but draw marbles and UI at display resolution.
    this._displayCtx.drawImage(this._sceneCanvas, 0, 0, this._canvas.width, this._canvas.height);
    const displayScale = this._canvas.width / this._sceneCanvas.width;
    if (marbleTransform) {
      const transform: DOMMatrix = marbleTransform;
      this._displayCtx.save();
      this._displayCtx.setTransform(
        transform.a * displayScale,
        transform.b * displayScale,
        transform.c * displayScale,
        transform.d * displayScale,
        transform.e * displayScale,
        transform.f * displayScale
      );
      this.renderMarbles(renderParameters, this._displayCtx);
      this._displayCtx.restore();
    }

    this._displayCtx.save();
    this._displayCtx.scale(displayScale, displayScale);
    uiObjects.forEach((obj) =>
      obj.render(this._displayCtx, renderParameters, this._sceneCanvas.width, this._sceneCanvas.height)
    );
    renderParameters.particleManager.render(this._displayCtx);
    this._displayCtx.restore();

    this.renderWinner(renderParameters, this._displayCtx, this._canvas.width, this._canvas.height);
  }

  private renderEntities(entities: MapEntityState[]) {
    this.ctx.save();
    entities.forEach((entity) => {
      const transform = this.ctx.getTransform();
      this.ctx.translate(entity.x, entity.y);
      this.ctx.rotate(entity.angle);
      this.ctx.fillStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].fill;
      this.ctx.strokeStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].outline;
      this.ctx.shadowBlur = this._theme.entity[entity.shape.type].bloomRadius;
      this.ctx.shadowColor =
        entity.shape.bloomColor ?? entity.shape.color ?? this._theme.entity[entity.shape.type].bloom;
      const shape = entity.shape;
      switch (shape.type) {
        case 'polyline':
          if (shape.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.points[0][0], shape.points[0][1]);
            for (let i = 1; i < shape.points.length; i++) {
              this.ctx.lineTo(shape.points[i][0], shape.points[i][1]);
            }
            this.ctx.stroke();
          }
          break;
        case 'box': {
          const w = shape.width * 2;
          const h = shape.height * 2;
          this.ctx.rotate(shape.rotation);
          this.ctx.fillRect(-w / 2, -h / 2, w, h);
          this.ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        }
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, shape.radius, 0, Math.PI * 2, false);
          this.ctx.stroke();
          break;
      }

      this.ctx.setTransform(transform);
    });
    this.ctx.restore();
  }

  private renderEffects({ effects, camera }: RenderParameters) {
    effects.forEach((effect) => effect.render(this.ctx, camera.zoom * initialZoom, this._theme));
  }

  private renderMarbles({ marbles, camera, winnerRank, winners, size, interpolation }: RenderParameters, ctx: CanvasRenderingContext2D) {
    const winnerIndex = winnerRank - winners.length;

    const viewPort = { x: camera.x, y: camera.y, w: size.x, h: size.y, zoom: camera.zoom * initialZoom };
    marbles.forEach((marble, i) => {
      marble.render(
        ctx,
        camera.zoom * initialZoom,
        i === winnerIndex,
        false,
        this.getMarbleImage(marble.name),
        viewPort,
        this._theme,
        interpolation
      );
    });
  }

  private renderWinner(
    { winner, theme }: RenderParameters,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    if (!winner) return;
    const canvasRect = this._canvas.getBoundingClientRect();
    const timerRect = document.getElementById('resultTimerOverlay')?.getBoundingClientRect();
    if (!timerRect || canvasRect.width <= 0) return;

    const cssScale = width / canvasRect.width;
    const settingsRect = document.getElementById('settings')?.getBoundingClientRect();
    const settingsTop = settingsRect?.height ? settingsRect.top : canvasRect.bottom - 150;
    const roomBelowTimer = (settingsTop - timerRect.bottom - 30 - WINNER_PANEL_DROP) / 156;
    const winnerScale = Math.max(1, Math.min(2, canvasRect.width / 960, roomBelowTimer));
    const panelWidth = Math.min(timerRect.width * winnerScale * cssScale, width - 32 * cssScale);
    const panelX = (timerRect.left + timerRect.width / 2 - canvasRect.left) * cssScale - panelWidth / 2;
    const panelY = (timerRect.bottom - canvasRect.top + 14 + WINNER_PANEL_DROP) * cssScale;
    const panelHeight = Math.min(156 * winnerScale * cssScale, height - panelY - 16 * cssScale);
    if (panelHeight < 72 * cssScale) return;

    ctx.save();
    // 칠판 출근부: 작은 칠판(바탕 winnerBackground) + 나무 틀 테두리(#9a6a45, 두께 2.5배)
    const radius = 22 * winnerScale * cssScale;
    const edge = Math.max(2, Math.round(3 * winnerScale * cssScale));
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, radius);
    ctx.fillStyle = theme.winnerBackground;
    ctx.fill();
    ctx.lineWidth = edge * 2.5;
    ctx.strokeStyle = DOT_LINE;
    ctx.stroke();

    // Keep enlarged pixel art crisp; smooth only when shrinking a source image.
    const marbleImage = this.getMarbleImage(winner.name);
    const marbleSize = Math.min(92 * winnerScale * cssScale, panelHeight * .54);
    const nameCenterY = panelY + panelHeight * .7;
    const marbleCenterY = nameCenterY;

    const textWidth = Math.max(1, panelWidth - marbleSize - 54 * winnerScale * cssScale);
    const sidePadding = 18 * winnerScale * cssScale;
    const nameGap = 18 * winnerScale * cssScale;
    // '당첨' 글자는 상자 정가운데
    const panelCenterX = panelX + panelWidth / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // '당 첨'은 분필 손글씨(2026-11-27 사용자 "A로 바꿔줘", 시안 `시안\지력사무소핀볼-칠판\당첨글씨.html` A안):
    // Nanum Pen Script, 예전 글씨의 약 1.83배, 노랑 분필, 살짝(-0.04rad) 기울이고 아래에 흰 분필 밑줄
    const labelSize = Math.min(55 * winnerScale * cssScale, panelHeight * .37);
    const labelY = panelY + panelHeight * .26;
    ctx.save();
    ctx.translate(panelCenterX, labelY);
    ctx.rotate(-0.04);
    ctx.font = `400 ${labelSize}px ${CHALK_HAND_FONT_FAMILY}`;
    ctx.fillStyle = DOT_ACCENT; // 노랑 분필, 그림자 없이
    ctx.fillText('당 첨', 0, 0); // 2026-11-27 사용자 "당 첨으로 바꿔"
    ctx.strokeStyle = 'rgba(246, 243, 232, .85)';
    ctx.lineWidth = labelSize * .064;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-.91 * labelSize, .51 * labelSize);
    ctx.quadraticCurveTo(0, .44 * labelSize, .95 * labelSize, .53 * labelSize);
    ctx.stroke();
    ctx.restore();

    const characters = Array.from(winner.name);
    const maxNameSize = Math.min(58 * winnerScale * cssScale, panelHeight * .37);
    const nameBlockHeight = panelHeight * .46;
    let nameLines = [winner.name];
    let nameSize = 0;
    for (let lineCount = 1; lineCount <= Math.min(3, characters.length); lineCount++) {
      const lines = Array.from({ length: lineCount }, (_, index) =>
        characters.slice(Math.floor(index * characters.length / lineCount), Math.floor((index + 1) * characters.length / lineCount)).join('')
      );
      let candidateSize = Math.min(maxNameSize, nameBlockHeight / (lineCount * 1.08));
      ctx.font = `700 ${candidateSize}px ${WINNER_NAME_FONT_FAMILY}`;
      const widestLine = Math.max(...lines.map((line) => ctx.measureText(line).width));
      candidateSize *= Math.min(1, textWidth / Math.max(1, widestLine));
      if (candidateSize > nameSize) {
        nameLines = lines;
        nameSize = candidateSize;
      }
    }
    ctx.font = `700 ${nameSize}px ${WINNER_NAME_FONT_FAMILY}`;
    // [이름 + 간격 + 공]을 한 묶음으로 보고 상자 가운데에 둔다(줄인 글자 크기로 잰 실제 이름 폭 기준)
    const nameWidth = Math.min(textWidth, Math.max(...nameLines.map((line) => ctx.measureText(line).width)));
    const groupWidth = nameWidth + nameGap + marbleSize;
    const groupLeft = Math.max(panelX + sidePadding, panelCenterX - groupWidth / 2);
    const textCenterX = groupLeft + nameWidth / 2;
    const marbleCenterX = groupLeft + nameWidth + nameGap + marbleSize / 2;

    if (marbleImage) {
      ctx.imageSmoothingEnabled = true; // 얼굴 사진 공은 부드럽게
      ctx.imageSmoothingQuality = 'high';
      // 그림자는 뺐다(2026-11-27 사용자 "그림자 때문에 묻힌다. 그림자를 없애볼래")
      ctx.save();
      ctx.drawImage(marbleImage, marbleCenterX - marbleSize / 2, marbleCenterY - marbleSize / 2, marbleSize, marbleSize);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(marbleCenterX, marbleCenterY, marbleSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${winner.hue} 100% ${theme.marbleLightness})`;
      ctx.fill();
    }

    const nameColor = `hsl(${winner.hue} 100% ${theme.marbleLightness}%)`;
    const lineHeight = nameSize * 1.08;
    // 태블릿 제목처럼 부드러운 그림자(0 2px 6px)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6 * winnerScale * cssScale;
    ctx.shadowOffsetY = 2 * winnerScale * cssScale;
    nameLines.forEach((line, index) => {
      const lineY = nameCenterY + (index - (nameLines.length - 1) / 2) * lineHeight;
      ctx.fillStyle = nameColor;
      ctx.fillText(line, textCenterX, lineY);
    });
    ctx.restore();
  }
}
