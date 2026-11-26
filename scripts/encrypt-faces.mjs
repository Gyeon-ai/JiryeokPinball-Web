// 원본 assets/faces/*.png 를 같은 이름의 .png.enc 로 암호화한다(키: 환경 변수 FACE_KEY).
// 사용: FACE_KEY=... node scripts/encrypt-faces.mjs
// 원본 PNG는 지우지 않는다(.gitignore로 저장소에서만 뺀다).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decrypt, encrypt, FACE_DIR, KeyError, listFiles, readKey } from './face-crypto.mjs';

try {
  const key = readKey();
  const files = listFiles('.png');
  if (files.length === 0) throw new KeyError(`${FACE_DIR}에 원본 PNG가 없습니다.`);
  for (const file of files) {
    const plain = readFileSync(join(FACE_DIR, file));
    const sealed = encrypt(key, file, plain);
    if (!decrypt(key, file, sealed).equals(plain)) throw new Error(`${file}: 암호화 확인 실패`);
    writeFileSync(join(FACE_DIR, `${file}.enc`), sealed);
  }
  console.log(`얼굴 그림 ${files.length}장을 암호화했습니다.`);
} catch (error) {
  console.error(`[얼굴 그림 암호화 실패] ${error.message}`);
  process.exit(1);
}
