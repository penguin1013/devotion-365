# 원고 → days.json 변환

원고 PDF가 바뀌면 프로젝트 폴더에서 아래 순서로 다시 만든다. (`pdftotext`는 Git for Windows에 들어 있다)

```bash
PDF="docs/365일 묵상집(1-365) 원고.pdf"; T=scripts/manuscript/.work; mkdir -p $T
pdftotext -enc UTF-8 "$PDF" $T/manuscript.txt        # 문단 단위
pdftotext -enc UTF-8 -raw "$PDF" $T/raw.txt          # PDF 줄 단위(띄어쓰기 판단용)
node scripts/manuscript/fixspaces.mjs $T/raw.txt $T/manuscript.txt $T/fixed.txt $T/fixlog.txt
node scripts/manuscript/convert.mjs $T/fixed.txt src/content/days.json $T/report.txt $T/raw.txt
```

- `fixspaces.mjs`: PDF 줄바꿈 자리에 끼어든 공백(예: "그리 스도")을 원고 안 빈도로 판단해 지운다.
- `convert.mjs`: "N일 제목 / ⦁본문: 구절 / 묵상 글" 구조를 읽어 일차별 JSON으로 만든다. `report.txt`에 확인할 곳을 남긴다.
