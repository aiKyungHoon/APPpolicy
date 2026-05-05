const PLATFORMS = {
    apple: {
        rss: 'https://developer.apple.com/news/rss/news.rss',
        guideline: 'https://developer.apple.com/app-store/review/guidelines/',
        guideline_title: 'App Store 심사 지침',
        theme: 'apple-theme'
    },
    android: {
        rss: 'https://android-developers.googleblog.com/feeds/posts/default?alt=rss',
        guideline: 'https://support.google.com/googleplay/android-developer/answer/9934569',
        guideline_title: 'Google Play 정책',
        theme: 'android-theme'
    }
};

const CONFIG = {
    GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycby57Ps2FkC9KhPpxPqvSOkU0MIkf544KzBA4fAfwa1j3tvx3AT5OWtTTeNSfybgsNBGxA/exec', 
};

// 현재 상태 관리
let currentPlatform = 'apple';
let newsData = [];
let currentLang = 'ko'; // 'en' 또는 'ko'
const translationCache = new Map(); // 번역 캐시 추가

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    fetchNews();
    fetchGuidelineStatus();
    setupEventListeners();
}

function setupEventListeners() {
    // 구글 시트 전송 버튼
    document.getElementById('sync-all-btn').addEventListener('click', () => {
        syncToGoogleSheets(newsData);
    });

    // 한/영 토글
    document.getElementById('lang-toggle').addEventListener('change', (e) => {
        currentLang = e.target.checked ? 'ko' : 'en';
        renderNews(newsData);
    });

    // 플랫폼 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            if (platform === currentPlatform) return;

            // UI 업데이트
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.body.className = platform === 'android' ? 'android-theme' : '';
            
            // 상태 업데이트 및 데이터 다시 불러오기
            currentPlatform = platform;
            fetchNews();
            updateGuidelineWidget();
        });
    });
}

async function fetchNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = '<div class="card shimmer" style="height: 200px;"></div><div class="card shimmer" style="height: 200px;"></div>';
    
    try {
        const rssUrl = PLATFORMS[currentPlatform].rss;
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok') {
            const rawItems = data.items.map(item => ({
                id: item.guid || item.link,
                title_en: item.title,
                date: item.pubDate,
                desc_en: item.description.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...',
                link: item.link,
                // 사용자 요청에 따라 'AOS' 명칭 사용
                category: currentPlatform === 'apple' ? 'iOS' : 'AOS'
            }));

            // 한국어 번역 및 데이터 구조화
            newsData = await translateNews(rawItems);
            
            renderNews(newsData);
            document.getElementById('last-sync-time').innerText = `최근 업데이트: ${new Date().toLocaleTimeString()}`;
        } else {
            throw new Error('RSS 파싱 실패');
        }
    } catch (error) {
        console.error('뉴스 로드 실패:', error);
        newsData = [
            {
                id: 'sample-1',
                title_en: `${currentPlatform === 'apple' ? 'App Store' : 'Google Play'} Guidelines Update`,
                title_ko: `${currentPlatform === 'apple' ? 'App Store' : 'Google Play'} 정책 업데이트 안내`,
                date: new Date().toISOString(),
                desc_en: 'Policy updates and new features for developers...',
                desc_ko: '개발자를 위한 최신 정책 업데이트 및 신규 기능 안내입니다...',
                link: PLATFORMS[currentPlatform].guideline,
                category: currentPlatform === 'apple' ? 'iOS' : 'AOS'
            }
        ];
        renderNews(newsData);
        document.getElementById('last-sync-time').innerText = '샘플 데이터 표시 중';
    }
}

async function translateNews(items) {
    return await Promise.all(items.map(async (item) => {
        try {
            const translatedTitle = await translateText(item.title_en);
            const translatedDesc = await translateText(item.desc_en);
            return {
                ...item,
                title_ko: translatedTitle,
                desc_ko: translatedDesc
            };
        } catch (e) {
            return { ...item, title_ko: item.title_en, desc_ko: item.desc_en };
        }
    }));
}

async function translateText(text) {
    if (!text || !CONFIG.GAS_ENDPOINT) return text;
    
    // 캐시 확인
    const cacheKey = `${currentLang}_${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    try {
        // GAS의 doGet을 호출하여 번역 수행
        const url = `${CONFIG.GAS_ENDPOINT}?action=translate&text=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        const translated = data.translatedText || text;
        
        // 캐시에 저장
        translationCache.set(cacheKey, translated);
        return translated;
    } catch (error) {
        console.error('번역 오류:', error);
        return text;
    }
}

function updateGuidelineWidget() {
    const title = document.querySelector('.sidebar .widget-title');
    const link = document.querySelector('.sidebar .btn-secondary');
    
    if (title) title.innerText = PLATFORMS[currentPlatform].guideline_title;
    if (link) link.href = PLATFORMS[currentPlatform].guideline;
    
    fetchGuidelineStatus();
}

async function fetchGuidelineStatus() {
    const widget = document.getElementById('guideline-version');
    const updateDate = document.getElementById('guideline-update-date');

    // 플랫폼별 최신 상태 시뮬레이션 (사용자 제공 정보 반영)
    setTimeout(() => {
        if (currentPlatform === 'apple') {
            widget.innerText = 'v5.3 (최신)';
            updateDate.innerText = `마지막 업데이트: 2024년 5월 1일`;
        } else {
            widget.innerText = '2026 정책 (최신)';
            updateDate.innerText = `마지막 업데이트: 2026년 4월 15일`;
        }
    }, 800);
}

function renderNews(items) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    
    // DocumentFragment를 사용하여 성능 최적화
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.style.animationDelay = `${index * 0.05}s`; // 애니메이션 속도 개선
        
        const displayTitle = currentLang === 'ko' ? item.title_ko : item.title_en;
        const displayDesc = currentLang === 'ko' ? item.desc_ko : item.desc_en;
        
        card.innerHTML = `
            <div class="card-header">
                <span class="date">${new Date(item.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span class="status-badge" style="background: rgba(0, 113, 227, 0.2); color: var(--accent-color);">${item.category}</span>
            </div>
            <h2 class="card-title">${displayTitle}</h2>
            <p class="card-description">${displayDesc}</p>
            <div class="card-footer">
                <a href="${item.link}" target="_blank" class="btn btn-secondary">원문 보기</a>
                <button class="btn btn-primary" onclick="syncSingleItem('${item.id}')">
                    <i class="fas fa-save"></i> 시트 저장
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

async function syncToGoogleSheets(data) {
    const msg = document.getElementById('sync-status-msg');
    
    if (!CONFIG.GAS_ENDPOINT) {
        msg.innerText = '오류: 구글 앱스 스크립트 URL이 설정되지 않았습니다.';
        msg.className = 'sync-status sync-error';
        return;
    }

    msg.innerText = '구글 시트로 전송 중...';
    msg.className = 'sync-status';
    msg.style.display = 'block';

    try {
        // 전송용 데이터 정제 (한국어 우선순위 적용)
        const formattedData = (Array.isArray(data) ? data : [data]).map(item => ({
            date: item.date,
            category: item.category,
            // 한국어(번역 또는 공식)가 있으면 우선 사용, 없으면 영어 사용
            title: item.title_ko || item.title_en,
            description: item.desc_ko || item.desc_en,
            link: item.link,
            // GAS에서 명시적으로 처리할 수 있도록 추가 필드 제공
            title_ko: item.title_ko,
            desc_ko: item.desc_ko
        }));

        const payload = {
            action: 'save',
            data: formattedData
        };

        await fetch(CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });

        msg.innerText = '성공: 한국어 데이터를 구글 시트로 전송했습니다!';
        msg.className = 'sync-status sync-success';
    } catch (error) {
        console.error('전송 에러:', error);
        msg.innerText = '전송 실패: 네트워크 또는 URL 설정을 확인하세요.';
        msg.className = 'sync-status sync-error';
    }
}

window.syncSingleItem = (id) => {
    const item = newsData.find(n => n.id === id);
    if (item) {
        syncToGoogleSheets([item]);
    }
};
