/**
 * WiseCat i18n Engine
 * Centralized translation management
 */
const WiseCatI18n = {
    currentLang: 'en',
    translations: {
        en: {
            // Portal / Entry
            portal_title: "WiseCat Portal",
            portal_subtitle: "Your Personal AI Assistant Hub",
            login_subtitle: "Sign in to continue",
            btn_google: "Continue with Google",
            btn_microsoft: "Continue with Microsoft",
            btn_signin: "Sign In",
            btn_signup: "Create Account",
            balance_label: "Available Balance",
            service_res_title: "Restaurant Reservation",
            service_res_desc: "AI-powered booking assistant for any restaurant",
            service_mouthpiece_title: "Mouthpiece Service",
            service_mouthpiece_desc: "AI Voice representation service (Beta)",

            // Shared Service Keys
            btn_submit: "Start AI Call",
            btn_refill: "Refill",
            btn_back: "← Back to Portal",
            footer: "Automated call service provided by WiseCat AI",
            msg_calling: "WiseCat Assistant is calling!",
            msg_success: "Success",
            msg_failed: "Failed",
            msg_fail_alert: "Action failed, please try again",
            text_credits: "Current Credits: $0 USD",

            // Mouthpiece Specific
            mouthpiece_title: "📢 AI Mouthpiece",
            label_your_name: "👤 Your Name",
            label_recipient_name: "👤 Recipient Name",
            placeholder_name: "English name only",
            placeholder_recipient: "English name only",
            label_phone: "📞 Recipient Phone",
            label_script: "📄 AI Message Script",
            placeholder_script: "What should the AI say?",
            label_schedule: "Schedule Call Preference",
            option_asap: "Call ASAP",
            option_open: "Call when available",
            validation_name: "Names must be English letters (hyphens/underscores allowed)",

            // Reservation Specific
            reservation_title: "✨ AI Reservation",
            label_name: "👤 Name (English Only)",
            label_party: "👥 Party Size",
            label_date: "📅 Date",
            label_time: "⏰ Time",
            label_search: "🔍 Search Restaurant",
            placeholder_search: "Enter restaurant name or address",
            info_search: "Phone number auto-filled after search",
            label_note: "📝 Special Requests (Optional)",
            placeholder_note: "Any special requests?",
            label_retry: "Re-try 1 time",
            warning_retry: "(This will charge you twice, careful)",
            option_res_open: "Call when restaurant open",
            placeholder_date: "Select Date",
            helper_title: "AI Prompt Helper 🐱",
            res_ex1_t: "Simple Reservation",
            res_ex1_v: "Reserve a table for 4 at [Restaurant Name] for tonight.",
            res_ex2_t: "Item Pre-order",
            res_ex2_v: "Reserve a cake at the bakery before 5PM.",
            res_ex3_t: "Holiday Inquiry",
            res_ex3_v: "Check if you are opening on the upcoming holiday.",
            mouth_ex1_t: "Personal Message",
            mouth_ex1_v: "Hey XXX, I'm trying to call you but you blocked me. I just wanted to say sorry.",
            mouth_ex2_t: "Urgent Meeting",
            mouth_ex2_v: "I'm in an out-of-service area, I need to sync up the meet up point with the driver now.",
            mouth_ex3_t: "Urgent Inquiry",
            mouth_ex3_v: "Checking some urgent information with you now."
        },
        zh: {
            portal_title: "WiseCat 門戶",
            portal_subtitle: "您的個人 AI 助手中心",
            login_subtitle: "請登錄以繼續",
            btn_google: "使用 Google 帳號登錄",
            btn_microsoft: "使用 Microsoft 帳號登錄",
            btn_signin: "登錄",
            btn_signup: "創建帳號",
            balance_label: "可用餘額",
            service_res_title: "餐廳代訂",
            service_res_desc: "AI 驅動的餐廳預約助手",
            service_mouthpiece_title: "AI 傳聲筒",
            service_mouthpiece_desc: "AI 語音代表服務 (Beta)",

            btn_submit: "啟動 AI 撥號",
            btn_refill: "儲值",
            btn_back: "← 返回主頁面",
            footer: "由 WiseCat AI 提供自動化撥號服務",
            msg_calling: "WiseCat 助手已開始撥號！",
            msg_success: "撥號成功",
            msg_failed: "撥號失敗",
            msg_fail_alert: "操作失敗，請稍後再試",
            text_credits: "目前餘額: $0 USD",

            mouthpiece_title: "📢 WiseCat 傳聲筒",
            label_your_name: "👤 您的姓名",
            label_recipient_name: "👤 收件人姓名",
            placeholder_name: "請輸入英文姓名",
            placeholder_recipient: "收件人英文姓名",
            label_phone: "📞 收件人電話",
            label_script: "📄 AI 語音腳本",
            placeholder_script: "AI 應該說什麼內容？",
            label_schedule: "撥打偏好",
            option_asap: "立即撥打 (ASAP)",
            option_open: "對方有空時撥打",
            validation_name: "姓名限英文 (可含 - 或 _)",

            reservation_title: "✨ AI 餐廳代訂",
            label_name: "👤 姓名 (限英文)",
            label_party: "👥 用餐人數",
            label_date: "📅 預約日期",
            label_time: "⏰ 預約時間",
            label_search: "🔍 搜尋餐廳",
            placeholder_search: "輸入餐廳名稱或地址",
            info_search: "電話號碼將在搜尋後自動填入",
            label_note: "📝 特殊需求 (選填)",
            placeholder_note: "有哪些特殊需求？",
            label_retry: "自動重撥 1 次",
            warning_retry: "(這將扣除兩次費用，請留意)",
            option_res_open: "餐廳營業時撥打",
            placeholder_date: "選擇預約日期",
            helper_title: "AI 範例語法 🐱",
            res_ex1_t: "簡單預約",
            res_ex1_v: "今晚在 [餐廳名稱] 預訂一桌 4 人位。",
            res_ex2_t: "品項預留",
            res_ex2_v: "在下午 5 點前到麵包店預留一個蛋糕。",
            res_ex3_t: "假日確認",
            res_ex3_v: "詢問特定節假日是否照常營業。",
            mouth_ex1_t: "個人訊息",
            mouth_ex1_v: "嘿 XXX，我試著撥給你但你封鎖我了，我只是想跟你說聲抱歉。",
            mouth_ex2_t: "緊急會合",
            mouth_ex2_v: "我目前處於收訊不佳的地區，現在需要與司機同步會合地點。",
            mouth_ex3_t: "緊急詢問",
            mouth_ex3_v: "現在要與您確認一些緊急資訊。"
        },
        jp: {
            portal_title: "WiseCat ポータル",
            portal_subtitle: "あなたのパーソナルAIアシスタントハブ",
            login_subtitle: "サインインして続行",
            btn_google: "Googleで続行",
            btn_microsoft: "Microsoftで続行",
            btn_signin: "サインイン",
            btn_signup: "アカウント作成",
            balance_label: "利用可能残高",
            service_res_title: "レストラン予約",
            service_res_desc: "あらゆるレストランのAI予約アシスタント",
            service_mouthpiece_title: "マウスピースサービス",
            service_mouthpiece_desc: "AI音声代表サービス（ベータ版）",

            btn_submit: "AI通話を開始",
            btn_refill: "チャージ",
            btn_back: "← ポータルに戻る",
            footer: "WiseCat AIによる自動通話サービス",
            msg_calling: "WiseCatアシスタントが通話中です！",
            msg_success: "成功",
            msg_failed: "失敗",
            msg_fail_alert: "失敗しました。もう一度お試しください",
            text_credits: "現在のクレジット: $0 USD",

            mouthpiece_title: "📢 WiseCat マウスピース",
            label_your_name: "👤 あなたの名前",
            label_recipient_name: "👤 受信者の名前",
            placeholder_name: "英語名のみ",
            placeholder_recipient: "英語名のみ",
            label_phone: "📞 受信者電話番号",
            label_script: "📄 AI 音声スクリプト",
            placeholder_script: "AI は何を話すべきですか？",
            label_schedule: "通話スケジュール",
            option_asap: "すぐに電話 (ASAP)",
            option_open: "対応可能な時に電話",
            validation_name: "名前は英語のみ（ハイフン/アンダースコア可）",

            reservation_title: "✨ AI レストラン予約",
            label_name: "👤 名前 (英語のみ)",
            label_party: "👥 予約人数",
            label_date: "📅 予約日",
            label_time: "⏰ 予約時間",
            label_search: "🔍 レストラン検索",
            placeholder_search: "店名または住所を入力",
            info_search: "検索後、電話番号が自動入力されます",
            label_note: "📝 特別なリクエスト (任意)",
            placeholder_note: "何かリクエストはありますか？",
            label_retry: "1回再試行",
            warning_retry: "(2回分の料金が発生します。ご注意ください)",
            option_res_open: "開店時に電話",
            placeholder_date: "日付を選択",
            helper_title: "AIプロンプトヘルパー 🐱",
            res_ex1_t: "簡単な予約",
            res_ex1_v: "今夜、[レストラン名]で4人のテーブルを予約してください。",
            res_ex2_t: "商品の予約",
            res_ex2_v: "午後5時までにパン屋でケーキを予約してください。",
            res_ex3_t: "休日の問い合わせ",
            res_ex3_v: "今度の祝日に営業しているか確認してください。",
            mouth_ex1_t: "個人的なメッセージ",
            mouth_ex1_v: "ねえXXX、電話しようとしたけどブロックされているみたい。ただ謝りたかっただけなんだ。",
            mouth_ex2_t: "緊急の待ち合わせ",
            mouth_ex2_v: "圏外にいるので、今すぐ運転手と待ち合わせ場所を確認したいです。",
            mouth_ex3_t: "緊急の問い合わせ",
            mouth_ex3_v: "今すぐ緊急の情報について確認したいです。"
        },
        kr: {
            portal_title: "WiseCat 포털",
            portal_subtitle: "개인용 AI 어시스턴트 허브",
            login_subtitle: "계속하려면 로그인하세요",
            btn_google: "Google 계정으로 계속하기",
            btn_microsoft: "Microsoft 계정으로 계속하기",
            btn_signin: "로그인",
            btn_signup: "계정 생성",
            balance_label: "사용 가능한 잔액",
            service_res_title: "식당 예약",
            service_res_desc: "모든 식당을 위한 AI 기반 예약 도우미",
            service_mouthpiece_title: "마우스피스 서비스",
            service_mouthpiece_desc: "AI 음성 대리 서비스 (베타)",
            btn_submit: "AI 통화 시작",
            btn_refill: "충전",
            btn_back: "← 포털로 돌아가기",
            footer: "WiseCat AI에서 제공하는 자동 통화 서비스",
            msg_calling: "WiseCat 어시스턴트가 통화 중입니다!",
            msg_success: "성공",
            msg_failed: "실패",
            msg_fail_alert: "작업 실패, 다시 시도하십시오",
            text_credits: "현재 크레딧: $0 USD",
            mouthpiece_title: "📢 WiseCat 마우스피스",
            label_your_name: "👤 이름",
            label_recipient_name: "👤 수신자 이름",
            placeholder_name: "영어 이름만",
            placeholder_recipient: "영어 이름만",
            label_phone: "📞 수신자 전화번호",
            label_script: "📄 AI 메시지 스크립트",
            placeholder_script: "AI가 무엇을 말해야 합니까?",
            label_schedule: "통화 일정 설정",
            option_asap: "즉시 통화 (ASAP)",
            option_open: "가능할 때 통화",
            validation_name: "이름은 영문자만 가능합니다 (하이픈/언더스코어 허용)",
            reservation_title: "✨ AI 식당 예약",
            label_name: "👤 이름 (영어만)",
            label_party: "👥 인원",
            label_date: "📅 날짜",
            label_time: "⏰ 시간",
            label_search: "🔍 식당 검색",
            placeholder_search: "식당 이름 또는 주소 입력",
            info_search: "검색 후 전화번호 자동 입력",
            label_note: "📝 특별 요청 (선택)",
            placeholder_note: "특별한 요청이 있으십니까?",
            label_retry: "1회 재시도",
            warning_retry: "(두 번 청구됩니다. 주의하세요)",
            option_res_open: "영업 시 통화",
            placeholder_date: "날짜 선택",
            helper_title: "AI 프롬프트 도우미 🐱",
            res_ex1_t: "간단한 예약",
            res_ex1_v: "오늘 밤 [식당 이름]에 4인 테이블을 예약해 주세요.",
            res_ex2_t: "품목 예약",
            res_ex2_v: "오후 5시 이전에 빵집에서 케이크를 예약해 주세요.",
            res_ex3_t: "공휴일 문의",
            res_ex3_v: "다가오는 공휴일에 영업하는지 확인해 주세요.",
            mouth_ex1_t: "개인 메시지",
            mouth_ex1_v: "XXX님, 전화를 시도했지만 차단되어 있어 죄송하다는 말을 전하고 싶습니다.",
            mouth_ex2_t: "긴급 미팅",
            mouth_ex2_v: "통신 서비스 지역이 아니라서 지금 바로 기사님과 만남 장소를 확인해야 합니다.",
            mouth_ex3_t: "긴급 문의",
            mouth_ex3_v: "지금 바로 긴급한 정보를 확인하고 싶습니다."
        },
        es: {
            portal_title: "Portal WiseCat",
            portal_subtitle: "Tu centro de asistentes personales IA",
            login_subtitle: "Inicia sesión para continuar",
            btn_google: "Continuar con Google",
            btn_microsoft: "Continuar con Microsoft",
            btn_signin: "Iniciar sesión",
            btn_signup: "Crear cuenta",
            balance_label: "Saldo disponible",
            service_res_title: "Reserva de restaurante",
            service_res_desc: "Asistente de reservas con IA para cualquier restaurante",
            service_mouthpiece_title: "Servicio de Boquilla",
            service_mouthpiece_desc: "Servicio de representación de voz con IA (Beta)",
            btn_submit: "Iniciar llamada IA",
            btn_refill: "Recargar",
            btn_back: "← Volver al portal",
            footer: "Servicio de llamada automatizada por WiseCat AI",
            msg_calling: "¡El asistente WiseCat está llamando!",
            msg_success: "Éxito",
            msg_failed: "Fallido",
            msg_fail_alert: "La acción falló, inténtalo de nuevo",
            text_credits: "Créditos actuales: $0 USD",
            mouthpiece_title: "📢 Boquilla WiseCat",
            label_your_name: "👤 Tu nombre",
            label_recipient_name: "👤 Nombre del destinatario",
            placeholder_name: "Solo nombre en inglés",
            placeholder_recipient: "Solo nombre en inglés",
            label_phone: "📞 Teléfono del destinatario",
            label_script: "📄 Guión de mensaje IA",
            placeholder_script: "¿Qué debería decir la IA?",
            label_schedule: "Preferencia de horario",
            option_asap: "Llamar lo antes posible",
            option_open: "Llamar cuando esté disponible",
            validation_name: "Nombres en letras inglesas (se permiten guiones)",
            reservation_title: "✨ Reserva con IA",
            label_name: "👤 Nombre (Solo inglés)",
            label_party: "👥 Personas",
            label_date: "📅 Fecha",
            label_time: "⏰ Hora",
            label_search: "🔍 Buscar restaurante",
            placeholder_search: "Ingrese nombre o dirección",
            info_search: "Teléfono autocompletado tras buscar",
            label_note: "📝 Pedidos (Opcional)",
            placeholder_note: "¿Alguna petición especial?",
            label_retry: "Reintentar 1 vez",
            warning_retry: "(Se cobrará dos veces)",
            option_res_open: "Llamar cuando esté abierto",
            placeholder_date: "Seleccionar fecha",
            helper_title: "Ayudante de IA 🐱",
            res_ex1_t: "Reserva Simple",
            res_ex1_v: "Reserva una mesa para 4 en [Nombre del Restaurante] para esta noche.",
            res_ex2_t: "Pedido de Artículo",
            res_ex2_v: "Reserva un pastel en la panadería antes de las 5 PM.",
            res_ex3_t: "Consulta de Festivo",
            res_ex3_v: "Consulta si abren en el próximo día festivo.",
            mouth_ex1_t: "Mensaje Personal",
            mouth_ex1_v: "Hola XXX, traté de llamarte pero me bloqueaste. Solo quería pedirte disculpas.",
            mouth_ex2_t: "Reunión Urgente",
            mouth_ex2_v: "Estoy en un área sin servicio, necesito coordinar el punto de encuentro con el conductor ahora.",
            mouth_ex3_t: "Consulta Urgente",
            mouth_ex3_v: "Verificando información urgente contigo ahora stesso."
        },
        fr: {
            portal_title: "Portail WiseCat",
            portal_subtitle: "Votre centre d'assistants IA personnels",
            login_subtitle: "Connectez-vous pour continuer",
            btn_google: "Continuer avec Google",
            btn_microsoft: "Continuer avec Microsoft",
            btn_signin: "Se connecter",
            btn_signup: "Créer un compte",
            balance_label: "Solde disponible",
            service_res_title: "Réservation de restaurant",
            service_res_desc: "Assistant de réservation IA pour tout restaurant",
            service_mouthpiece_title: "Service Porte-voix",
            service_mouthpiece_desc: "Service de représentation vocale IA (Bêta)",
            btn_submit: "Lancer l'appel IA",
            btn_refill: "Recharger",
            btn_back: "← Retour au portail",
            footer: "Service d'appel automatisé par WiseCat AI",
            msg_calling: "L'assistant WiseCat appelle !",
            msg_success: "Succès",
            msg_failed: "Échec",
            msg_fail_alert: "Échec de l'action, veuillez réessayer",
            text_credits: "Crédits actuels: $0 USD",
            mouthpiece_title: "📢 Porte-voix WiseCat",
            label_your_name: "👤 Votre nom",
            label_recipient_name: "👤 Nom du destinataire",
            placeholder_name: "Nom en anglais uniquement",
            placeholder_recipient: "Nom en anglais uniquement",
            label_phone: "📞 Téléphone du destinataire",
            label_script: "📄 Script du message IA",
            placeholder_script: "Que doit dire l'IA ?",
            label_schedule: "Préférence d'horaire",
            option_asap: "Appeler dès que possible",
            option_open: "Appeler si disponible",
            validation_name: "Noms en lettres anglaises (tirets autorisés)",
            reservation_title: "✨ Réservation IA",
            label_name: "👤 Nom (Anglais uniquement)",
            label_party: "👥 Personnes",
            label_date: "📅 Date",
            label_time: "⏰ Heure",
            label_search: "🔍 Chercher restaurant",
            placeholder_search: "Entrez le nom ou l'adresse",
            info_search: "Numéro rempli automatiquement",
            label_note: "📝 Demandes (Optionnel)",
            placeholder_note: "Des demandes spéciales ?",
            label_retry: "Réessayer 1 fois",
            warning_retry: "(Sera facturé deux fois)",
            option_res_open: "Appeler si ouvert",
            placeholder_date: "Choisir la date",
            helper_title: "Assistant de Prompt IA 🐱",
            res_ex1_t: "Réservation Simple",
            res_ex1_v: "Réservez une table pour 4 à [Nom du Restaurant] pour ce soir.",
            res_ex2_t: "Commande d'Article",
            res_ex2_v: "Réservez un gâteau à la boulangerie avant 17h00.",
            res_ex3_t: "Demande de Congé",
            res_ex3_v: "Vérifiez si vous êtes ouvert lors du prochain jour férié.",
            mouth_ex1_t: "Message Personnel",
            mouth_ex1_v: "Hé XXX, j'ai essayé de t'appeler mais tu m'as bloqué. Je voulais juste te dire que je suis désolé.",
            mouth_ex2_t: "Réunion Urgente",
            mouth_ex2_v: "Je suis dans une zone sans service, je dois coordonner le point de rencontre avec le chauffeur maintenant.",
            mouth_ex3_t: "Demande Urgente",
            mouth_ex3_v: "Vérification d'informations urgentes avec vous maintenant."
        },
        it: {
            portal_title: "Portale WiseCat",
            portal_subtitle: "Il tuo hub di assistenti personali IA",
            login_subtitle: "Accedi per continuare",
            btn_google: "Continua con Google",
            btn_microsoft: "Continua con Microsoft",
            btn_signin: "Accedi",
            btn_signup: "Crea account",
            balance_label: "Saldo disponibile",
            service_res_title: "Prenotazione ristorante",
            service_res_desc: "Assistente prenotazioni IA per qualsiasi ristorante",
            service_mouthpiece_title: "Servizio Boccaglio",
            service_mouthpiece_desc: "Servizio di rappresentanza vocale IA (Beta)",
            btn_submit: "Avvia chiamata IA",
            btn_refill: "Ricarica",
            btn_back: "← Torna al portale",
            footer: "Servizio di chiamata automatizzata da WiseCat AI",
            msg_calling: "L'assistente WiseCat sta chiamando!",
            msg_success: "Successo",
            msg_failed: "Fallito",
            msg_fail_alert: "Azione fallita, riprova",
            text_credits: "Crediti attuali: $0 USD",
            mouthpiece_title: "📢 Boccaglio WiseCat",
            label_your_name: "👤 Tuo nome",
            label_recipient_name: "👤 Nome destinatario",
            placeholder_name: "Solo nome in inglese",
            placeholder_recipient: "Solo nome in inglese",
            label_phone: "📞 Telefono destinatario",
            label_script: "📄 Script messaggio IA",
            placeholder_script: "Cosa dovrebbe dire l'IA?",
            label_schedule: "Preferenza orario",
            option_asap: "Chiama prima possibile",
            option_open: "Chiama se disponibile",
            validation_name: "Nomi in lettere inglesi (trattini consentiti)",
            reservation_title: "✨ Prenotazione IA",
            label_name: "👤 Nome (Solo inglese)",
            label_party: "👥 Persone",
            label_date: "📅 Data",
            label_time: "⏰ Ora",
            label_search: "🔍 Cerca ristorante",
            placeholder_search: "Inserisci nome o indirizzo",
            info_search: "Numero compilato dopo ricerca",
            label_note: "📝 Richieste (Opzionale)",
            placeholder_note: "Qualche richiesta speciale?",
            label_retry: "Riprova 1 volta",
            warning_retry: "(Addebito doppio)",
            option_res_open: "Chiama se aperto",
            placeholder_date: "Seleziona data",
            helper_title: "Assistente Prompt IA 🐱",
            res_ex1_t: "Prenotazione Semplice",
            res_ex1_v: "Prenota un tavolo per 4 a [Nome Ristorante] per stasera.",
            res_ex2_t: "Ordine Articolo",
            res_ex2_v: "Prenota una torta in pasticceria prima delle 17:00.",
            res_ex3_t: "Richiesta Festività",
            res_ex3_v: "Controlla se siete aperti durante la prossima festività.",
            mouth_ex1_t: "Messaggio Personale",
            mouth_ex1_v: "Ehi XXX, ho provato a chiamarti ma mi hai bloccato. volevo solo dirti che mi dispiace.",
            mouth_ex2_t: "Incontro Urgente",
            mouth_ex2_v: "Sono in una zona senza servizio, devo coordinare il punto di incontro con l'autista ora.",
            mouth_ex3_t: "Richiesta Urgente",
            mouth_ex3_v: "Verifica di informazioni urgenti con te ora."
        }
    },

    init() {
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language.slice(0, 2);
        this.currentLang = savedLang || (this.translations[browserLang] ? browserLang : 'en');

        // Setup language selector if it exists
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => this.setLanguage(e.target.value));
        }

        this.apply();

        // Listen for user updates to refresh credits
        window.addEventListener('userUpdated', () => this.apply());
    },

    setLanguage(lang) {
        if (!this.translations[lang]) lang = 'en';
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
        this.apply();
    },

    apply() {
        const lang = this.currentLang;
        const dict = this.translations[lang] || this.translations['en'];

        // Update document title if a specific title key exists
        const pageTitleKey = document.title.includes('Mouthpiece') ? 'mouthpiece_title' :
            document.title.includes('Reservation') ? 'reservation_title' : 'portal_title';
        if (dict[pageTitleKey]) {
            document.title = "WiseCat - " + dict[pageTitleKey].replace(/[^a-zA-Z\s]/g, '').trim();
        }

        // Apply textContent
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });

        // Apply placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });

        // Special handling for credits display
        this.refreshCredits();
    },

    refreshCredits() {
        const creditsDisplay = document.getElementById('creditsDisplay') || document.getElementById('creditsAmount');
        if (!creditsDisplay) return;

        const userSession = localStorage.getItem('wisecat_user');
        if (userSession) {
            try {
                const user = JSON.parse(userSession);
                const credits = user.credits || 0;
                const dict = this.translations[this.currentLang] || this.translations['en'];

                // If it's the portal amount display, just show the $ sign
                if (creditsDisplay.id === 'creditsAmount') {
                    creditsDisplay.textContent = `$${credits.toFixed(2)} USD`;
                } else if (dict.text_credits) {
                    creditsDisplay.textContent = dict.text_credits.replace('$0', `$${credits}`);
                }
            } catch (e) { console.error("i18n credits error", e); }
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WiseCatI18n.init());
} else {
    WiseCatI18n.init();
}
