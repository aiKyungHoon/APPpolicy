# 📱 Developer News Monitor (Apple & Android)

애플(iOS)과 안드로이드(AOS)의 최신 개발자 뉴스 및 가이드라인 업데이트를 실시간으로 모니터링하고 관리할 수 있는 프리미엄 대시보드입니다.

## ✨ 주요 기능

- **멀티 플랫폼 지원**: 상단 탭을 통해 Apple Developer News와 Android Developers Blog 뉴스를 자유롭게 전환하며 확인할 수 있습니다.
- **실시간 번역**: 영어로 제공되는 최신 소식을 한글로 즉시 번역하여 확인할 수 있는 토글 기능을 제공합니다.
- **구글 시트 연동**: 중요한 업데이트나 뉴스를 클릭 한 번으로 구글 시트에 자동으로 아카이빙할 수 있습니다.
- **심사 지침 상태 위젯**: 각 플랫폼의 최신 심사 지침 버전과 업데이트 날짜를 한눈에 파악할 수 있습니다.
- **반응형 디자인**: 다크 모드 기반의 세련된 UI와 모바일 환경에서도 최적화된 레이아웃을 제공합니다.

## 🛠 기술 스택

- **Frontend**: HTML5, Vanilla CSS, Modern JavaScript (ES6+)
- **API**: RSS-to-JSON API (News Fetching)
- **Integration**: Google Apps Script (Translation & Google Sheets Sync)
- **Aesthetics**: Glassmorphism, CSS Variables, Font Awesome Icons

## 🚀 시작하기

1. **저장소 클론**
   ```bash
   git clone https://github.com/aiKyungHoon/APPpolicy.git
   ```

2. **구글 시트 설정**
   - `GAS_Guide.md` 파일을 참고하여 Google Apps Script를 배포합니다.
   - 배포된 웹 앱 URL을 복사합니다.

3. **엔드포인트 설정**
   - `main.js` 파일 상단의 `CONFIG.GAS_ENDPOINT` 변수에 복사한 URL을 입력합니다.

4. **실행**
   - `index.html` 파일을 브라우저에서 열면 즉시 대시보드가 활성화됩니다.

## 📝 라이선스

이 프로젝트는 개인 개발 및 모니터링 용도로 제작되었습니다.
