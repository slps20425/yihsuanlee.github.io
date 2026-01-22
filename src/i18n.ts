interface TranslationDict {
    [key: string]: any;
}

interface WiseCatI18nType {
    currentLang: string;
    initialized?: boolean;
    translations: { [key: string]: TranslationDict };
    init: () => void;
    setLanguage: (lang: string) => void;
    apply: () => void;
    renderHelper: () => void;
    refreshCredits: () => void;
    phoneRules: { [key: string]: RegExp };
    validatePhone: (code: string, number: string) => boolean;
    detectLanguage: (text: string) => string;
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

const WiseCatI18n: WiseCatI18nType = {
    detectLanguage: (text: string) => {
        // 1. East Asian Scripts (Unambiguous)
        if (/[\u4e00-\u9fa5]/.test(text)) return 'zh'; // Chinese
        if (/[\u3040-\u30ff\u3400-\u4dbf]/.test(text)) return 'jp'; // Japanese
        if (/[\uac00-\ud7af]/.test(text)) return 'kr'; // Korean

        // 2. European Languages (Latin Script Heuristics)
        // We look for unique characters or common words to distinguish
        const lower = text.toLowerCase();

        // French: à, â, ç, é, è, ê, ë, î, ï, ô, û, ù, ü (Common: " c'est ", " le ", " la ", " les ")
        if (/[àâçéèêëîïôûùü]/.test(lower) || /\b(est|le|la|les|un|une)\b/.test(lower)) return 'fr';

        // Spanish: á, é, í, ñ, ó, ú, ü, ¡, ¿ (Common: " el ", " la ", " los ", " las ", " es ")
        if (/[áéíñóúü¡¿]/.test(lower) || /\b(el|la|los|las|es|y)\b/.test(lower)) return 'es';

        // Italian: à, è, é, ì, ò, ù (Common: " il ", " lo ", " la ", " i ", " gli ", " sono ")
        if (/[àèéìòù]/.test(lower) || /\b(il|lo|la|gli|sono|per)\b/.test(lower)) return 'it';

        // 3. Fallback
        // If mostly Latin but not clearly FR/ES/IT, assume English or current UI language
        return 'en';
    },
    currentLang: 'en',
    initialized: false,
    translations: {
        en: {
            portal_title: "WiseCat Portal",
            portal_subtitle: "Your Personal AI Assistant Hub",
            login_subtitle: "Sign in to continue",
            login_privacy_notice: "This service (WiseCat) will access your LINE email address solely for account creation, credit management, and service notifications.",
            btn_google: "Sign in with Google",
            btn_microsoft: "Sign in with Microsoft",
            btn_line: "Sign in with LINE",
            btn_signin: "Sign In",
            btn_signup: "Create Account",
            balance_label: "Available Balance",
            service_res_title: "Restaurant Reservation",
            service_res_desc: "AI-powered booking assistant for any restaurant",
            service_mouthpiece_title: "Mouthpiece Service",
            service_mouthpiece_desc: "AI Voice representation service (Beta)",
            service_trial_title: "Free Trial Call",
            service_trial_desc: "Experience AI voice calling with a limited trial",
            btn_submit: "Start AI Call",
            btn_refill: "Top-up",
            btn_back: "← Back to Portal",
            footer: "Automated call service provided by WiseCat AI",
            msg_calling: "WiseCat Assistant is calling!",
            msg_success: "Success",
            msg_failed: "Failed",
            disclaimer_title: "Disclaimer",
            disclaimer_fraud: "Safety: All calls are recorded to prevent fraud.",
            disclaimer_guarantee: "Not Guaranteed: Like a real call, success depends on restaurant availability and conditions.",
            msg_fail_alert: "Action failed, please try again",
            text_credits: "Current Credits: $0 USD",
            label_mission: "🎯 Choose Mission",
            opt_res_new: "Restaurant Reservation",
            opt_res_update: "Reservation Update or Cancel",
            opt_res_food: "Reservation with Food Pre-order",
            opt_mouth_deliver: "Deliver Message to Someone",
            opt_mouth_check: "Check Information with Someone",
            opt_mouth_other: "Other (Specify below)",
            placeholder_custom_mission: "Describe your mission...",
            label_preorder_backup: "If food is unavailable:",
            opt_backup_cancel: "Cancel Reservation",
            opt_backup_proceed: "Proceed with Reservation anyway",
            modal_confirm_title: "Confirm Selection",
            modal_confirm_btn: "Confirm",
            modal_cancel_btn: "Cancel",
            label_detail_address: "📍 Address",
            label_detail_phone: "📞 Phone",
            label_detail_hours: "⏰ Opening Hours",
            label_drawer_title: "Restaurant Details",
            mouthpiece_title: "📢 AI Mouthpiece",
            label_your_name: "👤 Your Name",
            label_recipient_name: "👤 Recipient Name",
            placeholder_name: "English name only",
            placeholder_recipient: "English name only",
            label_phone: "📞 Recipient Phone",
            label_script: "📄 AI Message Script",
            placeholder_script: "What should the AI say?",
            label_schedule: "Schedule Call Preference",
            label_enable_schedule: "Schedule a specific time for this call",
            label_call_time: "Call Time",
            option_asap: "Call ASAP",
            option_scheduled: "Schedule a specific time",
            option_open: "Call when available",
            validation_name: "Names must be English letters (hyphens/underscores allowed)",
            validation_phone: "Invalid phone format for selected country",
            validation_closed: "The restaurant is closed on the selected date",
            validation_out_of_hours: "The selected time is outside of operating hours",
            validation_too_late: "Last reservation is 30 minutes before closing",
            validation_past_time: "Cannot select a time in the past",
            trial_title: "🎁 Free Trial Call (Beta)",
            label_trial_script: "📄 Trial Message Script (Max 30 words)",
            placeholder_trial_script: "Enter what the AI should say (keep it brief)...",
            msg_trial_limit: "You've reached the 30-word limit for trial calls.",
            btn_trial: "Try for Free",
            reservation_title: "WiseCat AI restaurant scheduler",
            label_name: "👤 Name (English Only)",
            label_party: "👥 Party Size",
            label_date: "📅 Date",
            label_time: "⏰ Time",
            label_search: "🔍 Search Restaurant",
            placeholder_search: "Enter restaurant name or address",
            info_search: "Phone number auto-filled after search",
            label_note: "📝 Special Requests (Optional)",
            placeholder_note: "Any special requests?",
            label_retry: "Re-try Option",
            warning_retry: "",
            label_food_name: "Food Name",
            label_food_quantity: "Quantity (Max 4)",
            placeholder_food_name: "e.g. Chocolate Cake",
            label_preorder_agree: "I agree to accept a partial quantity (minimum 1) if the full amount is unavailable.",
            validation_preorder_agree: "You must agree to the partial quantity policy to use this option.",
            option_res_open: "Call when restaurant open",
            placeholder_date: "Select Date",
            label_script_language: "🗣️ Speaking Language",
            option_auto: "Auto-Detect",
            helper_title: "Scenarios Template Helper 🐱",
            helper_examples: {
                res: [
                    { t: "Simple Reservation", v: "Reserve a table for 4 at [Restaurant Name] for tonight." },
                    { t: "Item Pre-order", v: "Reserve a cake at the bakery before 5PM." }
                ],
                mouth: [
                    { t: "Lost Item Inquiry", v: "Hello, I lost a black wallet at your store yesterday. Has anyone found it?", mission: "lost_item" },
                    { t: "Holiday Hours Check", v: "Are you open during the Spring Festival? Any changes to business hours?", mission: "business_hours" },
                    { t: "Package Tracking", v: "I'd like to check the delivery status of order number XXX.", mission: "package_tracking" },
                    { t: "Event RSVP", v: "This is XXX, confirming I'll attend tomorrow's gathering on time.", mission: "event_rsvp" },
                    { t: "Repair Appointment", v: "My air conditioner needs repair. When's the earliest you can send a technician?", mission: "repair_appointment" },
                    { t: "Order Modification", v: "I need to modify my order. Can you change the address to XXX?", mission: "order_modification" },
                    { t: "Emergency Notification", v: "Urgent! I'm abroad and can't answer calls. Please tell XXX I'll be late.", mission: "emergency_notification" },
                    { t: "Schedule Verification", v: "Confirming tomorrow's 3 PM meeting. I'll be there on time.", mission: "schedule_verification" },
                    { t: "Stock Inquiry", v: "Is XXX product still in stock? I'd like to purchase it.", mission: "stock_inquiry" },
                    { t: "Dental Appointment", v: "I'd like to book a teeth cleaning. Any openings this week?", mission: "dental_appointment" },
                    { t: "Salon Inquiry", v: "How long and how much for hair coloring plus haircut?", mission: "salon_inquiry" },
                    { t: "Aesthetic Clinic", v: "I'd like to inquire about picosecond laser treatment. What options are available?", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "Calls",
            nav_profile: "Profile",
            nav_phone: "Phone Number",
            nav_ai: "AI Services",
            nav_inbox: "Inbox",
            nav_faq: "FAQ",
            nav_logout: "Log out",
            nav_contact: "Contacts",
            faq_title: "Frequently Asked Questions",
            faq_subtitle: "Everything you need to know about WiseCat AI services",
            faq_q1: "How can WiseCat AI transform my business operations?",
            faq_a1: "WiseCat AI automates customer interactions through intelligent voice agents, enabling businesses to handle reservations, inquiries, and service requests 24/7. This reduces manual workload, improves response times, and enhances customer satisfaction while lowering operational costs.",
            faq_q2: "What makes the 'Mouthpiece' AI voice agent different from traditional IVRs?",
            faq_a2: "Unlike traditional IVRs, Mouthpiece uses advanced natural language processing to understand context and nuance in conversations. It can handle complex queries, remember conversation history, adapt to different scenarios, and provide human-like interactions instead of rigid menu-based responses.",
            faq_q3: "How does the Restaurant Flow handle complex booking requests during peak hours?",
            faq_a3: "Restaurant Flow is designed to handle multiple simultaneous reservation requests intelligently. It checks real-time availability, processes booking preferences, and manages special requests concurrently. This ensures restaurants can maximize capacity utilization even during busy periods without missing potential customers.",
            faq_q4: "Can I connect WiseCat to my existing CRM or messaging apps?",
            faq_a4: "Yes! WiseCat natively integrates with popular platforms including LINE, Slack, WhatsApp, and major CRM systems. This allows you to maintain your existing workflows while leveraging WiseCat's AI capabilities, creating a seamless experience for both you and your customers.",
            faq_q5: "How does WiseCat ensure the privacy and security of my data?",
            faq_a5: "Security is our top priority. All data is encrypted both in transit and at rest using industry-standard encryption protocols. We comply with GDPR and local data protection regulations, and all conversations are securely stored. You maintain full control over your data with options to delete information at any time.",
            faq_q6: "How does the Tasker Agent help reduce my team's workload?",
            faq_a6: "The Tasker Agent acts as an autonomous coordinator that handles routine tasks such as scheduling, confirmations, follow-ups, and information gathering. This frees your team to focus on high-value activities, decision-making, and customer relationship building while the AI manages repetitive administrative work.",
            faq_q7: "Is there a way to test WiseCat's AI-driven missions before committing?",
            faq_a7: "Absolutely! Our Trial Flow allows you to simulate AI interactions with realistic scenarios specific to your use case. You can test the system's capabilities, see how it handles your business requirements, and measure potential ROI before making a full commitment. This risk-free approach helps you make confident decisions."
        },
        zh: {
            portal_title: "WiseCat 門戶",
            portal_subtitle: "您的個人 AI 助手中心",
            login_subtitle: "請登錄以繼續",
            login_privacy_notice: "本服務 (WiseCat) 將會存取您的 LINE 電子郵件地址，僅用於建立會員帳號、管理通話預約紀錄（Credits）以及發送相關服務通知。",
            btn_google: "使用 Google 帳號登入",
            btn_microsoft: "使用 Microsoft 帳號登入",
            btn_line: "使用 LINE 帳號登入",
            btn_signin: "登錄",
            btn_signup: "創建帳號",
            balance_label: "可用餘額",
            service_res_title: "餐廳代訂",
            service_res_desc: "AI 驅動的餐廳預約助手",
            service_mouthpiece_title: "AI 傳聲筒",
            service_mouthpiece_desc: "AI 語音代表服務 (Beta)",
            service_trial_title: "免費試用撥號",
            service_trial_desc: "體驗 AI 語音通話 (試用版額度限制)",
            btn_submit: "啟動 AI 撥號",
            btn_refill: "儲值",
            btn_back: "← 返回主頁面",
            footer: "由 WiseCat AI 提供自動化撥號服務",
            msg_calling: "WiseCat 助手已開始撥號！",
            msg_success: "撥號成功",
            msg_failed: "撥號失敗",
            disclaimer_title: "免責聲明",
            disclaimer_fraud: "安全聲明：所有通話皆會錄音存證以防詐騙。",
            disclaimer_guarantee: "非保證成功：如同真人撥打，結果取決於餐廳現場狀況與不可控因素。",
            msg_fail_alert: "操作失敗，請稍後再試",
            text_credits: "目前餘額: $0 USD",
            label_mission: "🎯 選擇任務類型",
            opt_res_new: "餐廳預約",
            opt_res_update: "更改或取消預約",
            opt_res_food: "含預點餐點的預約",
            opt_mouth_deliver: "向某人傳遞訊息",
            opt_mouth_check: "向某人確認資訊",
            opt_mouth_other: "其他 (請在下方註明)",
            placeholder_custom_mission: "請描述您的任務...",
            label_preorder_backup: "若餐點售完/無法預訂：",
            opt_backup_cancel: "終止並取消預約",
            opt_backup_proceed: "仍繼續完成預約",
            modal_confirm_title: "確認選取資訊",
            modal_confirm_btn: "確認選取",
            modal_cancel_btn: "取消",
            label_detail_address: "📍 地址",
            label_detail_phone: "📞 電話",
            label_detail_hours: "⏰ 營業時間",
            label_drawer_title: "餐廳詳細資訊",
            mouthpiece_title: "📢 WiseCat 傳聲筒",
            label_your_name: "👤 您的姓名",
            label_recipient_name: "👤 收件人姓名",
            placeholder_name: "請輸入英文姓名",
            placeholder_recipient: "收件人英文姓名",
            label_phone: "📞 收件人電話",
            label_script: "📄 AI 語音腳本",
            placeholder_script: "AI 應該說什麼內容？",
            label_schedule: "撥打偏好",
            label_enable_schedule: "預約特定撥打時間",
            label_call_time: "撥打時間",
            option_asap: "立即撥打 (ASAP)",
            option_scheduled: "預約特定時間",
            option_open: "對方有空時撥打",
            validation_name: "姓名限英文 (可含 - 或 _)",
            validation_phone: "手機格式與所選國家不符",
            validation_closed: "該餐廳在您選擇的日期不營業",
            validation_out_of_hours: "預約時間不在營業時間內",
            validation_too_late: "最後預約時間為結束前 30 分鐘",
            validation_past_time: "無法選擇過去的時間",
            trial_title: "🎁 免費試用撥號 (Beta)",
            label_trial_script: "📄 試用語音腳本 (限 30 字內)",
            placeholder_trial_script: "請輸入 AI 說話內容 (請保持簡短)...",
            msg_trial_limit: "試用撥號限制為 30 字以內。",
            btn_trial: "免費體驗",
            reservation_title: "WiseCat AI 餐廳預約系統",
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
            label_food_name: "餐點名稱",
            label_food_quantity: "數量 (最多 4)",
            placeholder_food_name: "例如：巧克力蛋糕",
            label_preorder_agree: "若數量不足，我同意接受部分數量（至少 1 份）。",
            validation_preorder_agree: "您必須同意接受部分數量政策才能使用此選項。",
            option_res_open: "餐廳營業時撥打",
            placeholder_date: "選擇預約日期",
            label_script_language: "🗣️ 通話語言",
            option_auto: "自動偵測",
            helper_title: "情境範本小幫手 🐱",
            helper_examples: {
                res: [
                    { t: "簡單預約", v: "今晚在 [餐廳名稱] 預訂一桌 4 人位。" },
                    { t: "品項預留", v: "在下午 5 點前到麵包店預留一個蛋糕。" }
                ],
                mouth: [
                    { t: "遺失物品查詢", v: "你好，我昨天在你們店裡遺失了一個黑色錢包，請問有人撿到嗎？", mission: "lost_item" },
                    { t: "節日營業確認", v: "請問您在春節期間是否照常營業？營業時間有調整嗎？", mission: "business_hours" },
                    { t: "包裹追蹤", v: "我想確認訂單編號XXX的包裹目前配送狀態。", mission: "package_tracking" },
                    { t: "活動出席確認", v: "我是XXX，想確認明天的聚會我會準時出席。", mission: "event_rsvp" },
                    { t: "維修預約", v: "我的冷氣需要維修，請問最快什麼時候可以安排師傅過來？", mission: "repair_appointment" },
                    { t: "訂單修改", v: "我需要修改訂單內容，可以幫我把地址改成XXX嗎？", mission: "order_modification" },
                    { t: "緊急通知", v: "緊急！我目前在國外無法接電話，請轉告XXX我會晚點到。", mission: "emergency_notification" },
                    { t: "行程確認", v: "確認明天下午3點的會議，我會準時參加。", mission: "schedule_verification" },
                    { t: "庫存查詢", v: "請問XXX商品目前還有庫存嗎？我想要購買。", mission: "stock_inquiry" },
                    { t: "牙科預約", v: "我想預約洗牙，請問本週還有空檔嗎？", mission: "dental_appointment" },
                    { t: "美髮沙龍諮詢", v: "請問染髮加剪髮大概需要多少時間和費用？", mission: "salon_inquiry" },
                    { t: "醫美診所諮詢", v: "我想諮詢皮秒雷射的療程，請問有哪些方案？", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "通話管理",
            nav_profile: "個人帳戶",
            nav_phone: "電話號碼",
            nav_ai: "AI 服務",
            nav_inbox: "收件夾",
            nav_faq: "常見問題",
            nav_logout: "登出",
            nav_contact: "客服",
            faq_title: "常見問題",
            faq_subtitle: "關於 WiseCat AI 服務的所有必要資訊",
            faq_q1: "WiseCat AI 如何轉變我的業務營運？",
            faq_a1: "WiseCat AI 通過智能語音代理自動化客戶互動，讓企業能夠全天候處理預約、客詢和服務請求。這減少了手動工作量，加快了回應速度，提高了客戶滿意度，同時降低了營運成本。",
            faq_q2: "『傳聲筒』AI 語音代理與傳統 IVR 有何不同？",
            faq_a2: "與傳統 IVR 不同，傳聲筒採用先進的自然語言處理來理解對話中的上下文和細微差別。它可以處理複雜查詢、記住對話歷史、適應不同場景，並提供類人的互動，而非死板的菜單式回應。",
            faq_q3: "餐廳流程系統如何在尖峰時段處理複雜的訂位請求？",
            faq_a3: "餐廳流程系統設計用於智能地處理多個並行預約請求。它檢查實時可用性、處理預約偏好並管理特殊要求。這確保餐廳即使在繁忙時段也能最大化座位利用率，不會遺漏潛在客戶。",
            faq_q4: "我可以將 WiseCat 連接到現有的 CRM 或通訊應用程式嗎？",
            faq_a4: "可以！WiseCat 可原生集成包括 LINE、Slack、WhatsApp 和主要 CRM 系統在內的熱門平台。這讓您能夠保持現有工作流程，同時充分利用 WiseCat 的 AI 功能，為您和客戶創造無縫體驗。",
            faq_q5: "WiseCat 如何確保我的資料隱私和安全？",
            faq_a5: "安全是我們的首要任務。所有資料都使用業界標準加密協議進行傳輸和靜止時的加密。我們遵守 GDPR 和當地資料保護法規，所有對話都安全存儲。您可完全控制您的資料，可隨時選擇刪除信息。",
            faq_q6: "Tasker 代理如何幫助減少我團隊的工作量？",
            faq_a6: "Tasker 代理充當自主協調者，處理日常任務如排程、確認、跟進和信息收集。這使您的團隊能夠專注於高價值活動、決策和客戶關係建立，而 AI 管理重複的行政工作。",
            faq_q7: "有沒有辦法在承諾前測試 WiseCat 的 AI 驅動任務？",
            faq_a7: "絕對可以！我們的試用流程允許您使用特定於您業務用例的真實場景模擬 AI 互動。您可以測試系統功能、看看它如何處理您的業務需求、並衡量潛在投資回報率，然後再做出最終決定。此無風險方式幫助您做出有信心的決策。"
        },
        jp: {
            portal_title: "WiseCat ポータル",
            portal_subtitle: "あなたのパーソナルAIアシスタントハブ",
            login_subtitle: "サインインして続行",
            login_privacy_notice: "当サービス（WiseCat）は、会員アカウントの作成、通話予約記録（クレジット）の管理、および関連するサービス通知の送信のみを目的として、お客様のLINEメールアドレスにアクセスします。",
            btn_google: "Googleでログイン",
            btn_microsoft: "Microsoftでログイン",
            btn_line: "LINEでログイン",
            btn_signin: "サインイン",
            btn_signup: "アカウント作成",
            balance_label: "利用可能残高",
            service_res_title: "レストラン予約",
            service_res_desc: "あらゆるレストランのAI予約アシスタント",
            service_mouthpiece_title: "マウスピースサービス",
            service_mouthpiece_desc: "AI音声代表サービス（ベータ版）",
            service_trial_title: "無料体験通話",
            service_trial_desc: "AI音声通話を制限付きで体験する",
            btn_submit: "AI通話を開始",
            btn_refill: "チャージ",
            btn_back: "← ポータルに戻る",
            footer: "WiseCat AIによる自動通話サービス",
            msg_calling: "WiseCatアシスタントが通話中です！",
            msg_success: "成功",
            msg_failed: "失敗",
            msg_fail_alert: "失敗しました。もう一度お試しください",
            text_credits: "現在のクレジット: $0 USD",
            label_mission: "🎯 ミッションを選択",
            opt_res_new: "レストラン予約",
            opt_res_update: "予約の変更またはキャンセル",
            opt_res_food: "食事の事前注文を含む予約",
            opt_mouth_deliver: "誰かにメッセージを伝える",
            opt_mouth_check: "誰かに情報を確認する",
            opt_mouth_other: "その他 (以下に記入)",
            placeholder_custom_mission: "内容を記入してください...",
            label_preorder_backup: "食事の在庫がない場合：",
            opt_backup_cancel: "予約を中止する",
            opt_backup_proceed: "そのまま予約を続行する",
            modal_confirm_title: "選択内容の確認",
            modal_confirm_btn: "確認して選択",
            modal_cancel_btn: "キャンセル",
            label_detail_address: "📍 住所",
            label_detail_phone: "📞 電話番号",
            label_detail_hours: "⏰ 営業時間",
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
            option_scheduled: "指定時間を予約",
            option_open: "対応可能な時に電話",
            validation_name: "名前は英語のみ（ハイフン/アンダースコア可）",
            validation_phone: "電話番号の形式が正しくありません",
            validation_closed: "選択した日は定休日です",
            validation_out_of_hours: "営業時間外です",
            validation_too_late: "最終予約は閉店の30分前までです",
            validation_past_time: "過去の時間を選択できません",
            trial_title: "🎁 無料体験通話 (ベータ版)",
            label_trial_script: "📄 体験メッセージスクリプト (最大30語)",
            placeholder_trial_script: "AIに話させたい内容を入力（簡潔に）...",
            msg_trial_limit: "体験版の制限である30語に達しました。",
            btn_trial: "無料で試す",
            reservation_title: "WiseCat AI レストラン予約",
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
            label_food_name: "商品名",
            label_food_quantity: "数量 (最大 4)",
            placeholder_food_name: "例：チョコレートケーキ",
            label_preorder_agree: "在庫が不足している場合、一部の数量（最低1つ）を受け入れることに同意します。",
            validation_preorder_agree: "このオプションを使用するには、一部数量受け入れポリシーに同意する必要があります。",
            option_res_open: "開店時に電話",
            placeholder_date: "日付を選択",
            label_script_language: "🗣️ 通話言語",
            option_auto: "自動検出",
            helper_title: "シナリオテンプレートヘルパー 🐱",
            helper_examples: {
                res: [
                    { t: "簡単な予約", v: "今夜、[レストラン名]で4人のテーブルを予約してください。" },
                    { t: "商品の予約", v: "午後5時までにパン屋でケーキを予約してください。" }
                ],
                mouth: [
                    { t: "遺失物問い合わせ", v: "こんにちは、昨日お店で黒い財布を失くしました。誰か見つけましたか？", mission: "lost_item" },
                    { t: "休日営業確認", v: "春節期間中は営業していますか？営業時間の変更はありますか？", mission: "business_hours" },
                    { t: "荷物追跡", v: "注文番号XXXの荷物の配送状況を確認したいです。", mission: "package_tracking" },
                    { t: "イベント出席確認", v: "XXXです。明日の集まりに時間通り出席することを確認します。", mission: "event_rsvp" },
                    { t: "修理予約", v: "エアコンの修理が必要です。最短でいつ技術者を派遣できますか？", mission: "repair_appointment" },
                    { t: "注文変更", v: "注文内容を変更したいです。住所をXXXに変更できますか？", mission: "order_modification" },
                    { t: "緊急通知", v: "緊急！海外にいて電話に出られません。XXXに遅れると伝えてください。", mission: "emergency_notification" },
                    { t: "スケジュール確認", v: "明日の午後3時の会議を確認します。時間通りに参加します。", mission: "schedule_verification" },
                    { t: "在庫確認", v: "XXX商品はまだ在庫がありますか？購入したいです。", mission: "stock_inquiry" },
                    { t: "歯科予約", v: "歯のクリーニングを予約したいです。今週空きはありますか？", mission: "dental_appointment" },
                    { t: "美容院問い合わせ", v: "カラーとカットで時間と料金はどのくらいですか？", mission: "salon_inquiry" },
                    { t: "美容クリニック", v: "ピコ秒レーザー治療について相談したいです。どんなプランがありますか？", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "通話記録",
            nav_profile: "プロフィール",
            nav_phone: "電話番号",
            nav_ai: "AI サービス",
            nav_inbox: "受信トレイ",
            nav_faq: "よくある質問",
            nav_logout: "ログアウト",
            nav_contact: "お問い合わせ",
            faq_title: "よくある質問",
            faq_subtitle: "WiseCat AI サービスに関する必要な情報をすべて確認してください",
            faq_q1: "WiseCat AI は業務運営をどのように変革できますか？",
            faq_a1: "WiseCat AI は知的音声エージェントを通じて顧客インタラクションを自動化し、企業が24時間365日予約、問い合わせ、サービスリクエストに対応できるようにします。これにより手動作業が削減され、応答時間が短縮され、顧客満足度が向上し、運用コストが削減されます。",
            faq_q2: "『マウスピース』AI音声エージェントは従来のIVRと何が違いますか？",
            faq_a2: "従来のIVRとは異なり、マウスピースは高度な自然言語処理を使用して会話の文脈とニュアンスを理解します。複雑なクエリに対応でき、会話履歴を記憶し、さまざまなシナリオに適応し、硬直したメニューベースの応答の代わりに人間らしい対話を提供します。",
            faq_q3: "レストランフローはピーク時間の複雑な予約リクエストにどのように対応しますか？",
            faq_a3: "レストランフローは複数の同時予約リクエストをインテリジェントに処理するように設計されています。リアルタイムの可用性をチェックし、予約の好みを処理し、特別なリクエストを管理します。これにより、忙しい時間帯でもレストランは座席利用率を最大化でき、潜在顧客を見落としません。",
            faq_q4: "WiseCat を既存の CRM またはメッセージングアプリに接続できますか？",
            faq_a4: "はい！WiseCat は LINE、Slack、WhatsApp、主要な CRM システムを含む人気プラットフォームとネイティブに統合されます。これにより、既存のワークフローを維持しながら WiseCat の AI 機能を活用でき、あなたと顧客の両方にシームレスな体験を提供します。",
            faq_q5: "WiseCat はデータのプライバシーとセキュリティをどのように保証していますか？",
            faq_a5: "セキュリティは最優先事項です。すべてのデータは業界標準の暗号化プロトコルを使用して転送中および静止中に暗号化されます。GDPR と地域の個人情報保護規制に準拠しており、すべての会話は安全に保存されます。データに対する完全な管理を保持でき、いつでも情報を削除できます。",
            faq_q6: "Tasker エージェントはチームのワークロードをどのように削減できますか？",
            faq_a6: "Tasker エージェントはスケジューリング、確認、フォローアップ、情報収集などのルーチンタスクを処理する自律的なコーディネーターとして機能します。これによりチームは高価値のアクティビティ、意思決定、顧客関係構築に集中できるようになり、AI が反復的な事務作業を管理します。",
            faq_q7: "コミットする前に WiseCat の AI 駆動ミッションをテストする方法がありますか？",
            faq_a7: "もちろんです！当社のトライアルフローでは、ユースケースに特有のリアルなシナリオで AI インタラクションをシミュレートできます。システム機能をテストでき、業務要件にどう対応するかを確認でき、完全コミット前に潜在的な ROI を測定できます。このリスク無しのアプローチが自信を持った決定をサポートします。"
        },
        kr: {
            portal_title: "WiseCat 포털",
            portal_subtitle: "개인용 AI 어시스턴트 허브",
            login_subtitle: "계속하려면 로그인하세요",
            login_privacy_notice: "본 서비스(WiseCat)는 회원 계정 생성, 통화 예약 기록(크레딧) 관리 및 관련 서비스 알림 전송을 위해서만 사용자의 LINE 이메일 주소에 액세스합니다.",
            btn_google: "Google 계정으로 계속하기",
            btn_microsoft: "Microsoft 계정으로 계속하기",
            btn_line: "LINE 계정으로 계속하기",
            btn_signin: "로그인",
            btn_signup: "계정 생성",
            balance_label: "사용 가능한 잔액",
            service_res_title: "식당 예약",
            service_res_desc: "모든 식당을 위한 AI 기반 예약 도우미",
            service_mouthpiece_title: "마우스피스 서비스",
            service_mouthpiece_desc: "AI 음성 대리 서비스 (베타)",
            service_trial_title: "무료 체험 통화",
            service_trial_desc: "제한된 체험으로 AI 음성 통화를 경험해 보세요",
            btn_submit: "AI 통화 시작",
            btn_refill: "충전",
            btn_back: "← 포털로 돌아가기",
            footer: "WiseCat AI에서 제공하는 자동 통화 서비스",
            msg_calling: "WiseCat 어시스턴트가 통화 중입니다!",
            msg_success: "성공",
            msg_failed: "실패",
            msg_fail_alert: "작업 실패, 다시 시도하십시오",
            text_credits: "현재 크레딧: $0 USD",
            label_mission: "🎯 미션 선택",
            opt_res_new: "식당 예약",
            opt_res_update: "예약 변경 또는 취소",
            opt_res_food: "음식 선주문을 포함한 예약",
            opt_mouth_deliver: "누군가에게 메시지 전달",
            opt_mouth_check: "누군가에게 정보 확인",
            opt_mouth_other: "기타 (아래에 기입)",
            placeholder_custom_mission: "미션 내용을 입력해 주세요...",
            label_preorder_backup: "음식이 품절인 경우:",
            opt_backup_cancel: "예약 취소",
            opt_backup_proceed: "예약 계속 진행",
            modal_confirm_title: "선택 정보 확인",
            modal_confirm_btn: "확인",
            modal_cancel_btn: "취소",
            label_detail_address: "📍 주소",
            label_detail_phone: "📞 전화번호",
            label_detail_hours: "⏰ 영업 시간",
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
            option_scheduled: "특정 시간 예약",
            option_open: "가능할 때 통화",
            validation_name: "이름은 영문자만 가능합니다 (하이픈/언더스코어 허용)",
            validation_phone: "전화번호 형식이 올바르지 않습니다",
            validation_closed: "선택하신 날짜는 휴무일입니다",
            validation_out_of_hours: "영업 시간 외입니다",
            validation_too_late: "마지막 예약은 마감 30분 전까지입니다",
            validation_past_time: "과거의 시간을 선택할 수 없습니다",
            trial_title: "🎁 무료 체험 통화 (베타)",
            label_trial_script: "📄 체험 메시지 스크립트 (최대 30단어)",
            placeholder_trial_script: "AI가 말할 내용을 입력하세요 (간결하게)...",
            msg_trial_limit: "체험 통화의 30단어 제한에 도달했습니다.",
            btn_trial: "무료로 체험하기",
            reservation_title: "WiseCat AI 레스토랑 예약",
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
            label_food_name: "음식 이름",
            label_food_quantity: "수량 (최대 4)",
            placeholder_food_name: "예: 초콜릿 케이크",
            label_preorder_agree: "재고 부족 시 부분 수량(최소 1개)을 수락하는 데 동의합니다.",
            validation_preorder_agree: "이 옵션을 사용하려면 부분 수량 정책에 동의해야 합니다。",
            option_res_open: "영업 시 통화",
            placeholder_date: "날짜 선택",
            label_script_language: "🗣️ 통화 언어",
            option_auto: "자동 감지",
            helper_title: "시나리오 템플릿 도우미 🐱",
            helper_examples: {
                res: [
                    { t: "간단한 예약", v: "오늘 밤 [식당 이름]에 4인 테이블을 예약해 주세요." },
                    { t: "품목 예약", v: "오후 5시 이전에 빵집에서 케이크를 예약해 주세요." }
                ],
                mouth: [
                    { t: "분실물 문의", v: "안녕하세요, 어제 가게에서 검은색 지갑을 잃어버렸습니다. 누가 찾았나요?", mission: "lost_item" },
                    { t: "공휴일 영업 확인", v: "설날 기간에 영업하시나요? 영업 시간 변경이 있나요?", mission: "business_hours" },
                    { t: "택배 추적", v: "주문 번호 XXX의 배송 상태를 확인하고 싶습니다.", mission: "package_tracking" },
                    { t: "이벤트 참석 확인", v: "XXX입니다. 내일 모임에 정시에 참석하겠습니다.", mission: "event_rsvp" },
                    { t: "수리 예약", v: "에어컨 수리가 필요합니다. 가장 빠른 기사님 방문 시간은 언제인가요?", mission: "repair_appointment" },
                    { t: "주문 변경", v: "주문 내용을 변경하고 싶습니다. 주소를 XXX로 변경할 수 있나요?", mission: "order_modification" },
                    { t: "긴급 알림", v: "긴급! 해외에 있어 전화를 받을 수 없습니다. XXX에게 늦는다고 전해주세요.", mission: "emergency_notification" },
                    { t: "일정 확인", v: "내일 오후 3시 회의를 확인합니다. 정시에 참석하겠습니다.", mission: "schedule_verification" },
                    { t: "재고 확인", v: "XXX 제품이 아직 재고가 있나요? 구매하고 싶습니다.", mission: "stock_inquiry" },
                    { t: "치과 예약", v: "스케일링 예약을 하고 싶습니다. 이번 주에 빈 시간이 있나요?", mission: "dental_appointment" },
                    { t: "미용실 문의", v: "염색과 커트 시간과 비용은 얼마나 되나요?", mission: "salon_inquiry" },
                    { t: "피부과 상담", v: "피코 레이저 시술에 대해 상담하고 싶습니다. 어떤 옵션이 있나요?", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "통화 내역",
            nav_profile: "프로필",
            nav_phone: "전화번호",
            nav_ai: "AI 서비스",
            nav_inbox: "받은편지함",
            nav_faq: "자주 묻는 질문",
            nav_logout: "로그아웃",
            nav_contact: "고객 지원",
            faq_title: "자주 묻는 질문",
            faq_subtitle: "WiseCat AI 서비스에 대해 알아야 할 모든 것",
            faq_q1: "WiseCat AI가 비즈니스 운영을 어떻게 변환할 수 있나요?",
            faq_a1: "WiseCat AI는 지능형 음성 에이전트를 통해 고객 상호작용을 자동화하므로 비즈니스가 24시간 내내 예약, 문의 및 서비스 요청을 처리할 수 있습니다. 이는 수동 작업을 줄이고, 응답 시간을 개선하며, 고객 만족도를 높이고, 운영 비용을 절감합니다.",
            faq_q2: "'마우스피스' AI 음성 에이전트는 기존 IVR과 어떻게 다른가요?",
            faq_a2: "기존 IVR과 달리 마우스피스는 고급 자연어 처리를 사용하여 대화의 맥락과 뉘앙스를 이해합니다. 복잡한 쿼리를 처리할 수 있고, 대화 기록을 기억하며, 다양한 시나리오에 적응하고, 경직된 메뉴 기반 응답 대신 인간다운 상호작용을 제공합니다.",
            faq_q3: "레스토랑 플로우가 피크 시간의 복잡한 예약 요청을 어떻게 처리하나요?",
            faq_a3: "레스토랑 플로우는 여러 동시 예약 요청을 지능적으로 처리하도록 설계되었습니다. 실시간 가용성을 확인하고, 예약 선호도를 처리하며, 특별 요청을 관리합니다. 이를 통해 레스토랑은 바쁜 시간대에도 좌석 이용률을 최대화할 수 있으며 잠재 고객을 놓치지 않습니다.",
            faq_q4: "WiseCat를 기존 CRM 또는 메시징 앱에 연결할 수 있나요?",
            faq_a4: "네! WiseCat는 LINE, Slack, WhatsApp 및 주요 CRM 시스템을 포함한 인기 플랫폼과 기본적으로 통합됩니다. 이를 통해 기존 워크플로우를 유지하면서 WiseCat의 AI 기능을 활용하여 당신과 고객 모두에게 완벽한 경험을 제공할 수 있습니다.",
            faq_q5: "WiseCat는 데이터의 프라이버시와 보안을 어떻게 보장하나요?",
            faq_a5: "보안은 우리의 최우선 과제입니다. 모든 데이터는 업계 표준 암호화 프로토콜을 사용하여 전송 중 및 저장 중에 암호화됩니다. GDPR 및 지역 데이터 보호 규정을 준수하며, 모든 대화는 안전하게 저장됩니다. 데이터에 대한 완벽한 제어권을 유지하며 언제든지 정보를 삭제할 수 있습니다.",
            faq_q6: "Tasker 에이전트가 팀의 업무량을 줄이는 데 어떻게 도움이 되나요?",
            faq_a6: "Tasker 에이전트는 일정 관리, 확인, 후속 조치 및 정보 수집 같은 일상적인 작업을 처리하는 자율 코디네이터로 작동합니다. 이를 통해 팀은 고부가가치 활동, 의사 결정 및 고객 관계 구축에 집중할 수 있으며, AI는 반복적인 행정 작업을 관리합니다.",
            faq_q7: "약속하기 전에 WiseCat의 AI 기반 미션을 테스트할 수 있는 방법이 있나요?",
            faq_a7: "물론입니다! 당사의 트라이얼 플로우를 사용하면 귀사의 사용 사례에 맞는 현실적인 시나리오로 AI 상호작용을 시뮬레이션할 수 있습니다. 시스템의 기능을 테스트하고 비즈니스 요구사항을 어떻게 처리하는지 확인하며 완전한 약속 전에 잠재적 ROI를 측정할 수 있습니다. 이 위험 없는 접근 방식이 자신감 있는 결정을 내리도록 도와줍니다."
        },
        es: {
            portal_title: "Portal WiseCat",
            portal_subtitle: "Tu centro de asistentes personales IA",
            login_subtitle: "Inicia sesión para continuar",
            login_privacy_notice: "Este servicio (WiseCat) accederá a su dirección de correo electrónico de LINE únicamente para la creación de cuentas, la gestión de créditos y las notificaciones de servicio.",
            btn_google: "Continuar con Google",
            btn_microsoft: "Continuar con Microsoft",
            btn_line: "Continuar con LINE",
            btn_signin: "Iniciar sesión",
            btn_signup: "Crear cuenta",
            balance_label: "Saldo disponible",
            service_res_title: "Reserva de restaurante",
            service_res_desc: "Asistente de reservas con IA para cualquier restaurante",
            service_mouthpiece_title: "Servicio de Boquilla",
            service_mouthpiece_desc: "Servicio de representación de voz con IA (Beta)",
            service_trial_title: "Llamada de Prueba Gratis",
            service_trial_desc: "Pruebe las llamadas de voz con IA con una prueba limitada",
            btn_submit: "Iniciar llamada IA",
            btn_refill: "Recargar",
            btn_back: "← Volver al portal",
            footer: "Servicio de llamada automatizada por WiseCat AI",
            msg_calling: "¡El asistente WiseCat está llamando!",
            msg_success: "Éxito",
            msg_failed: "Fallido",
            msg_fail_alert: "La acción falló, inténtalo de nuevo",
            text_credits: "Créditos actuales: $0 USD",
            label_mission: "🎯 Elegir misión",
            opt_res_new: "Reserva de restaurante",
            opt_res_update: "Modificar o cancelar reserva",
            opt_res_food: "Reserva con pre-pedido de comida",
            opt_mouth_deliver: "Entregar mensaje a alguien",
            opt_mouth_check: "Verificar información con alguien",
            opt_mouth_other: "Otro (especificar abajo)",
            placeholder_custom_mission: "Describe tu misión...",
            label_preorder_backup: "Si la comida no está disponible:",
            opt_backup_cancel: "Cancelar reserva",
            opt_backup_proceed: "Continuar con la reserva de todos modos",
            modal_confirm_title: "Confirmar selección",
            modal_confirm_btn: "Confirmar",
            modal_cancel_btn: "Cancelar",
            label_detail_address: "📍 Dirección",
            label_detail_phone: "📞 Teléfono",
            label_detail_hours: "⏰ Horario de apertura",
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
            option_scheduled: "Programar hora específica",
            option_open: "Llamar cuando esté disponible",
            validation_name: "Nombres en letras inglesas (se permiten guiones)",
            validation_phone: "Formato de teléfono no válido",
            validation_closed: "El restaurante está cerrado en la fecha seleccionada",
            validation_out_of_hours: "La hora seleccionada está fuera del horario de atención",
            validation_too_late: "La última reserva es 30 minutos antes del cierre",
            validation_past_time: "No se puede seleccionar una hora en el pasado",
            trial_title: "🎁 Llamada de Prueba Gratis (Beta)",
            label_trial_script: "📄 Guión de mensaje de prueba (Máx 30 palabras)",
            placeholder_trial_script: "Escriba lo que debe decir la IA (sea breve)...",
            msg_trial_limit: "Has alcanzado el límite de 30 palabras para llamadas de prueba.",
            btn_trial: "Probar Gratis",
            reservation_title: "WiseCat AI programador de restaurantes",
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
            label_food_name: "Nombre de la Comida",
            label_food_quantity: "Cantidad (Máx 4)",
            placeholder_food_name: "ej. Pastel de Chocolate",
            label_preorder_agree: "Acepto recibir una cantidad parcial (mínimo 1) si no hay suficiente stock.",
            validation_preorder_agree: "Debes aceptar la política de cantidad parcial para usar esta opción.",
            option_res_open: "Llamar cuando esté abierto",
            placeholder_date: "Seleccionar fecha",
            label_script_language: "🗣️ Idioma de llamada",
            option_auto: "Detección automática",
            helper_title: "Ayudante de Plantillas de Escenarios 🐱",
            helper_examples: {
                res: [
                    { t: "Reserva Simple", v: "Reserva una mesa para 4 en [Nombre del Restaurante] para esta noche." },
                    { t: "Pedido de Artículo", v: "Reserva un pastel en la panadería antes de las 5 PM." }
                ],
                mouth: [
                    { t: "Consulta Objeto Perdido", v: "Hola, perdí una cartera negra en su tienda ayer. ¿Alguien la encontró?", mission: "lost_item" },
                    { t: "Horario Festivo", v: "¿Están abiertos durante el Festival de Primavera? ¿Hay cambios en el horario?", mission: "business_hours" },
                    { t: "Seguimiento Paquete", v: "Quisiera verificar el estado de entrega del pedido número XXX.", mission: "package_tracking" },
                    { t: "Confirmación Evento", v: "Soy XXX, confirmando que asistiré a la reunión de mañana a tiempo.", mission: "event_rsvp" },
                    { t: "Cita Reparación", v: "Mi aire acondicionado necesita reparación. ¿Cuándo pueden enviar un técnico?", mission: "repair_appointment" },
                    { t: "Modificación Pedido", v: "Necesito modificar mi pedido. ¿Pueden cambiar la dirección a XXX?", mission: "order_modification" },
                    { t: "Notificación Urgente", v: "¡Urgente! Estoy en el extranjero y no puedo contestar. Dígale a XXX que llegaré tarde.", mission: "emergency_notification" },
                    { t: "Verificación Agenda", v: "Confirmando la reunión de mañana a las 3 PM. Estaré allí a tiempo.", mission: "schedule_verification" },
                    { t: "Consulta Stock", v: "¿El producto XXX todavía está en stock? Me gustaría comprarlo.", mission: "stock_inquiry" },
                    { t: "Cita Dental", v: "Quisiera reservar una limpieza dental. ¿Tienen disponibilidad esta semana?", mission: "dental_appointment" },
                    { t: "Consulta Salón", v: "¿Cuánto tiempo y cuánto cuesta teñir y cortar el cabello?", mission: "salon_inquiry" },
                    { t: "Clínica Estética", v: "Quisiera consultar sobre el tratamiento láser picosegundo. ¿Qué opciones hay?", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "Llamadas",
            nav_profile: "Perfil",
            nav_phone: "Teléfono",
            nav_ai: "Servicios IA",
            nav_inbox: "Bandeja",
            nav_faq: "Preguntas Frecuentes",
            nav_logout: "Cerrar sesión",
            nav_contact: "Soporte y Ayuda",
            faq_title: "Preguntas Frecuentes",
            faq_subtitle: "Todo lo que necesitas saber sobre los servicios WiseCat AI",
            faq_q1: "¿Cómo puede WiseCat AI transformar mis operaciones comerciales?",
            faq_a1: "WiseCat AI automatiza las interacciones con clientes a través de agentes de voz inteligentes, permitiendo a las empresas manejar reservas, consultas y solicitudes de servicio 24/7. Esto reduce la carga de trabajo manual, mejora los tiempos de respuesta, aumenta la satisfacción del cliente y reduce los costos operativos.",
            faq_q2: "¿Qué hace que el agente de voz IA 'Mouthpiece' sea diferente de los IVR tradicionales?",
            faq_a2: "A diferencia de los IVR tradicionales, Mouthpiece utiliza procesamiento de lenguaje natural avanzado para entender el contexto y los matices en las conversaciones. Puede manejar consultas complejas, recordar el historial de conversación, adaptarse a diferentes escenarios y proporcionar interacciones similares a las humanas en lugar de respuestas rígidas basadas en menús.",
            faq_q3: "¿Cómo maneja el Flujo de Restaurante solicitudes complejas de reserva durante horas pico?",
            faq_a3: "El Flujo de Restaurante está diseñado para manejar de forma inteligente múltiples solicitudes de reserva simultáneas. Verifica la disponibilidad en tiempo real, procesa preferencias de reserva y gestiona solicitudes especiales. Esto garantiza que los restaurantes puedan maximizar la utilización de capacidad incluso en períodos ocupados sin perder clientes potenciales.",
            faq_q4: "¿Puedo conectar WiseCat a mis aplicaciones de CRM o mensajería existentes?",
            faq_a4: "¡Sí! WiseCat se integra nativamente con plataformas populares incluyendo LINE, Slack, WhatsApp y sistemas CRM principales. Esto te permite mantener tus flujos de trabajo existentes mientras aprovechas las capacidades de IA de WiseCat, creando una experiencia perfecta para ti y tus clientes.",
            faq_q5: "¿Cómo garantiza WiseCat la privacidad y seguridad de mis datos?",
            faq_a5: "La seguridad es nuestra máxima prioridad. Todos los datos se cifran tanto en tránsito como en reposo utilizando protocolos de cifrado estándar de la industria. Cumplimos con GDPR y regulaciones locales de protección de datos, y todas las conversaciones se almacenan de forma segura. Mantienes control total sobre tus datos con la opción de eliminar información en cualquier momento.",
            faq_q6: "¿Cómo ayuda el Agente Tasker a reducir la carga de trabajo de mi equipo?",
            faq_a6: "El Agente Tasker actúa como un coordinador autónomo que maneja tareas rutinarias como programación, confirmaciones, seguimientos y recopilación de información. Esto libera a tu equipo para enfocarse en actividades de alto valor, toma de decisiones y construcción de relaciones con clientes mientras la IA maneja el trabajo administrativo repetitivo.",
            faq_q7: "¿Hay alguna forma de probar las misiones impulsadas por IA de WiseCat antes de comprometerse?",
            faq_a7: "¡Absolutamente! Nuestro Flujo de Prueba te permite simular interacciones de IA con escenarios realistas específicos para tu caso de uso. Puedes probar las capacidades del sistema, ver cómo maneja tus requisitos comerciales y medir el ROI potencial antes de hacer un compromiso completo. Este enfoque sin riesgo te ayuda a tomar decisiones seguras."
        },
        fr: {
            portal_title: "Portail WiseCat",
            portal_subtitle: "Votre centre d'assistants IA personnels",
            login_subtitle: "Connectez-vous pour continuer",
            login_privacy_notice: "Ce service (WiseCat) accèdera à votre adresse e-mail LINE uniquement pour la création de compte, la gestion des crédits et les notifications de service.",
            btn_google: "Continuer avec Google",
            btn_microsoft: "Continuer avec Microsoft",
            btn_line: "Continuer avec LINE",
            btn_signin: "Se connecter",
            btn_signup: "Créer un compte",
            balance_label: "Solde disponible",
            service_res_title: "Réservation de restaurant",
            service_res_desc: "Assistant de réservation IA pour tout restaurant",
            service_mouthpiece_title: "Service Porte-voix",
            service_mouthpiece_desc: "Service de représentation vocale IA (Bêta)",
            service_trial_title: "Appel d'Essai Gratuit",
            service_trial_desc: "Découvrez les appels vocaux IA avec un essai limité",
            btn_submit: "Lancer l'appel IA",
            btn_refill: "Recharger",
            btn_back: "← Retour au portail",
            footer: "Service d'appel automatisé par WiseCat AI",
            msg_calling: "L'assistant WiseCat appelle !",
            msg_success: "Succès",
            msg_failed: "Échec",
            msg_fail_alert: "Échec de l'action, veuillez réessayer",
            text_credits: "Crédits actuels: $0 USD",
            label_mission: "🎯 Choisir la mission",
            opt_res_new: "Réservation de restaurant",
            opt_res_update: "Modifier ou annuler la réservation",
            opt_res_food: "Réservation avec pré-commande de nourriture",
            opt_mouth_deliver: "Délivrer un message à quelqu'un",
            opt_mouth_check: "Vérifier des informations avec quelqu'un",
            opt_mouth_other: "Autre (préciser ci-dessous)",
            placeholder_custom_mission: "Décrivez votre mission...",
            label_preorder_backup: "Si la nourriture est indisponible :",
            opt_backup_cancel: "Annuler la réservation",
            opt_backup_proceed: "Poursuivre la réservation quand même",
            modal_confirm_title: "Confirmer la sélection",
            modal_confirm_btn: "Confirmer",
            modal_cancel_btn: "Annuler",
            label_detail_address: "📍 Adresse",
            label_detail_phone: "📞 Téléphone",
            label_detail_hours: "⏰ Horaires d'ouverture",
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
            option_scheduled: "Planifier une heure",
            option_open: "Appeler si disponible",
            validation_name: "Noms en lettres anglaises (tirets autorisés)",
            validation_phone: "Format de téléphone invalide",
            validation_closed: "Le restaurant est fermé à la date sélectionnée",
            validation_out_of_hours: "L'heure sélectionnée est en dehors des heures d'ouverture",
            validation_too_late: "La dernière réservation est 30 minutes avant la fermeture",
            validation_past_time: "Impossible de sélectionner une heure dans le passé",
            trial_title: "🎁 Appel d'Essai Gratuit (Bêta)",
            label_trial_script: "📄 Script du message d'essai (Max 30 mots)",
            placeholder_trial_script: "Entrez ce que l'IA doit dire (soyez bref)...",
            msg_trial_limit: "Vous avez atteint la limite de 30 mots pour les appels d'essai.",
            btn_trial: "Essayer Gratuitement",
            reservation_title: "WiseCat AI planificateur de restaurants",
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
            label_food_name: "Nom de la Nourriture",
            label_food_quantity: "Quantité (Max 4)",
            placeholder_food_name: "ex. Gâteau au Chocolat",
            label_preorder_agree: "J'accepte de recevoir une quantité partielle (minimum 1) si le stock est insuffisant.",
            validation_preorder_agree: "Vous devez accepter la politique de quantité partielle pour utiliser cette option.",
            option_res_open: "Appeler si ouvert",
            placeholder_date: "Choisir la date",
            label_script_language: "🗣️ Langue d'appel",
            option_auto: "Détection automatique",
            helper_title: "Assistant de Modèles de Scénarios 🐱",
            helper_examples: {
                res: [
                    { t: "Réservation Simple", v: "Réservez une table pour 4 à [Nom du Restaurant] pour ce soir." },
                    { t: "Commande d'Article", v: "Réservez un gâteau à la boulangerie avant 17h00." }
                ],
                mouth: [
                    { t: "Objet Perdu", v: "Bonjour, j'ai perdu un portefeuille noir dans votre magasin hier. Quelqu'un l'a trouvé?", mission: "lost_item" },
                    { t: "Horaires Férié", v: "Êtes-vous ouvert pendant le Nouvel An chinois? Y a-t-il des changements d'horaires?", mission: "business_hours" },
                    { t: "Suivi Colis", v: "Je voudrais vérifier l'état de livraison de la commande numéro XXX.", mission: "package_tracking" },
                    { t: "Confirmation Événement", v: "C'est XXX, je confirme ma présence à la réunion de demain à l'heure.", mission: "event_rsvp" },
                    { t: "Rendez-vous Réparation", v: "Mon climatiseur a besoin de réparation. Quand pouvez-vous envoyer un technicien?", mission: "repair_appointment" },
                    { t: "Modification Commande", v: "Je dois modifier ma commande. Pouvez-vous changer l'adresse en XXX?", mission: "order_modification" },
                    { t: "Notification Urgente", v: "Urgent! Je suis à l'étranger et ne peux pas répondre. Dites à XXX que je serai en retard.", mission: "emergency_notification" },
                    { t: "Vérification Agenda", v: "Confirmation de la réunion de demain à 15h. Je serai là à l'heure.", mission: "schedule_verification" },
                    { t: "Vérification Stock", v: "Le produit XXX est-il toujours en stock? Je voudrais l'acheter.", mission: "stock_inquiry" },
                    { t: "Rendez-vous Dentaire", v: "Je voudrais réserver un détartrage. Avez-vous des disponibilités cette semaine?", mission: "dental_appointment" },
                    { t: "Consultation Salon", v: "Combien de temps et combien coûte une coloration plus coupe?", mission: "salon_inquiry" },
                    { t: "Clinique Esthétique", v: "Je voudrais me renseigner sur le traitement laser picoseconde. Quelles options sont disponibles?", mission: "aesthetic_clinic" }
                ]
            },
            nav_calls: "Appels",
            nav_profile: "Profil",
            nav_phone: "Téléphone",
            nav_ai: "Services IA",
            nav_inbox: "Boîte",
            nav_faq: "Questions Fréquemment Posées",
            nav_logout: "Déconnexion",
            nav_contact: "Support & Aide",
            faq_title: "Questions Fréquemment Posées",
            faq_subtitle: "Tout ce que vous devez savoir sur les services WiseCat AI",
            faq_q1: "Comment WiseCat AI peut-il transformer mes opérations commerciales ?",
            faq_a1: "WiseCat AI automatise les interactions avec les clients via des agents vocaux intelligents, permettant aux entreprises de gérer les réservations, les demandes de renseignements et les demandes de service 24h/24, 7j/7. Cela réduit la charge de travail manuelle, améliore les délais de réponse, augmente la satisfaction des clients et réduit les coûts opérationnels.",
            faq_q2: "Qu'est-ce qui rend l'agent vocal IA 'Mouthpiece' différent des IVR traditionnels ?",
            faq_a2: "Contrairement aux IVR traditionnels, Mouthpiece utilise le traitement du langage naturel avancé pour comprendre le contexte et les nuances des conversations. Il peut gérer des requêtes complexes, se souvenir de l'historique des conversations, s'adapter à différents scénarios et fournir des interactions proches de l'humain au lieu de réponses rigides basées sur des menus.",
            faq_q3: "Comment le Flux Restaurants gère-t-il les demandes de réservation complexes pendant les heures de pointe ?",
            faq_a3: "Le Flux Restaurants est conçu pour gérer intelligemment plusieurs demandes de réservation simultanées. Il vérifie la disponibilité en temps réel, traite les préférences de réservation et gère les demandes spéciales. Cela garantit que les restaurants peuvent maximiser l'utilisation de leur capacité même pendant les périodes chargées sans perdre de clients potentiels.",
            faq_q4: "Puis-je connecter WiseCat à mes applications CRM ou de messagerie existantes ?",
            faq_a4: "Oui ! WiseCat s'intègre nativement avec les plateformes populaires incluant LINE, Slack, WhatsApp et les principaux systèmes CRM. Cela vous permet de maintenir vos flux de travail existants tout en exploitant les capacités IA de WiseCat, créant une expérience transparente pour vous et vos clients.",
            faq_q5: "Comment WiseCat garantit-il la confidentialité et la sécurité de mes données ?",
            faq_a5: "La sécurité est notre priorité absolue. Toutes les données sont chiffrées en transit et au repos à l'aide de protocoles de chiffrement conformes aux normes de l'industrie. Nous respectons le RGPD et les réglementations locales de protection des données, et toutes les conversations sont stockées de manière sécurisée. Vous conservez le contrôle total de vos données et pouvez les supprimer à tout moment.",
            faq_q6: "Comment l'agent Tasker aide-t-il à réduire la charge de travail de mon équipe ?",
            faq_a6: "L'agent Tasker agit comme un coordinateur autonome qui gère les tâches routinières telles que la planification, les confirmations, les suivis et la collecte d'informations. Cela libère votre équipe pour se concentrer sur les activités à forte valeur ajoutée, la prise de décision et la construction de relations client tandis que l'IA gère les travaux administratifs répétitifs.",
            faq_q7: "Y a-t-il un moyen de tester les missions basées sur l'IA de WiseCat avant de s'engager ?",
            faq_a7: "Absolument ! Notre Flux d'Essai vous permet de simuler les interactions IA avec des scénarios réalistes spécifiques à votre cas d'usage. Vous pouvez tester les capacités du système, voir comment il gère vos besoins métier et mesurer le retour sur investissement potentiel avant de vous engager pleinement. Cette approche sans risque vous aide à prendre des décisions en confiance."
        },
        it: {
            portal_title: "Portale WiseCat",
            portal_subtitle: "Il tuo hub di assistenti personali IA",
            login_subtitle: "Accedi per continuare",
            login_privacy_notice: "Questo servizio (WiseCat) accederà al tuo indirizzo email LINE esclusivamente per la creazione dell'account, la gestione dei crediti e le notifiche del servizio.",
            btn_google: "Continua con Google",
            btn_microsoft: "Continua con Microsoft",
            btn_line: "Continua con LINE",
            btn_signin: "Accedi",
            btn_signup: "Crea account",
            balance_label: "Saldo disponibile",
            service_res_title: "Prenotazione ristorante",
            service_res_desc: "Assistente prenotazioni IA per qualsiasi ristorante",
            service_mouthpiece_title: "Servizio Boccaglio",
            service_mouthpiece_desc: "Servizio di rappresentanza vocale IA (Beta)",
            service_trial_title: "Chiamata di Prova Gratuita",
            service_trial_desc: "Sperimenta le chiamate vocali IA con una prova limitata",
            btn_submit: "Avvia chiamata IA",
            btn_refill: "Ricarica",
            btn_back: "← Torna al portale",
            footer: "Servizio di chiamata automatizzata da WiseCat AI",
            msg_calling: "L'assistente WiseCat sta chiamando!",
            msg_success: "Successo",
            msg_failed: "Fallito",
            msg_fail_alert: "Azione fallita, riprova",
            text_credits: "Crediti attuali: $0 USD",
            label_mission: "🎯 Scegli missione",
            opt_res_new: "Prenotazione ristorante",
            opt_res_update: "Modifica o cancella prenotazione",
            opt_res_food: "Prenotazione con pre-ordine di cibo",
            opt_mouth_deliver: "Consegna messaggio a qualcuno",
            opt_mouth_check: "Verifica informazioni con qualcuno",
            opt_mouth_other: "Altro (specifica sotto)",
            placeholder_custom_mission: "Descrivi la tua missione...",
            label_preorder_backup: "Se il cibo non è disponibile:",
            opt_backup_cancel: "Annulla prenotazione",
            opt_backup_proceed: "Procedi comunque con la prenotazione",
            modal_confirm_title: "Conferma selezione",
            modal_confirm_btn: "Conferma",
            modal_cancel_btn: "Annulla",
            label_detail_address: "📍 Indirizzo",
            label_detail_phone: "📞 Telefono",
            label_detail_hours: "⏰ Orari di apertura",
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
            option_scheduled: "Programma orario",
            option_open: "Chiama se disponibile",
            validation_name: "Nomi in lettere inglesi (trattini consentiti)",
            validation_phone: "Formato telefono non valido",
            validation_closed: "Il ristorante è chiuso nella data selezionata",
            validation_out_of_hours: "L'orario selezionato è al di fuori dell'orario di apertura",
            validation_too_late: "L'ultima prenotazione è 30 minuti prima della chiusura",
            validation_past_time: "Impossibile selezionare un orario nel passato",
            trial_title: "🎁 Chiamata di Prova Gratuita (Beta)",
            label_trial_script: "📄 Script messaggio di prova (Max 30 parole)",
            placeholder_trial_script: "Inserisci cosa dovrebbe dire l'IA (sii breve)...",
            msg_trial_limit: "Hai raggiunto il limite di 30 parole per le chiamate di prova.",
            btn_trial: "Prova Gratuitamente",
            reservation_title: "WiseCat AI programmatore di ristoranti",
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
            label_food_name: "Nome del Cibo",
            label_food_quantity: "Quantità (Max 4)",
            placeholder_food_name: "es. Torta al Cioccolato",
            label_preorder_agree: "Accetto di ricevere una quantità parziale (minimo 1) se la disponibilità è limitata.",
            validation_preorder_agree: "Devi accettare la politica sulla quantità parziale per utilizzare questa opzione.",
            option_res_open: "Chiama se aperto",
            placeholder_date: "Seleziona data",
            label_script_language: "🗣️ Lingua chiamata",
            option_auto: "Rilevamento automatico",
            helper_title: "Assistente Modelli di Scenari 🐱",
            helper_examples: {
                res: [
                    { t: "Prenotazione Semplice", v: "Prenota un tavolo per 4 a [Nome Ristorante] per stasera." },
                    { t: "Ordine Articolo", v: "Prenota una torta in pasticceria prima delle 17:00." },
                    { t: "Richiesta Festività", v: "Controlla se siete aperti durante la prossima festività." }
                ],
                mouth: [
                    { t: "Incontro Gruppo Turistico", v: "Ciao, siamo il gruppo turistico XXX. Ci incontreremo all'incrocio di Datong Road." },
                    { t: "Urgente Fuori Servizio", v: "Sono in un paese senza servizio, devo chiamare l'autista ora per coordinare il punto di incontro." },
                    { t: "Verifica Orari Festività", v: "Verifica urgente: siete aperti in determinate festività?" },
                    { t: "Scuse Blocco", v: "Ehi XXX, ho provato a chiamarti ma mi hai bloccato. Ecco le scuse che voglio farti sapere." },
                    { t: "Contatto Generale", v: "Contattare [qualcuno] per [qualcosa] - Devo raggiungerti urgentemente per una questione importante." }
                ]
            },
            nav_calls: "Chiamate",
            nav_profile: "Profilo",
            nav_phone: "Telefono",
            nav_ai: "Servizi IA",
            nav_inbox: "Posta",
            nav_faq: "Domande Frequenti",
            nav_logout: "Esci",
            nav_contact: "Supporto e Aiuto",
            faq_title: "Domande Frequenti",
            faq_subtitle: "Tutto ciò che devi sapere sui servizi WiseCat AI",
            faq_q1: "Come può WiseCat AI trasformare le mie operazioni commerciali?",
            faq_a1: "WiseCat AI automatizza le interazioni con i clienti attraverso agenti vocali intelligenti, permettendo alle aziende di gestire prenotazioni, richieste di informazioni e richieste di servizio 24/7. Ciò riduce il lavoro manuale, migliora i tempi di risposta, aumenta la soddisfazione dei clienti e riduce i costi operativi.",
            faq_q2: "Cosa rende l'agente vocale IA 'Mouthpiece' diverso dagli IVR tradizionali?",
            faq_a2: "A differenza degli IVR tradizionali, Mouthpiece utilizza l'elaborazione del linguaggio naturale avanzata per comprendere il contesto e le sfumature delle conversazioni. Può gestire query complesse, ricordare la cronologia delle conversazioni, adattarsi a diversi scenari e fornire interazioni simili a quelle umane invece di risposte rigide basate su menu.",
            faq_q3: "Come gestisce il Flusso Ristoranti le richieste di prenotazione complesse durante le ore di punta?",
            faq_a3: "Il Flusso Ristoranti è progettato per gestire in modo intelligente più richieste di prenotazione simultanee. Verifica la disponibilità in tempo reale, elabora le preferenze di prenotazione e gestisce richieste speciali. Ciò garantisce che i ristoranti possono massimizzare l'utilizzo della capacità anche durante i periodi occupati senza perdere potenziali clienti.",
            faq_q4: "Posso collegare WiseCat alle mie applicazioni CRM o di messaggistica esistenti?",
            faq_a4: "Sì! WiseCat si integra nativamente con piattaforme popolari incluse LINE, Slack, WhatsApp e principali sistemi CRM. Questo ti consente di mantenere i tuoi flussi di lavoro esistenti mentre sfrutti le capacità IA di WiseCat, creando un'esperienza perfetta per te e i tuoi clienti.",
            faq_q5: "Come garantisce WiseCat la privacy e la sicurezza dei miei dati?",
            faq_a5: "La sicurezza è la nostra priorità assoluta. Tutti i dati vengono crittografati sia in transito che a riposo utilizzando protocolli di crittografia standard del settore. Conformiamo ai GDPR e alle normative locali sulla protezione dei dati, e tutte le conversazioni sono archiviate in modo sicuro. Mantieni il controllo totale sui tuoi dati con la possibilità di eliminare le informazioni in qualsiasi momento.",
            faq_q6: "Come aiuta l'agente Tasker a ridurre il carico di lavoro del mio team?",
            faq_a6: "L'agente Tasker agisce come coordinatore autonomo che gestisce attività di routine come programmazione, conferme, follow-up e raccolta di informazioni. Ciò libera il tuo team per concentrarsi su attività ad alto valore, decision-making e costruzione delle relazioni con i clienti mentre l'IA gestisce il lavoro amministrativo ripetitivo.",
            faq_q7: "C'è un modo per testare le missioni basate sull'IA di WiseCat prima di impegnarsi?",
            faq_a7: "Assolutamente! Il nostro Flusso di Prova ti consente di simulare le interazioni IA con scenari realistici specifici per il tuo caso d'uso. Puoi testare le capacità del sistema, vedere come gestisce i tuoi requisiti aziendali e misurare il potenziale ROI prima di fare un impegno completo. Questo approccio senza rischi ti aiuta a prendere decisioni con fiducia."
        }
    },

    init() {
        if (this.initialized) {
            console.log('WiseCatI18n already initialized');
            return;
        }
        this.initialized = true;
        console.log('WiseCatI18n initializing...');

        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language.slice(0, 2);
        this.currentLang = savedLang || (this.translations[browserLang] ? browserLang : 'en');
        console.log(`Language resolved to: ${this.currentLang} (Saved: ${savedLang}, Browser: ${browserLang})`);

        // Setup language selector(s) if they exist
        const selectors = document.querySelectorAll('#languageSelector, .language-selector-sidebar, .language-selector-header');
        selectors.forEach(selector => {
            (selector as HTMLSelectElement).value = this.currentLang;
            selector.addEventListener('change', (e: Event) => {
                const newLang = (e.target as HTMLSelectElement).value;
                console.log('Language selector changed to:', newLang);
                this.setLanguage(newLang);
                // Sync all other selectors on the page
                selectors.forEach(s => {
                    if (s !== selector) (s as HTMLSelectElement).value = newLang;
                });
            });
        });
        if (selectors.length === 0) {
            console.warn('No language selector elements found');
        }

        this.apply();

        // Listen for user updates to refresh credits
        window.addEventListener('userUpdated', () => this.apply());
    },

    setLanguage(lang: string) {
        if (!this.translations[lang]) lang = 'en';
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
        this.apply();
    },

    apply() {
        console.log('Applying translations for:', this.currentLang);
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
            if (key && dict[key]) el.textContent = dict[key];
        });

        // Apply placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key && dict[key]) (el as HTMLInputElement).placeholder = dict[key];
        });

        // Special handling for credits display
        this.refreshCredits();

        // Render Helper Examples if container exists
        this.renderHelper();
    },

    renderHelper() {
        const helperPanel = document.getElementById('helperPanel');
        if (!helperPanel) return;

        const lang = this.currentLang;
        const dict = this.translations[lang] || this.translations['en'];
        // Detect page type from URL or Title
        const type = (window.location.pathname.toLowerCase().includes('mouthpiece') || document.title.toLowerCase().includes('mouthpiece')) ? 'mouth' : 'res';
        const examples = (dict.helper_examples && dict.helper_examples[type]) || [];

        console.log(`renderHelper: lang=${lang}, type=${type}, examples count=${examples.length}`);

        // Clear existing examples (except header)
        const existingExamples = helperPanel.querySelectorAll('.helper-example');
        existingExamples.forEach(el => el.remove());

        // Create and append new examples
        examples.forEach((ex: any) => {
            const div = document.createElement('div');
            div.className = 'helper-example';
            div.onclick = () => {
                const targetId = type === 'mouth' ? 'script' : 'note';
                const textarea = document.getElementById(targetId) as HTMLTextAreaElement;
                if (textarea) {
                    let text = ex.v;
                    if (text.includes('{email}')) {
                        const userSession = localStorage.getItem('wisecat_user');
                        let email = '[your_email]';
                        try {
                            if (userSession) email = JSON.parse(userSession).email || email;
                        } catch (e) { }
                        text = text.replace('{email}', email);
                    }
                    textarea.value = text;

                    // Auto-select mission if specified
                    if (type === 'mouth' && ex.mission) {
                        const missionSelect = document.getElementById('mission') as HTMLSelectElement;
                        if (missionSelect) {
                            missionSelect.value = ex.mission;
                            // Trigger change event to update mission description
                            missionSelect.dispatchEvent(new Event('change'));
                        }
                    }

                    helperPanel.classList.remove('show');
                    textarea.focus();
                }
            };

            const title = document.createElement('span');
            title.className = 'helper-example-title';
            title.textContent = ex.t;

            const content = document.createElement('span');
            content.className = 'helper-example-content';
            content.textContent = ex.v;

            div.appendChild(title);
            div.appendChild(content);
            helperPanel.appendChild(div);
        });
    },

    refreshCredits() {
        // Find all potential credit display elements on the page
        const displays = document.querySelectorAll('#creditsDisplay, #creditsAmount, #profileCredits, #formCredits, .sidebar-credits');
        if (displays.length === 0) return;

        const userSession = localStorage.getItem('wisecat_user');
        if (userSession) {
            try {
                const user = JSON.parse(userSession);
                const credits = user.credits || 0;
                const dict = this.translations[this.currentLang] || this.translations['en'];

                displays.forEach(el => {
                    if (el.id === 'creditsAmount' || el.id === 'profileCredits') {
                        // Direct amount display
                        el.textContent = `$${credits.toFixed(2)}`;
                    } else if (dict.text_credits) {
                        // Translation-based display
                        el.textContent = dict.text_credits.replace('$0', `$${credits.toFixed(2)}`);
                    } else {
                        // Fallback
                        el.textContent = `$${credits.toFixed(2)} USD`;
                    }
                });
            } catch (e) {
                console.error("i18n credits error", e);
            }
        }
    },

    phoneRules: {
        '+886': /^0?[2-9]\d{6,9}$/,    // Taiwan
        '+1': /^\d{10}$/,              // USA
        '+81': /^\d{10,11}$/,          // Japan
        '+82': /^\d{9,11}$/,           // Korea
        'default': /^\d{7,15}$/        // Generic
    },

    validatePhone(code: string, number: string) {
        const rule = this.phoneRules[code] || this.phoneRules['default'];
        return rule.test(number.replace(/\D/g, ''));
    },

    formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
        const langMap: { [key: string]: string } = {
            'en': 'en-US',
            'zh': 'zh-TW',
            'jp': 'ja-JP',
            'kr': 'ko-KR',
            'fr': 'fr-FR',
            'it': 'it-IT',
            'es': 'es-ES'
        };
        const locale = langMap[this.currentLang] || 'en-US';
        return date.toLocaleDateString(locale, options);
    }
};

// Global access
(window as any).WiseCatI18n = WiseCatI18n;
export default WiseCatI18n;
