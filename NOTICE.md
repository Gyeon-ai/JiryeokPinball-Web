# Notices

## Marble Roulette

This project is based on [Marble Roulette](https://github.com/lazygyu/roulette).

- Original source copyright: Copyright (c) 2022 LazyGyu
- License: MIT License
- Project names and trademarks: `Marble Roulette` and `마블 룰렛` belong to LazyGyu and are mentioned here only to identify the upstream project.
- Modifications: Copyright (c) 2026 Gyeon-ai, provided under the MIT License unless otherwise noted below.

## Third-party components

- [box2d-wasm](https://github.com/Birch-san/box2d-wasm) — Zlib License. The package also contains `wasm-feature-detect` components under Apache License 2.0.
- [Font Awesome Free](https://fontawesome.com/license/free) — SVG icons under CC BY 4.0. The attribution comments embedded in the SVG files are preserved.

## Images

Marbles use face pictures of the ten Jiryeok Office members (지피티, 라무, 한아련, 싱유, 모나양, 김병살, 김쿼카, 목츄리, 메루, 이투), stored in `assets/faces/` and cropped into circles with a role-colored ring by `src/jiryeokBall.ts`. They are used with permission for this pinball site only, are not covered by the MIT license, and must not be redistributed. The repository contains only encrypted copies (`assets/faces/*.png.enc`, AES-256-GCM); the original pictures are kept out of the repository (`.gitignore`) and are decrypted only when the site is built.
`assets/jiryeok-favicon-*.png` (site icons, 16/32/48/180/192/512) are the Jiryeok Office logo, copied from the roster site's icon set. They are used with permission for this site only, are not covered by the MIT license, and must not be redistributed.
