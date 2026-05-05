# 구글 시트 연동 가이드 (Google Apps Script)

애플 개발자 뉴스를 구글 시트에 자동으로 저장하기 위해 아래 단계를 따라주세요.

## 1단계: 구글 시트 준비
1. [구글 시트](https://sheets.new)를 새로 만듭니다.
2. 첫 번째 행(A1 ~ E1)에 다음 항목 이름을 입력합니다:
   - **날짜**, **카테고리**, **제목**, **요약**, **링크**

## 2단계: 앱스 스크립트 작성
1. 구글 시트 상단 메뉴에서 **확장 프로그램** > **Apps Script**를 클릭합니다.
2. 나타나는 코드 에디터에 아래 코드를 복사하여 붙여넣습니다.

```javascript
function doGet(e) {
  if (e.parameter.action === 'translate') {
    var translatedText = LanguageApp.translate(e.parameter.text, 'en', 'ko');
    return ContentService.createTextOutput(JSON.stringify({translatedText: translatedText})).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 공식 한국어 뉴스 페이지 크롤링 (데모용 단순 구현)
  if (e.parameter.action === 'fetchKrNews') {
    try {
      var url = "https://developer.apple.com/kr/news/";
      var html = UrlFetchApp.fetch(url).getContentText();
      // 간단한 정규표현식으로 제목과 링크 추출 (실제 구조에 맞춰 정교화 필요)
      var items = [];
      var match;
      var regex = /<h2 class="article-title">.*?<a href="(.*?)".*?>(.*?)<\/a>/g;
      while ((match = regex.exec(html)) !== null && items.length < 10) {
        items.push({
          link: "https://developer.apple.com" + match[1],
          title_ko: match[2].trim(),
          category: "News"
        });
      }
      return ContentService.createTextOutput(JSON.stringify(items)).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = params.data || params;
    
    if (!Array.isArray(data)) data = [data];
    
    data.forEach(function(item) {
      var title = item.title_ko || item.title || item.title_en;
      if (!title) return;
      
      var lastRow = sheet.getLastRow();
      var titles = (lastRow > 1) ? sheet.getRange(2, 3, lastRow - 1, 1).getValues().flat() : [];
      
      if (titles.indexOf(title) === -1) {
        sheet.appendRow([
          item.date || new Date().toLocaleDateString(),
          item.category || "News",
          title,
          item.desc_ko || item.description || item.desc_en || "",
          item.link
        ]);
      }
    });
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

## 3단계: 웹 앱 배포
1. 오른쪽 상단의 **배포** 버튼 > **새 배포**를 클릭합니다.
2. 유형 선택에서 **웹 앱**을 선택합니다.
3. 다음 설정을 확인합니다:
   - **설명**: 애플 뉴스 연동
   - **다음 사용자로 실행**: 나 (본인 계정)
   - **액세스 권한이 있는 사용자**: 모든 사용자 (Anyone) -> **중요: '모든 사용자'로 설정해야 대시보드에서 접근이 가능합니다.**
4. **배포** 버튼을 누르고, 권한 승인 팝업이 뜨면 승인합니다.
5. 배포 완료 후 나타나는 **웹 앱 URL**을 복사합니다.

## 4단계: 대시보드 설정
1. 이 프로젝트 폴더의 `main.js` 파일을 엽니다.
2. 5번째 줄의 `GAS_ENDPOINT: '',` 부분의 따옴표 안에 복사한 URL을 붙여넣습니다.
   - 예: `GAS_ENDPOINT: 'https://script.google.com/macros/s/.../exec',`

이제 대시보드에서 '시트 저장' 버튼을 누르면 구글 시트에 데이터가 기록됩니다!
