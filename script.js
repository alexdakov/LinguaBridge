// 1. GLOBAL STATE
let courseData = [];
let currentType = 'g';
let spModule = 1;
let currentCurrency = 'usd';
let activeLanguage = 'all';
const symbols = { usd: '$', eur: '€', rub: '₽', cny: '¥' };

const catalogI18n = {
    en: {
        course: 'Course', level: 'Level', duration: 'Duration', price: 'Price',
        langNames: { English: 'English', German: 'German', Chinese: 'Chinese', 'Mandarin Chinese': 'Mandarin Chinese', Russian: 'Russian', Japanese: 'Japanese', Bulgarian: 'Bulgarian' },
        langDesc: {
            English: 'A language shaped by diversity—blending traditions, accents, and influences from across the globe, reflected in its literature, media, and everyday life.',
            German: 'Rooted in precision and depth, German reflects a culture known for philosophy, engineering, classical music, and a strong sense of structure.',
            Chinese: 'A language carrying thousands of years of history—where tradition meets modern innovation, shaped by philosophy, symbolism, and a rich cultural heritage.',
            'Mandarin Chinese': 'A language carrying thousands of years of history—where tradition meets modern innovation, shaped by philosophy, symbolism, and a rich cultural heritage.',
            Russian: 'A Slavic language of extraordinary literary and cultural depth, spoken across 11 time zones and central to global diplomacy and science.',
            Japanese: 'A language of elegance and precision, Japanese blends three writing systems and reflects a culture of deep tradition, innovation, and artistry.',
            Bulgarian: 'The first Slavic language to be written, Bulgarian is the foundation of the Cyrillic alphabet and carries a rich medieval and modern cultural heritage.'
        }
    },
    bg: {
        course: 'Курс', level: 'Ниво', duration: 'Продължителност', price: 'Цена',
        langNames: { English: 'Английски', German: 'Немски', Chinese: 'Китайски', 'Mandarin Chinese': 'Китайски (Мандарин)', Russian: 'Руски', Japanese: 'Японски', Bulgarian: 'Български' },
        langDesc: {
            English: 'Език, оформен от разнообразието — съчетава традиции, акценти и влияния от целия свят, отразени в литературата, медиите и ежедневния живот.',
            German: 'Вкоренен в точност и дълбочина, немският отразява култура, известна с философия, инженерство, класическа музика и строга структура.',
            Chinese: 'Език с хиляди години история — където традицията среща съвременната иновация, формиран от философия, символизъм и богато културно наследство.',
            'Mandarin Chinese': 'Език с хиляди години история — където традицията среща съвременната иновация, формиран от философия, символизъм и богато културно наследство.',
            Russian: 'Славянски език с извънредна литературна и културна дълбочина, говорен в 11 часови зони и централен за световната дипломация и наука.',
            Japanese: 'Език на елегантност и прецизност, японският съчетава три писмени системи и отразява култура на дълбока традиция, иновации и изкуство.',
            Bulgarian: 'Първият писан славянски език, българският е основата на кирилската азбука и носи богато средновековно и модерно културно наследство.'
        },
        courseNames: {
            // English
            'English Foundations': 'Основи на английски',
            'Fluency & Logic': 'Плавност и логика',
            'Advanced Mastery': 'Напреднало владеене',
            'Business English': 'Бизнес английски',
            'IELTS / Cambridge Prep': 'Подготовка за IELTS / Cambridge',
            'Academic Admissions': 'Академично кандидатстване',
            'Conversational English': 'Разговорен английски',
            // German
            'German Foundations': 'Основи на немски',
            'Intermediate German': 'Среден немски',
            'German Excellence': 'Немски – напреднало ниво',
            'Business German': 'Бизнес немски',
            'TestDaF / Goethe Prep': 'Подготовка за TestDaF / Goethe',
            'Conversational German': 'Разговорен немски',
            // Mandarin
            'Mandarin Foundations': 'Основи на мандарин',
            'Intermediate Mandarin': 'Среден мандарин',
            'Advanced Proficiency': 'Напреднало владеене',
            'Business Chinese': 'Бизнес китайски',
            'HSK Exam Prep': 'Подготовка за HSK',
            'Conversational Chinese': 'Разговорен китайски',
            // Russian
            'Russian Foundations': 'Основи на руски',
            'Intermediate Russian': 'Среден руски',
            'Business Russian': 'Бизнес руски',
            'TORFL Exam Prep': 'Подготовка за TORFL',
            'Conversational Russian': 'Разговорен руски',
            // Bulgarian
            'Bulgarian Foundations': 'Основи на български',
            'Intermediate Mastery': 'Средно владеене',
            'Native-Level Fluency': 'Плавност на ниво носител',
            'Business Bulgarian': 'Бизнес български',
            'State Exam Prep': 'Подготовка за държавен изпит',
            'Conversational Bulgarian': 'Разговорен български',
            // Japanese
            'Japanese Foundations (N5–N4)': 'Основи на японски (N5–N4)',
            'Intermediate Japanese (N3)': 'Среден японски (N3)',
            'Advanced Proficiency (N2–N1)': 'Напреднало владеене (N2–N1)',
            'Business Japanese (Keigo)': 'Бизнес японски (Keigo)',
            'JLPT Exam Prep (N5–N1)': 'Подготовка за JLPT (N5–N1)',
            'Conversational Japanese': 'Разговорен японски'
        }
    },
    ru: {
        course: 'Курс', level: 'Уровень', duration: 'Продолжительность', price: 'Цена',
        langNames: { English: 'Английский', German: 'Немецкий', Chinese: 'Китайский', 'Mandarin Chinese': 'Китайский (Мандарин)', Russian: 'Русский', Japanese: 'Японский', Bulgarian: 'Болгарский' },
        langDesc: {
            English: 'Язык, сформированный разнообразием — сочетает традиции, акценты и влияния со всего мира, отражённые в литературе, СМИ и повседневной жизни.',
            German: 'Уходя корнями в точность и глубину, немецкий отражает культуру, известную философией, инженерией, классической музыкой и строгой структурой.',
            Chinese: 'Язык с тысячелетней историей — где традиция встречает современные инновации, сформированный философией, символизмом и богатым культурным наследием.',
            'Mandarin Chinese': 'Язык с тысячелетней историей — где традиция встречает современные инновации, сформированный философией, символизмом и богатым культурным наследием.',
            Russian: 'Славянский язык исключительной литературной и культурной глубины, распространённый в 11 часовых поясах и занимающий центральное место в мировой дипломатии.',
            Japanese: 'Язык изящества и точности, японский сочетает три системы письма и отражает культуру глубоких традиций, инноваций и мастерства.',
            Bulgarian: 'Первый письменный славянский язык, болгарский является основой кириллицы и несёт богатое средневековое и современное культурное наследие.'
        },
        courseNames: {
            // English
            'English Foundations': 'Основы английского',
            'Fluency & Logic': 'Свободное владение и логика',
            'Advanced Mastery': 'Продвинутое мастерство',
            'Business English': 'Деловой английский',
            'IELTS / Cambridge Prep': 'Подготовка к IELTS / Cambridge',
            'Academic Admissions': 'Академическое поступление',
            'Conversational English': 'Разговорный английский',
            // German
            'German Foundations': 'Основы немецкого',
            'Intermediate German': 'Средний немецкий',
            'German Excellence': 'Немецкий – высокий уровень',
            'Business German': 'Деловой немецкий',
            'TestDaF / Goethe Prep': 'Подготовка к TestDaF / Goethe',
            'Conversational German': 'Разговорный немецкий',
            // Mandarin
            'Mandarin Foundations': 'Основы мандаринского',
            'Intermediate Mandarin': 'Средний мандаринский',
            'Advanced Proficiency': 'Продвинутое владение',
            'Business Chinese': 'Деловой китайский',
            'HSK Exam Prep': 'Подготовка к HSK',
            'Conversational Chinese': 'Разговорный китайский',
            // Russian
            'Russian Foundations': 'Основы русского',
            'Intermediate Russian': 'Средний русский',
            'Business Russian': 'Деловой русский',
            'TORFL Exam Prep': 'Подготовка к ТРКИ',
            'Conversational Russian': 'Разговорный русский',
            // Bulgarian
            'Bulgarian Foundations': 'Основы болгарского',
            'Intermediate Mastery': 'Средний уровень',
            'Native-Level Fluency': 'Свободное владение',
            'Business Bulgarian': 'Деловой болгарский',
            'State Exam Prep': 'Подготовка к госэкзамену',
            'Conversational Bulgarian': 'Разговорный болгарский',
            // Japanese
            'Japanese Foundations (N5–N4)': 'Основы японского (N5–N4)',
            'Intermediate Japanese (N3)': 'Средний японский (N3)',
            'Advanced Proficiency (N2–N1)': 'Продвинутое владение (N2–N1)',
            'Business Japanese (Keigo)': 'Деловой японский (Keigo)',
            'JLPT Exam Prep (N5–N1)': 'Подготовка к JLPT (N5–N1)',
            'Conversational Japanese': 'Разговорный японский'
        }
    },
    zh: {
        course: '课程', level: '级别', duration: '时长', price: '价格',
        langNames: { English: '英语', German: '德语', Chinese: '中文', 'Mandarin Chinese': '普通话', Russian: '俄语', Japanese: '日语', Bulgarian: '保加利亚语' },
        langDesc: {
            English: '一门由多样性塑造的语言——融合了来自全球的传统、口音和影响，体现在文学、媒体和日常生活中。',
            German: '植根于精确与深度，德语反映了一种以哲学、工程、古典音乐和强烈结构感著称的文化。',
            Chinese: '一门承载数千年历史的语言——传统与现代创新在此交汇，由哲学、象征主义和丰富的文化遗产塑造。',
            'Mandarin Chinese': '一门承载数千年历史的语言——传统与现代创新在此交汇，由哲学、象征主义和丰富的文化遗产塑造。',
            Russian: '一门具有非凡文学和文化深度的斯拉夫语言，跨越11个时区，是全球外交和科学的核心语言。',
            Japanese: '一门优雅与精确的语言，日语融合了三种书写系统，反映了深厚传统、创新和艺术精神的文化。',
            Bulgarian: '第一种被书写的斯拉夫语言，保加利亚语是西里尔字母的基础，承载着丰富的中世纪和现代文化遗产。'
        },
        courseNames: {
            'English Foundations': '英语基础',
            'Fluency & Logic': '流利与逻辑',
            'Advanced Mastery': '高级精通',
            'Business English': '商务英语',
            'IELTS / Cambridge Prep': 'IELTS / 剑桥备考',
            'Academic Admissions': '学术录取',
            'Conversational English': '英语会话',
            'German Foundations': '德语基础',
            'Intermediate German': '中级德语',
            'German Excellence': '德语卓越',
            'Business German': '商务德语',
            'TestDaF / Goethe Prep': 'TestDaF / 歌德备考',
            'Conversational German': '德语会话',
            'Mandarin Foundations': '普通话基础',
            'Intermediate Mandarin': '中级普通话',
            'Advanced Proficiency': '高级水平',
            'Business Chinese': '商务中文',
            'HSK Exam Prep': 'HSK备考',
            'Conversational Chinese': '中文会话',
            'Russian Foundations': '俄语基础',
            'Intermediate Russian': '中级俄语',
            'Business Russian': '商务俄语',
            'TORFL Exam Prep': 'TORFL备考',
            'Conversational Russian': '俄语会话',
            'Bulgarian Foundations': '保加利亚语基础',
            'Intermediate Mastery': '中级精通',
            'Native-Level Fluency': '母语级流利',
            'Business Bulgarian': '商务保加利亚语',
            'State Exam Prep': '国家考试备考',
            'Conversational Bulgarian': '保加利亚语会话',
            'Japanese Foundations (N5–N4)': '日语基础 (N5–N4)',
            'Intermediate Japanese (N3)': '中级日语 (N3)',
            'Advanced Proficiency (N2–N1)': '高级水平 (N2–N1)',
            'Business Japanese (Keigo)': '商务日语 (Keigo)',
            'JLPT Exam Prep (N5–N1)': 'JLPT备考 (N5–N1)',
            'Conversational Japanese': '日语会话'
        }
    }
};

// 2. DATA LOADER
async function loadCatalog() {
    try {
        const response = await fetch('prices.json');
        if (!response.ok) throw new Error("JSON not found");
        const data = await response.json();
        courseData = data.languages;
        renderLanguageNav();
        renderCatalog();
    } catch (error) {
        console.error(error);
        const container = document.getElementById('catalog-container');
        if (container) {
            container.innerHTML = `<p class="text-center text-red-500 py-10 font-bold">Error: Use Live Server to load prices.json</p>`;
        }
    }
}

// 3. FLAG NAVIGATION (Filter Logic)
function setLanguageFilter(langTitle) {
    activeLanguage = langTitle;
    renderLanguageNav(); 
    renderCatalog();     
}

function renderLanguageNav() {
    const nav = document.getElementById('language-nav');
    if (!nav) return;

    let navHtml = `
        <button onclick="setLanguageFilter('all')" 
            class="text-xs font-bold px-4 py-1.5 rounded-full transition-all ${activeLanguage === 'all' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:text-primary'}">
            ALL
        </button>
        <span class="text-slate-200">|</span>
    `;

    navHtml += courseData.map((lang, index) => `
        <div class="flex items-center">
            <button onclick="setLanguageFilter('${lang.title}')" 
                    class="transition-all px-2 cursor-pointer ${activeLanguage === lang.title ? 'scale-125 grayscale-0' : 'grayscale hover:grayscale-0'}">
                <img src="${lang.flag_url}" alt="${lang.title}" class="w-8 h-auto inline-block rounded-sm shadow-sm">
            </button>
            ${index < courseData.length - 1 ? '<span class="text-slate-200 ml-4">|</span>' : ''}
        </div>
    `).join('');
    
    nav.innerHTML = navHtml;
}

// 4. TABLE GENERATOR
function renderCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    container.innerHTML = '';

    const uiLang = localStorage.getItem('preferredLang') || 'en';
    const ci = catalogI18n[uiLang] || catalogI18n['en'];

    const filteredData = activeLanguage === 'all'
        ? courseData
        : courseData.filter(l => l.title === activeLanguage);

    // For self-paced, show a module info banner above the catalog
    if (currentType === 'sp') {
        const spLabels = {
            en: { banner: `Self-Paced Module — 3-month duration · 1 course = 2 modules (1 month each) · Includes 4 × 30-min tutor consultations (2h total) · Showing prices for: <strong>Module ${spModule}</strong>` },
            bg: { banner: `Самостоятелен модул — 3 месеца · 1 курс = 2 модула (по 1 месец) · Включва 4 × 30 мин. консултации с преподавател (2ч.) · Показани цени за: <strong>Модул ${spModule}</strong>` },
            ru: { banner: `Самостоятельный модуль — 3 месяца · 1 курс = 2 модуля (по 1 месяцу) · Включает 4 × 30 мин. консультации с преподавателем (2ч.) · Цены для: <strong>Модуль ${spModule}</strong>` },
            zh: { banner: `自主学习模块 — 3个月 · 1课程 = 2模块（每模块1个月）· 含4 × 30分钟导师咨询（共2小时）· 当前显示：<strong>模块 ${spModule}</strong>` }
        };
        const spBanner = (spLabels[uiLang] || spLabels['en']).banner;
        const bannerEl = document.createElement('div');
        bannerEl.className = 'mb-8 px-6 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-slate-700 text-center';
        bannerEl.innerHTML = `<span class="material-symbols-outlined align-middle text-primary mr-2" style="font-size:18px">self_improvement</span>${spBanner}`;
        container.appendChild(bannerEl);
    }

    filteredData.forEach(lang => {
        const section = document.createElement('div');
        section.className = 'space-y-8 mb-16 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]';

        const displayTitle = ci.langNames[lang.title] || lang.title;
        const displayDesc = ci.langDesc[lang.title] || lang.desc || '';

        const priceKey = currentType === 'sp'
            ? `sp${spModule}_${currentCurrency}`
            : `${currentType}_${currentCurrency}`;
        const priceUnit = currentType === 'sp' ? '/ module' : '/ hr';

        section.innerHTML = `
            <div class="flex items-center gap-4 border-l-4 border-primary pl-6">
                <img src="${lang.flag_url}" alt="${lang.title}" class="w-12 h-auto rounded shadow-sm">
                <div>
                    <h3 class="text-2xl font-bold text-on-surface">${displayTitle}</h3>
                    <p class="text-slate-500 mt-1">${displayDesc}</p>
                </div>
            </div>
            <div class="overflow-x-auto rounded-xl border border-outline-variant/30 coral-shadow bg-white">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-primary text-white">
                        <tr>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">${ci.course}</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">${ci.level}</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">${ci.duration}</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider text-right">${ci.price}</th>
                        </tr>
                    </thead>
                    <tbody class="text-on-surface-variant">
                        ${lang.courses.map((course, idx) => `
                                <tr class="${idx % 2 === 1 ? 'bg-rose-50/30' : 'bg-white'} border-b border-outline-variant/10 last:border-0">
                                    <td class="p-5 font-medium text-on-surface">${(ci.courseNames && ci.courseNames[course.name]) || course.name}</td>
                                    <td class="p-5 text-sm">${course.level}</td>
                                    <td class="p-5 text-sm">${currentType === 'sp' ? '1 month' : course.dur}</td>
                                    <td class="p-5 font-bold text-primary text-right">
                                        ${symbols[currentCurrency]}${course[priceKey] || '—'} <span class="text-xs font-normal text-slate-400">${priceUnit}</span>
                                    </td>
                                </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(section);
    });
}

// 5. FILTER CONTROLS
function setType(type) {
    currentType = type;
    updateTypeUI();
    renderCatalog();
}

function setSpModule(mod) {
    spModule = mod;
    // Update sub-toggle buttons
    [1, 2].forEach(m => {
        const btn = document.getElementById(`sp-mod-${m}`);
        if (!btn) return;
        if (m === mod) {
            btn.classList.add('bg-primary', 'text-white', 'shadow-md');
            btn.classList.remove('text-slate-400', 'hover:text-primary');
        } else {
            btn.classList.remove('bg-primary', 'text-white', 'shadow-md');
            btn.classList.add('text-slate-400', 'hover:text-rose-800', 'hover:bg-rose-100');
        }
    });
    renderCatalog();
}

function updateTypeUI() {
    ['g', 'i', 'sp'].forEach(type => {
        const btn = document.getElementById(`type-tab-${type}`);
        if (!btn) return;
        if (type === currentType) {
            btn.classList.add('bg-primary', 'text-white', 'shadow-md');
            btn.classList.remove('text-slate-500', 'hover:text-primary', 'hover:bg-rose-50');
        } else {
            btn.classList.remove('bg-primary', 'text-white', 'shadow-md');
            btn.classList.add('text-slate-500', 'hover:text-primary', 'hover:bg-rose-50');
        }
    });
    // Show/hide sp module sub-toggle
    const spSub = document.getElementById('sp-module-toggle');
    if (spSub) {
        if (currentType === 'sp') {
            spSub.classList.remove('hidden');
            spSub.classList.add('flex');
        } else {
            spSub.classList.add('hidden');
            spSub.classList.remove('flex');
        }
    }
}

function setCurrency(curr) {
    currentCurrency = curr;
    document.querySelectorAll('.curr-btn').forEach(btn => {
        const isActive = btn.dataset.curr === curr;
        if (isActive) {
            btn.className = "curr-btn w-10 h-10 rounded-xl text-xl font-bold transition-all bg-white shadow-md border border-rose-200 text-primary scale-110 z-10";
        } else {
            btn.className = "curr-btn w-10 h-10 rounded-xl text-xl font-bold transition-all text-slate-400 hover:text-primary hover:bg-rose-50";
        }
    });
    renderCatalog();
}

function scrollLanguages(distance) {
    const slider = document.getElementById('languageSlider');
    if (slider) {
        slider.scrollBy({ left: distance, behavior: 'smooth' });
    }
}

// 6. CONTACT FORM
async function sendEmailNow() {
    const btn = document.querySelector('button[onclick="sendEmailNow()"]');
    const originalText = btn ? btn.innerText : "Send Message";
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
    }

    if (btn) { btn.innerText = "Sending..."; btn.disabled = true; }
    
    const formData = {
        name,
        email,
        subject: document.getElementById('contact-subject').value || "No Subject",
        message
    };

    try {
        const response = await fetch('https://linguabridge-email-form-handler.alextdakov.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('contact-form').innerHTML = '<h3>Thank you! We will be in touch soon.</h3>';
        } else {
            alert("Error: " + await response.text());
        }
    } catch (error) {
        alert("Connection error. Please check your internet and try again.");
    } finally {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
    }
}

// 7. ENROL FORM
const messengerApps = ["Phone (call only)", "WhatsApp", "Viber", "WeChat", "QQ Chat", "Telegram", "Other"];
const messengerApps_bg = ["Телефон (само обаждане)", "WhatsApp", "Viber", "WeChat", "QQ Chat", "Telegram", "Друго"];
const messengerApps_ru = ["Телефон (только звонки)", "WhatsApp", "Viber", "WeChat", "QQ Chat", "Telegram", "Другое"];
const messengerApps_zh = ["电话（仅通话）", "WhatsApp", "Viber", "微信 (WeChat)", "QQ", "Telegram", "其他"];

const enrolTranslations = {
    en: {
        title: "Student Application – LinguaBridge",
        desc: "Fill out this form to request tutoring. We'll contact you shortly to match you with the right tutor.",
        labels: { name: "Full Name", email: "Email Address", messenger: "Contact via", phone: "Phone / Messenger Number", phoneHint: "Include country code, e.g. +359...", otherApp: "Specify messaging app", native: "What is your native language?", schedule: "Preferred learning schedule", goals: "Additional comments or learning goals" },
        questions: { lang: "Which language do you want to learn?", level: "What is your current level?", type: "What type of lessons are you interested in?", find: "How did you find us?", select: "-- Select from the list --", other: "Please specify:" },
        messengerApps,
        options: {
            langs: ["Bulgarian", "Chinese", "English", "German", "Russian", "Other"],
            levels: ["Beginner", "Elementary (A2)", "Intermediate (B1–B2)", "Advanced (C1–C2)", "Not sure/None"],
            types: ["One-on-one live lessons", "Group lessons", "Self-paced course", "Conversation practice", "Exam preparation (e.g., TORFL, IELTS)", "Other"],
            find: ["Instagram", "Facebook", "Google Search", "Friend referral", "Other"]
        },
        submit: "Send request",
        success: { title: "Thank you for your request!", msg: "Our team will reach out to you soon.", btn: "Fill another form" }
    },
    bg: {
        title: "Кандидатстване за студенти – LinguaBridge",
        desc: "Попълнете този формуляр, за да заявите уроци. Ще се свържем с вас скоро, за да ви свържем с подходящия преподавател.",
        labels: { name: "Вашите имена", email: "Имейл адрес", messenger: "Свържете се чрез", phone: "Телефон / Номер в месинджъра", phoneHint: "Включете кода на държавата, напр. +359...", otherApp: "Посочете приложението", native: "Какъв е твоят роден език?", schedule: "Предпочитан график за обучение", goals: "Допълнителни коментари или учебни цели" },
        questions: { lang: "Кой език искате да научите?", level: "Какво е текущото ви ниво?", type: "От какъв тип уроци се интересувате?", find: "Как ни открихте?", select: "-- Изберете от списъка --", other: "Моля, уточнете:" },
        messengerApps: messengerApps_bg,
        options: {
            langs: ["Български език", "Китайски език", "Английски език", "Немски език", "Руски език", "Друго"],
            levels: ["Начинаещ", "Начално ниво (A2)", "Средно ниво (B1–B2)", "Напреднал ниво (C1–C2)", "Не съм сигурен/сигурна"],
            types: ["Индивидуални уроци на живо", "Групови уроци", "Курс със самостоятелно темпо", "Практика за разговори", "Подготовка за изпити (напр. TORFL, IELTS)", "Друго"],
            find: ["Instagram", "Facebook", "Търсене в Google", "Препоръка от приятел", "Друго"]
        },
        submit: "Изпращане на заявка",
        success: { title: "Благодарим за вашата заявка!", msg: "Нашият екип ще се свърже с вас скоро.", btn: "Попълнете отново" }
    },
    ru: {
        title: "Заявка студента – LinguaBridge",
        desc: "Заполните эту форму, чтобы запросить репетиторство. Мы свяжемся с вами в ближайшее время, чтобы подобрать для вас подходящего репетитора.",
        labels: { name: "Ваше имя", email: "Адрес электронной почты", messenger: "Связаться через", phone: "Телефон / Номер в мессенджере", phoneHint: "Укажите код страны, напр. +7...", otherApp: "Укажите приложение", native: "Какой ваш родной язык?", schedule: "Предпочтительный график обучения", goals: "Дополнительные комментарии или учебные цели" },
        questions: { lang: "Какой язык вы хотите выучить?", level: "Какой у вас сейчас уровень?", type: "Какие виды занятий вас интересуют?", find: "Как вы нас нашли?", select: "-- Выберите из списка --", other: "Пожалуйста, уточните:" },
        messengerApps: messengerApps_ru,
        options: {
            langs: ["Болгарский язык", "Китайский язык", "Английский язык", "Немецкий язык", "Русский язык", "Другое"],
            levels: ["Начинающий (А1)", "Элементарный (A2)", "Средний (B1–B2)", "Продвинутый (C1–C2)", "Не уверен/нулевой"],
            types: ["Индивидуальные занятия в режиме реального времени", "Групповые занятия", "Курс в удобном для вас темпе", "Разговорная практика", "Подготовка к экзаменам (например, TORFL, IELTS)", "Другое"],
            find: ["Instagram", "Facebook", "Поиск в Google", "Рекомендация от друзей", "Другое"]
        },
        submit: "Отправить заявку",
        success: { title: "Спасибо за вашу заявку!", msg: "Наша команда скоро свяжется с вами.", btn: "Заполнить еще раз" }
    },
    zh: {
        title: "学生申请 – LinguaBridge",
        desc: "请填写此表格申请辅导课程。我们将尽快与您联系，为您匹配合适的导师。",
        labels: { name: "全名", email: "电子邮件地址", messenger: "联系方式", phone: "电话 / 即时通讯号码", phoneHint: "请包含国家代码，例如 +86...", otherApp: "请注明通讯应用", native: "您的母语是什么？", schedule: "首选学习时间安排", goals: "其他意见或学习目标" },
        questions: { lang: "您想学习哪种语言？", level: "您目前的水平如何？", type: "您对哪种类型的课程感兴趣？", find: "您是如何找到我们的？", select: "-- 请从列表中选择 --", other: "请注明：" },
        messengerApps: messengerApps_zh,
        options: {
            langs: ["保加利亚语", "中文", "英语", "德语", "俄语", "其他"],
            levels: ["初学者 (A1)", "初级 (A2)", "中级 (B1–B2)", "高级 (C1–C2)", "不确定"],
            types: ["一对一直播课", "小组课", "自主学习课程", "会话练习", "考试备考（如 TORFL、IELTS）", "其他"],
            find: ["Instagram", "Facebook", "Google搜索", "朋友推荐", "其他"]
        },
        submit: "提交申请",
        success: { title: "感谢您的申请！", msg: "我们的团队将很快与您联系。", btn: "重新填写" }
    }
};

const tutorTranslations = {
    en: {
        title: "Tutor Application – LinguaBridge",
        desc: "Apply to become a language tutor. Fill in the form below and we'll contact you shortly.",
        labels: { name: "Full Name*", email: "Email Address*", messenger: "Contact via*", phone: "Phone / Messenger Number*", phoneHint: "Include country code, e.g. +359...", otherApp: "Specify messaging app", langs: "Which language(s) do you teach?*", edu: "Education and qualifications*", certs: "Do you hold any certificates? (e.g. CELTA)*", exp: "Teaching experience*", hours: "Preferred working hours*", bio: "Short intro about yourself*", cv: "Upload your CV (PDF only)*" },
        messengerApps,
        selectPlaceholder: "-- Select --",
        submit: "Send Application",
        success: { title: "Application submitted!", msg: "We will review your application and contact you soon." }
    },
    bg: {
        title: "Кандидатура за преподавател – LinguaBridge",
        desc: "Кандидатствайте, за да станете преподавател по езици. Попълнете формуляра по-долу и ще се свържем с вас скоро.",
        labels: { name: "Пълно име*", email: "Имейл адрес*", messenger: "Свържете се чрез*", phone: "Телефон / Номер в месинджъра*", phoneHint: "Включете кода на държавата, напр. +359...", otherApp: "Посочете приложението", langs: "Кой/кои език(ци) преподавате?*", edu: "Образование и квалификации*", certs: "Имате ли сертификати? (напр. CELTA)*", exp: "Преподавателски опит*", hours: "Предпочитани работни часове*", bio: "Кратко представяне за вас*", cv: "Качете вашето CV (само PDF)*" },
        messengerApps: messengerApps_bg,
        selectPlaceholder: "-- Изберете --",
        submit: "Изпрати кандидатурата",
        success: { title: "Кандидатурата е изпратена!", msg: "Ще прегледаме вашата кандидатура и ще се свържем с вас скоро." }
    },
    ru: {
        title: "Заявка репетитора – LinguaBridge",
        desc: "Подайте заявку, чтобы стать преподавателем языков. Заполните форму ниже, и мы свяжемся с вами в ближайшее время.",
        labels: { name: "Полное имя*", email: "Адрес электронной почты*", messenger: "Связаться через*", phone: "Телефон / Номер в мессенджере*", phoneHint: "Укажите код страны, напр. +7...", otherApp: "Укажите приложение", langs: "Какой(ие) язык(и) вы преподаёте?*", edu: "Образование и квалификации*", certs: "Есть ли у вас сертификаты? (напр. CELTA)*", exp: "Опыт преподавания*", hours: "Предпочтительные рабочие часы*", bio: "Краткое представление о себе*", cv: "Загрузите резюме (только PDF)*" },
        messengerApps: messengerApps_ru,
        selectPlaceholder: "-- Выберите --",
        submit: "Отправить заявку",
        success: { title: "Заявка отправлена!", msg: "Мы рассмотрим вашу заявку и свяжемся с вами в ближайшее время." }
    },
    zh: {
        title: "导师申请 – LinguaBridge",
        desc: "申请成为语言导师。请填写下面的表格，我们将尽快与您联系。",
        labels: { name: "全名*", email: "电子邮件地址*", messenger: "联系方式*", phone: "电话 / 即时通讯号码*", phoneHint: "请包含国家代码，例如 +86...", otherApp: "请注明通讯应用", langs: "您教哪种语言？*", edu: "教育背景及资质*", certs: "您是否持有证书？（如 CELTA）*", exp: "教学经验*", hours: "首选工作时间*", bio: "关于您的简短介绍*", cv: "上传您的简历（仅PDF）*" },
        messengerApps: messengerApps_zh,
        selectPlaceholder: "-- 请选择 --",
        submit: "发送申请",
        success: { title: "申请已提交！", msg: "我们将审核您的申请并尽快与您联系。" }
    }
};

function tutorMessengerBlock(t) {
    return `
        <div class="flex flex-col col-span-full gap-2">
            <label class="font-bold text-sm text-slate-600">${t.labels.messenger}</label>
            <select id="t-messenger" required onchange="handleTutorMessengerOther(this)" class="p-4 rounded-xl border border-rose-100 bg-white outline-none w-full">
                <option value="" disabled selected>${t.selectPlaceholder}</option>
                ${t.messengerApps.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
            <div class="flex gap-3 items-start">
                <input id="t-messenger-other" type="text" placeholder="${t.labels.otherApp}" class="hidden flex-1 p-4 rounded-xl border border-rose-100 outline-none">
                <div class="flex flex-col flex-1 gap-1">
                    <input type="tel" id="t-phone" required value="+" class="p-4 rounded-xl border border-rose-100 outline-none w-full" placeholder="+359...">
                    <span class="text-xs text-slate-400 ml-1">${t.labels.phoneHint}</span>
                </div>
            </div>
        </div>`;
}

function renderTutorForm(lang = 'en') {
    const container = document.getElementById('tutor-form-container');
    if (!container) return;
    const t = tutorTranslations[lang] || tutorTranslations['en'];
    container.innerHTML = `
        <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">${t.title}</h2>
        <p class="text-slate-500 mb-8">${t.desc}</p>
        <form id="tutor-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.name}</label><input type="text" id="t-name" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.email}</label><input type="email" id="t-email" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            ${tutorMessengerBlock(t)}
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.langs}</label><input type="text" id="t-langs" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.edu}</label><textarea id="t-edu" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.certs}</label><input type="text" id="t-certs" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.exp}</label><textarea id="t-exp" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.hours}</label><input type="text" id="t-hours" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.bio}</label><textarea id="t-bio" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.cv}</label><input type="file" id="t-cv" accept=".pdf" required class="p-4 rounded-xl border border-rose-100"></div>
            <button type="submit" class="col-span-full bg-primary text-white p-5 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">${t.submit}</button>
        </form>
    `;
    document.getElementById('tutor-form').onsubmit = handleTutorSubmit;
}

function handleTutorMessengerOther(sel) {
    const other = document.getElementById('t-messenger-other');
    if (!other) return;
    const v = sel.value.toLowerCase();
    if (v.includes('other') || v.includes('друго') || v.includes('другое') || v.includes('其他')) {
        other.classList.remove('hidden');
        other.required = true;
    } else {
        other.classList.add('hidden');
        other.required = false;
    }
}

async function handleTutorSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const TUTOR_URL = 'https://script.google.com/macros/s/AKfycbzCXUF7IcEl2RD1YOJSsNiV4KhKDuXjKOg4fzmSGX5nas6buRbsCB0ODG6lZ-z0GOksLg/exec';
    btn.innerText = "Uploading... Please wait";
    btn.disabled = true;
    const file = document.getElementById('t-cv').files[0];
    if (!file) { alert("No CV file selected"); btn.innerText = "Send Application"; btn.disabled = false; return; }
    const reader = new FileReader();
    reader.onerror = () => { alert("Failed to read file"); btn.innerText = "Send Application"; btn.disabled = false; };
    reader.onload = async () => {
        try {
            const data = {
                isTutor: true,
                name: document.getElementById('t-name').value,
                email: document.getElementById('t-email').value,
                phone: (() => {
                    const sel = document.getElementById('t-messenger');
                    const other = document.getElementById('t-messenger-other');
                    const messengerLabel = sel.value === 'Other' || (other && !other.classList.contains('hidden') && other.value)
                        ? other.value || sel.value
                        : sel.value;
                    return `${messengerLabel}: ${document.getElementById('t-phone').value}`;
                })(),
                langs: document.getElementById('t-langs').value,
                edu: document.getElementById('t-edu').value,
                certs: document.getElementById('t-certs').value,
                exp: document.getElementById('t-exp').value,
                hours: document.getElementById('t-hours').value,
                bio: document.getElementById('t-bio').value,
                cvFile: reader.result.split(',')[1],
                cvName: document.getElementById('t-name').value + "_CV.pdf"
            };
            await fetch(TUTOR_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
            document.getElementById('tutor-form-container').innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-2xl font-bold text-primary">Application submitted!</h2>
                    <p>We will review your application and contact you soon.</p>
                </div>`;
        } catch (err) {
            console.error(err);
            alert("Submission failed. Please check your connection and try again.");
            btn.innerText = "Send Application";
            btn.disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

function messengerPhoneBlock(t) {
    return `
        <div class="flex flex-col col-span-full gap-2">
            <label class="font-bold text-sm text-slate-600">${t.labels.messenger}*</label>
            <select id="form-messenger" required onchange="handleMessengerOther(this)" class="p-4 rounded-xl border border-rose-100 bg-white outline-none w-full">
                <option value="" disabled selected>${t.questions.select}</option>
                ${t.messengerApps.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
            <div class="flex gap-3 items-start">
                <input id="form-messenger-other" type="text" placeholder="${t.labels.otherApp}" class="hidden flex-1 p-4 rounded-xl border border-rose-100 outline-none">
                <div class="flex flex-col flex-1 gap-1">
                    <input type="tel" id="form-phone" required value="+" class="p-4 rounded-xl border border-rose-100 outline-none w-full" placeholder="+359...">
                    <span class="text-xs text-slate-400 ml-1">${t.labels.phoneHint}</span>
                </div>
            </div>
        </div>`;
}

function renderEnrolForm(lang = 'en') {
    const container = document.getElementById('enrolment-form-container');
    if (!container) return;
    const t = enrolTranslations[lang] || enrolTranslations['en'];
    container.innerHTML = `
        <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">${t.title}</h2>
        <p class="text-slate-500 mb-8">${t.desc}</p>
        <form id="active-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.name}*</label><input type="text" id="form-name" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.email}*</label><input type="email" id="form-email" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            ${messengerPhoneBlock(t)}
            <div class="flex flex-col">
                <label class="font-bold text-sm text-slate-600 mb-1">${t.questions.lang}*</label>
                <select id="form-target" required onchange="handleOther(this, 'other-lang')" class="p-4 rounded-xl border border-rose-100 bg-white">
                    <option value="" disabled selected>${t.questions.select}</option>
                    ${t.options.langs.map(l => `<option value="${l}">${l}</option>`).join('')}
                </select>
                <input type="text" id="other-lang" placeholder="${t.questions.other}" class="hidden mt-2 p-4 rounded-xl border border-rose-100 outline-none">
            </div>
            <div class="flex flex-col">
                <label class="font-bold text-sm text-slate-600 mb-1">${t.questions.level}*</label>
                <select id="form-level" required class="p-4 rounded-xl border border-rose-100 bg-white">
                    <option value="" disabled selected>${t.questions.select}</option>
                    ${t.options.levels.map(l => `<option value="${l}">${l}</option>`).join('')}
                </select>
            </div>
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.native}*</label><input type="text" id="form-native" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.schedule}*</label><input type="text" id="form-schedule" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col col-span-full">
                <label class="font-bold text-sm text-slate-600 mb-1">${t.questions.type}*</label>
                <select id="form-type" required onchange="handleOther(this, 'other-type')" class="p-4 rounded-xl border border-rose-100 bg-white">
                    <option value="" disabled selected>${t.questions.select}</option>
                    ${t.options.types.map(l => `<option value="${l}">${l}</option>`).join('')}
                </select>
                <input type="text" id="other-type" placeholder="${t.questions.other}" class="hidden mt-2 p-4 rounded-xl border border-rose-100 outline-none">
            </div>
            <div class="flex flex-col col-span-full">
                <label class="font-bold text-sm text-slate-600 mb-1">${t.questions.find}*</label>
                <select id="form-find" required onchange="handleOther(this, 'other-find')" class="p-4 rounded-xl border border-rose-100 bg-white">
                    <option value="" disabled selected>${t.questions.select}</option>
                    ${t.options.find.map(l => `<option value="${l}">${l}</option>`).join('')}
                </select>
                <input type="text" id="other-find" placeholder="${t.questions.other}" class="hidden mt-2 p-4 rounded-xl border border-rose-100 outline-none">
            </div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.goals}</label><textarea id="form-goals" class="p-4 rounded-xl border border-rose-100 h-32 outline-none"></textarea></div>
            <button type="submit" class="col-span-full bg-primary text-white p-5 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">${t.submit}</button>
        </form>
    `;
    document.getElementById('active-form').onsubmit = (e) => { e.preventDefault(); sendToGoogle(); };
}

function handleMessengerOther(sel) {
    const other = document.getElementById('form-messenger-other');
    if (!other) return;
    const v = sel.value.toLowerCase();
    if (v.includes('other') || v.includes('друго') || v.includes('другое') || v.includes('其他')) {
        other.classList.remove('hidden');
        other.required = true;
    } else {
        other.classList.add('hidden');
        other.required = false;
    }
}

function handleOther(selectEl, otherId) {
    const otherInput = document.getElementById(otherId);
    if (selectEl.value.includes('Other') || selectEl.value.includes('Друго') || selectEl.value.includes('Другое') || selectEl.value.includes('其他')) {
        otherInput.classList.remove('hidden');
        otherInput.required = true;
    } else {
        otherInput.classList.add('hidden');
        otherInput.required = false;
    }
}

async function sendToGoogle() {
    const btn = document.querySelector('button[type="submit"]');
    const container = document.getElementById('enrolment-form-container');
    const lang = localStorage.getItem('preferredLang') || 'en';
    const t = enrolTranslations[lang] || enrolTranslations['en'];
    const STUDENT_URL = 'https://script.google.com/macros/s/AKfycbxyejt5JgVn4w7SIVkK3SyDUbrng0ZS_CGMbnAiV0NjEavKKWb-4nHPr34XaI3bEtIX/exec';

    const getVal = (id, otherId) => {
        const sel = document.getElementById(id);
        if (!sel) return "";
        const val = sel.value;
        if (val.includes('Other') || val.includes('Друго') || val.includes('Другое') || val.includes('其他')) {
            const other = document.getElementById(otherId);
            return other ? other.value : val;
        }
        return val;
    };

    const messengerSel = document.getElementById('form-messenger');
    const messengerOther = document.getElementById('form-messenger-other');
    const messengerVal = messengerSel ? messengerSel.value : '';
    const isOtherApp = messengerVal.toLowerCase().includes('other') || messengerVal.toLowerCase().includes('друго') || messengerVal.toLowerCase().includes('другое') || messengerVal.includes('其他');
    const messengerLabel = isOtherApp && messengerOther ? messengerOther.value : messengerVal;
    const phoneVal = document.getElementById('form-phone').value;

    const data = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        phone: `${messengerLabel}: ${phoneVal}`,
        target_lang: getVal('form-target', 'other-lang'),
        level: document.getElementById('form-level').value,
        native_lang: document.getElementById('form-native').value,
        schedule: document.getElementById('form-schedule').value,
        lesson_type: getVal('form-type', 'other-type'),
        found_via: getVal('form-find', 'other-find'),
        comments: document.getElementById('form-goals').value
    };

    if (btn) btn.innerText = "Submitting... Please wait";

    try {
        await fetch(STUDENT_URL, { method: 'POST', body: JSON.stringify(data) });
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-6">✨</div>
                <h3 class="text-2xl font-bold text-primary mb-2">${t.success.title}</h3>
                <p class="text-slate-500 mb-8">${t.success.msg}</p>
                <button onclick="location.reload()" class="bg-primary/10 text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all">${t.success.btn}</button>
            </div>`;
    } catch (e) {
        console.error("Submission error:", e);
        alert("Something went wrong. Please try again.");
    }
}

// 8. SINGLE DOMContentLoaded — runs once on every page
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'en';

    if (document.getElementById('catalog-container')) loadCatalog();
    if (document.getElementById('enrolment-form-container')) renderEnrolForm(savedLang);
    if (document.getElementById('tutor-form-container')) renderTutorForm(savedLang);
});