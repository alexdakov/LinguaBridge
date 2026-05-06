// 1. GLOBAL STATE
let courseData = [];
let currentType = 'g'; 
let currentCurrency = 'usd';
let activeLanguage = 'all'; 
const symbols = { usd: '$', eur: '€', rub: '₽', cny: '¥' };

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
        if(container) {
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
                    class="text-3xl transition-all px-2 cursor-pointer ${activeLanguage === lang.title ? 'scale-125 grayscale-0' : 'grayscale hover:grayscale-0'}">
                ${lang.flag}
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

    const filteredData = activeLanguage === 'all' 
        ? courseData 
        : courseData.filter(l => l.title === activeLanguage);

    filteredData.forEach(lang => {
        const section = document.createElement('div');
        section.className = 'space-y-8 mb-16 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]';
        
        section.innerHTML = `
            <div class="flex items-center gap-4 border-l-4 border-primary pl-6">
                <div class="text-4xl">${lang.flag}</div>
                <div>
                    <h3 class="text-2xl font-bold text-on-surface">${lang.title}</h3>
                    <p class="text-slate-500 mt-1">${lang.desc || ''}</p>
                </div>
            </div>
            <div class="overflow-x-auto rounded-xl border border-outline-variant/30 coral-shadow bg-white">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-primary text-white">
                        <tr>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">Course</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">Level</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider">Duration</th>
                            <th class="p-5 font-semibold text-sm uppercase tracking-wider text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody class="text-on-surface-variant">
                        ${lang.courses.map((course, idx) => {
                            const priceKey = `${currentType}_${currentCurrency}`;
                            return `
                                <tr class="${idx % 2 === 1 ? 'bg-rose-50/30' : 'bg-white'} border-b border-outline-variant/10 last:border-0">
                                    <td class="p-5 font-medium text-on-surface">${course.name}</td>
                                    <td class="p-5 text-sm">${course.level}</td>
                                    <td class="p-5 text-sm">${course.dur}</td>
                                    <td class="p-5 font-bold text-primary text-right">
                                        ${symbols[currentCurrency]}${course[priceKey]} / hr
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(section);
    });
}

// 5. FILTER CONTROLS
function toggleType() {
    currentType = (currentType === 'g') ? 'i' : 'g';
    const knob = document.getElementById('toggle-knob');
    const bg = document.getElementById('type-toggle');
    const groupLabel = document.getElementById('label-group');
    const individualLabel = document.getElementById('label-individual');

    knob.style.transform = (currentType === 'i') ? 'translateX(24px)' : 'translateX(0px)';
    bg.style.backgroundColor = (currentType === 'i') ? '#a93444' : '#64748b';
    
    if (groupLabel && individualLabel) {
        groupLabel.classList.toggle('text-primary', currentType === 'g');
        groupLabel.classList.toggle('text-slate-400', currentType === 'i');
        individualLabel.classList.toggle('text-primary', currentType === 'i');
        individualLabel.classList.toggle('text-slate-400', currentType === 'g');
    }
    renderCatalog();
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
    slider.scrollBy({
      left: distance,
      behavior: 'smooth'
    });
  }
}

// UPDATED EMAIL CLIENT (Source 1)
async function sendEmailNow() {
    const btn = document.querySelector('button[onclick="sendEmailNow()"]');
    const originalText = btn ? btn.innerText : "Send Message";
    
    // 1. Basic validation to prevent sending empty emails
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert("Please fill in all required fields.");
        return;
    }

    if (btn) {
        btn.innerText = "Sending...";
        btn.disabled = true; // Prevent double-clicking
    }
    
    const formData = {
        name: name,
        email: email,
        subject: document.getElementById('contact-subject').value || "No Subject",
        message: message
    };

    try {
        const response = await fetch('https://linguabridge-email-form-handler.alextdakov.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('contact-form').innerHTML = '<h3>Thank you! We will be in touch soon.</h3>';
            // 2. Clear the form after success
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-subject').value = '';
            document.getElementById('contact-message').value = '';
        } else {
            const err = await response.text();
            alert("Error: " + err);
        }
    } catch (error) {
        alert("Connection error. Please check your internet and try again.");
    } finally {
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}
// 1. DATA DICTIONARY
const enrolTranslations = {
    en: {
        title: "Student Application – LinguaBridge",
        desc: "Fill out this form to request tutoring. We’ll contact you shortly to match you with the right tutor.",
        labels: { name: "Full Name", email: "Email Address", phone: "Phone number / WhatsApp / Viber / Telegram", native: "What is your native language?", schedule: "Preferred learning schedule", goals: "Additional comments or learning goals" },
        questions: { lang: "Which language do you want to learn?", level: "What is your current level?", type: "What type of lessons are you interested in?", find: "How did you find us?", select: "-- Select from the list --", other: "Please specify:" },
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
        labels: { name: "Вашите имена", email: "Имейл адрес", phone: "Телефонен номер / WhatsApp / Viber / Telegram", native: "Какъв е твоят роден език?", schedule: "Предпочитан график за обучение", goals: "Допълнителни коментари или учебни цели" },
        questions: { lang: "Кой език искате да научите?", level: "Какво е текущото ви ниво?", type: "От какъв тип уроци се интересувате?", find: "Как ни открихте?", select: "-- Изберете от списъка --", other: "Моля, уточнете:" },
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
        labels: { name: "Ваше имя", email: "Адрес электронной почты", phone: "Номер телефона / WhatsApp / Viber / Telegram", native: "Какой ваш родной язык?", schedule: "Предпочтительный график обучения", goals: "Дополнительные комментарии или учебные цели" },
        questions: { lang: "Какой язык вы хотите выучить?", level: "Какой у вас сейчас уровень?", type: "Какие виды занятий вас интересуют?", find: "Как вы нас нашли?", select: "-- Выберите из списка --", other: "Пожалуйста, уточните:" },
        options: {
            langs: ["Болгарский язык", "Китайский язык", "Английский язык", "Немецкий язык", "Русский язык", "Другое"],
            levels: ["Начинающий (А1)", "Элементарный (A2)", "Средний (B1–B2)", "Продвинутый (C1–C2)", "Не уверен/нулевой"],
            types: ["Индивидуальные занятия в режиме реального времени", "Групповые занятия", "Курс в удобном для вас темпе", "Разговорная практика", "Подготовка к экзаменам (например, TORFL, IELTS)", "Другое"],
            find: ["Instagram", "Facebook", "Поиск в Google", "Рекомендация от друзей", "Другое"]
        },
        submit: "Отправить заявку",
        success: { title: "Спасибо за вашу заявку!", msg: "Наша команда скоро свяжется с вами.", btn: "Заполнить еще раз" }
    }
};
// --- TUTOR FORM LOGIC ---
const tutorTranslations = {
    en: {
        title: "Tutor Application – LinguaBridge",
        desc: "Apply to become a language tutor. Fill in the form below and we’ll contact you shortly.",
        labels: { name: "Full Name*", email: "Email Address*", phone: "Phone / WhatsApp / Telegram*", langs: "Which language(s) do you teach?*", edu: "Education and qualifications*", certs: "Do you hold any certificates? (e.g. CELTA)*", exp: "Teaching experience*", hours: "Preferred working hours*", bio: "Short intro about yourself*", cv: "Upload your CV (PDF only)*" },
        submit: "Send Application",
        success: "Thank you! Your application has been received."
    }
};

function renderTutorForm(lang = 'en') {
    const container = document.getElementById('tutor-form-container');
    if (!container) return;
    const t = tutorTranslations[lang] || tutorTranslations['en'];
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-50">
            <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">${t.title}</h2>
            <p class="text-slate-500 mb-8">${t.desc}</p>
            <form id="tutor-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.name}</label>
                    <input type="text" id="t-name" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.email}</label>
                    <input type="email" id="t-email" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.phone}</label>
                    <input type="text" id="t-phone" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.langs}</label>
                    <input type="text" id="t-langs" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.edu}</label>
                    <textarea id="t-edu" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea>
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.certs}</label>
                    <input type="text" id="t-certs" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.exp}</label>
                    <textarea id="t-exp" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea>
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.hours}</label>
                    <input type="text" id="t-hours" required class="p-4 rounded-xl border border-rose-100 outline-none">
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.bio}</label>
                    <textarea id="t-bio" required class="p-4 rounded-xl border border-rose-100 outline-none h-24"></textarea>
                </div>
                <div class="flex flex-col col-span-full">
                    <label class="font-bold text-sm text-slate-600 mb-1">${t.labels.cv}</label>
                    <input type="file" id="t-cv" accept=".pdf" required class="p-4 rounded-xl border border-rose-100">
                </div>
                <button type="submit" class="col-span-full bg-primary text-white p-5 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
                    ${t.submit}
                </button>
            </form>
        </div>
    `;
    document.getElementById('tutor-form').onsubmit = handleTutorSubmit;
}
// TUTOR FORM SUBMISSION HANDLER
async function handleTutorSubmit(e) {
    e.preventDefault();

    const btn = e.target.querySelector('button');
    const TUTOR_URL = 'https://script.google.com/macros/s/AKfycbzCXUF7IcEl2RD1YOJSsNiV4KhKDuXjKOg4fzmSGX5nas6buRbsCB0ODG6lZ-z0GOksLg/exec';

    btn.innerText = "Uploading... Please wait";
    btn.disabled = true;

    const file = document.getElementById('t-cv').files[0];

    if (!file) {
        alert("No CV file selected");
        btn.innerText = "Send Application";
        btn.disabled = false;
        return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
        alert("Failed to read file");
        btn.innerText = "Send Application";
        btn.disabled = false;
    };

    reader.onload = async () => {
    try {
        const base64 = reader.result.split(',')[1];

        const data = {
            isTutor: true,
            name: document.getElementById('t-name').value,
            email: document.getElementById('t-email').value,
            phone: document.getElementById('t-phone').value,
            langs: document.getElementById('t-langs').value,
            edu: document.getElementById('t-edu').value,
            certs: document.getElementById('t-certs').value,
            exp: document.getElementById('t-exp').value,
            hours: document.getElementById('t-hours').value,
            bio: document.getElementById('t-bio').value,
            cvFile: base64,
            cvName: document.getElementById('t-name').value + "_CV.pdf"
        };

        // no-cors means the response is opaque — we can't read res.ok or res.status.
        // If the fetch itself doesn't throw, we treat it as success.
        await fetch(TUTOR_URL, {
            method: "POST",
            mode: "no-cors",   // required for Google Apps Script
            body: JSON.stringify(data)
        });

        // Reached here = request was sent without a network error, show success
        document.getElementById('tutor-form-container').innerHTML = `
            <div class="text-center py-20">
                <h2 class="text-2xl font-bold text-primary">Application submitted!</h2>
                <p>We will review your application and contact you soon.</p>
            </div>
        `;

    } catch (err) {
        // Only fires on actual network failure (offline, DNS error, etc.)
        console.error(err);
        alert("Submission failed. Please check your connection and try again.");

        btn.innerText = "Send Application";
        btn.disabled = false;
    }
};

    reader.readAsDataURL(file);
}

// 2. RENDER THE FORM
function renderEnrolForm(lang = 'en') {
    const container = document.getElementById('enrolment-form-container');
    if (!container) return;
    const t = enrolTranslations[lang];

    container.innerHTML = `
        <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">${t.title}</h2>
        <p class="text-slate-500 mb-8">${t.desc}</p>
        <form id="active-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Text Inputs with labels above -->
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.name}*</label><input type="text" id="form-name" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.email}*</label><input type="email" id="form-email" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            <div class="flex flex-col col-span-full"><label class="font-bold text-sm text-slate-600 mb-1">${t.labels.phone}*</label><input type="text" id="form-phone" required class="p-4 rounded-xl border border-rose-100 outline-none"></div>
            
            <!-- Dropdowns with default selection -->
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

            <button type="submit" class="col-span-full bg-primary text-white p-5 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
                ${t.submit}
            </button>
        </form>
    `;

    // Handle form submission properly with validation
    document.getElementById('active-form').onsubmit = (e) => {
        e.preventDefault();
        sendToGoogle();
    };
}

// Function to show/hide "Other" text bar
function handleOther(selectEl, otherId) {
    const otherInput = document.getElementById(otherId);
    if (selectEl.value.includes('Other') || selectEl.value.includes('Друго') || selectEl.value.includes('Другое')) {
        otherInput.classList.remove('hidden');
        otherInput.required = true;
    } else {
        otherInput.classList.add('hidden');
        otherInput.required = false;
    }
}

// 3. STUDENT FORM SUBMISSION
async function sendToGoogle() {
    const btn = document.querySelector('button[type="submit"]');
    const container = document.getElementById('enrolment-form-container');
    const lang = localStorage.getItem('preferredLang') || 'en';
    const t = enrolTranslations[lang];
    
    const STUDENT_URL = 'https://script.google.com/macros/s/AKfycbxyejt5JgVn4w7SIVkK3SyDUbrng0ZS_CGMbnAiV0NjEavKKWb-4nHPr34XaI3bEtIX/exec';

    const getVal = (id, otherId) => {
        const sel = document.getElementById(id);
        if (!sel) return "";
        const val = sel.value;
        const otherInput = document.getElementById(otherId);
        // Returns the 'Other' text box value if 'Other' is selected in the dropdown
        if (val.includes('Other') || val.includes('Друго')) {
            return otherInput ? otherInput.value : val;
        }
        return val;
    };

    const data = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        phone: document.getElementById('form-phone').value,
        target_lang: getVal('form-target', 'other-lang'),
        level: document.getElementById('form-level').value,
        native_lang: document.getElementById('form-native').value,
        schedule: document.getElementById('form-schedule').value,
        lesson_type: getVal('form-type', 'other-type'),
        found_via: getVal('form-find', 'other-find'), // This matches the Google Script data.found_via
        comments: document.getElementById('form-goals').value
    };

    if (btn) btn.innerText = "Submitting... Please wait";

    try {
        await fetch(STUDENT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-6">✨</div>
                <h3 class="text-2xl font-bold text-primary mb-2">${t.success.title}</h3>
                <p class="text-slate-500 mb-8">${t.success.msg}</p>
                <button onclick="location.reload()" class="bg-primary/10 text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all">
                    ${t.success.btn}
                </button>
            </div>
        `;
    } catch (e) {
    console.error("Submission error:", e);
    alert("Something went wrong. Please try again.");
    }
}

// Show English form by default when page loads
// 1. The main function called by your Nav Bar buttons
function changeGlobalLanguage(lang) {
    localStorage.setItem('preferredLang', lang);

    // ✅ APPLY UI TRANSLATIONS
    applyUITranslations(lang);

    // existing logic (KEEP)
    if (document.getElementById('enrolment-form-container')) {
        renderEnrolForm(lang);
    }

    if (document.getElementById('tutor-form-container')) {
        renderTutorForm(lang);
    }

    updateSwitcherUI(lang);
}

// 2. Visual feedback (highlighting the active language)
function updateSwitcherUI(lang) {
    const btns = ['en', 'bg', 'ru'];
    btns.forEach(b => {
        const el = document.querySelector(`.lang-btn-${b}`);
        if (el) {
            if (b === lang) {
                el.classList.add('bg-primary-container', 'text-white');
                el.classList.remove('opacity-70');
            } else {
                el.classList.remove('bg-primary-container', 'text-white');
                el.classList.add('opacity-70');
            }
        }
    });
}

// This listener runs every time a page loads
window.addEventListener('DOMContentLoaded', () => {
    // 1. Determine active language
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    
    // 2. Initialize Catalog (if on main page)
    if (typeof loadCatalog === "function" && document.getElementById('catalog-container')) {
        loadCatalog();
    }

    // 3. Initialize Student Form (if on enrol_5.html)
    if (document.getElementById('enrolment-form-container')) {
        renderEnrolForm(savedLang);
    }

    // 4. Initialize Tutor Form (Explicitly check tutor_signup.html)
    const tutorContainer = document.getElementById('tutor-form-container');
    if (tutorContainer) {
        console.log("Tutor container found, rendering form..."); // Helps you debug in F12
        renderTutorForm(savedLang);
    }
    
    // 5. Update UI flags
    updateSwitcherUI(savedLang);
});
// TRANSLATION
const uiTranslations = {
  en: {
    home: "Home",
    languages: "Languages",
    about: "About",
    contact: "Contact",
    enrol: "Enrol Now",
    hero_title: "Master any <span class='text-[#ff7582]'>language</span> with ease.",
    hero_desc: "Learn foreign languages online with private lessons — it's easy and affordable.",
    view_courses: "View All Courses"
  },
  bg: {
    home: "Начало",
    languages: "Езици",
    about: "За нас",
    contact: "Контакт",
    enrol: "Запиши се",
    hero_title: "Овладей всеки <span class='text-[#ff7582]'>език</span> с лекота.",
    hero_desc: "Научи чужди езици онлайн с индивидуални уроци — лесно и достъпно.",
    view_courses: "Виж всички курсове"
  }
};

// TRANSLATION ENGINE
function applyUITranslations(lang) {
    const t = uiTranslations[lang];
    if (!t) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    document.documentElement.lang = lang;
}