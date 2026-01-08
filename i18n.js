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
            service_trial_title: "Free Trial Call",
            service_trial_desc: "Experience AI voice calling with a limited trial",

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
            validation_phone: "Invalid phone format for selected country",
            validation_closed: "The restaurant is closed on the selected date",
            validation_out_of_hours: "The selected time is outside of operating hours",
            validation_too_late: "Last reservation is 30 minutes before closing",
            trial_title: "🎁 Free Trial Call (Beta)",
            label_trial_script: "📄 Trial Message Script (Max 30 words)",
            placeholder_trial_script: "Enter what the AI should say (keep it brief)...",
            msg_trial_limit: "You've reached the 30-word limit for trial calls.",
            btn_trial: "Try for Free",

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
            helper_examples: {
                res: [
                    { t: "Simple Reservation", v: "Reserve a table for 4 at [Restaurant Name] for tonight." },
                    { t: "Item Pre-order", v: "Reserve a cake at the bakery before 5PM." },
                    { t: "Holiday Inquiry", v: "Check if you are opening on the upcoming holiday." }
                ],
                mouth: [
                    { t: "Urgent Sync", v: "I'm in an out-of-service area, I need to sync up the meet up point with the driver now." },
                    { t: "Holiday Inquiry", v: "Checking urgent information: are you open during the upcoming holiday?" },
                    { t: "Personal Message", v: "Hey [Name], I'm trying to call you but you blocked me. I just wanted to say sorry and explain." },
                    { t: "Logistics Sync", v: "Checking if the package needs to be dropped at the management office (管理室)." },
                    { t: "Fallback Contact", v: "I've been trying to reach you. Please contact me via email at {email}." }
                ]
            }
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
            service_trial_title: "免費試用撥號",
            service_trial_desc: "體驗 AI 語音通話 (試用版額度限制)",

            btn_submit: "啟動 AI 撥號",
            btn_refill: "儲值",
            btn_back: "← 返回主頁面",
            footer: "由 WiseCat AI 提供自動化撥號服務",
            msg_calling: "WiseCat 助手已開始撥號！",
            msg_success: "撥號成功",
            msg_failed: "撥號失敗",
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
            validation_phone: "手機格式與所選國家不符",
            validation_closed: "該餐廳在您選擇的日期不營業",
            validation_out_of_hours: "預約時間不在營業時間內",
            validation_too_late: "最後預約時間為結束前 30 分鐘",
            trial_title: "🎁 免費試用撥號 (Beta)",
            label_trial_script: "📄 試用語音腳本 (限 30 字內)",
            placeholder_trial_script: "請輸入 AI 說話內容 (請保持簡短)...",
            msg_trial_limit: "試用撥號限制為 30 字以內。",
            btn_trial: "免費體驗",

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
            helper_examples: {
                res: [
                    { t: "簡單預約", v: "今晚在 [餐廳名稱] 預訂一桌 4 人位。" },
                    { t: "品項預留", v: "在下午 5 點前到麵包店預留一個蛋糕。" },
                    { t: "假日確認", v: "詢問特定節假日是否照常營業。" }
                ],
                mouth: [
                    { t: "緊急會合", v: "我目前處於收訊不佳的地區，現在需要與司機同步會合地點。" },
                    { t: "節日確認", v: "緊急確認：請問您在即將到來的節假日是否照常營業？" },
                    { t: "個人訊息", v: "嘿 [姓名]，我試著撥給你但你封鎖我了，我只是想跟妳說聲抱歉並解釋一下。" },
                    { t: "物流確認", v: "確認物流包裹是否需要放在管理室？" },
                    { t: "聯繫方式", v: "我一直聯絡不上您，請透過電子郵件 {email} 與我聯繫。" }
                ]
            }
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
            option_open: "対応可能な時に電話",
            validation_name: "名前は英語のみ（ハイフン/アンダースコア可）",
            validation_phone: "電話番号の形式が正しくありません",
            validation_closed: "選択した日は定休日です",
            validation_out_of_hours: "営業時間外です",
            validation_too_late: "最終予約は閉店の30分前までです",
            trial_title: "🎁 無料体験通話 (ベータ版)",
            label_trial_script: "📄 体験メッセージスクリプト (最大30語)",
            placeholder_trial_script: "AIに話させたい内容を入力（簡潔に）...",
            msg_trial_limit: "体験版の制限である30語に達しました。",
            btn_trial: "無料で試す",

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
            helper_examples: {
                res: [
                    { t: "簡単な予約", v: "今夜、[レストラン名]で4人のテーブルを予約してください。" },
                    { t: "商品の予約", v: "午後5時までにパン屋でケーキを予約してください。" },
                    { t: "休日の問い合わせ", v: "今度の祝日に営業しているか確認してください。" }
                ],
                mouth: [
                    { t: "緊急確認", v: "圏外にいるため、今すぐ運転手と待ち合わせ場所を確認する必要があります。" },
                    { t: "休日問い合わせ", v: "緊急の確認です：今度の祝日は営業していますか？" },
                    { t: "個人的なメッセージ", v: "ねえ[なまえ]、電話したけどブロックされてるみたい。ただ謝って説明したかっただけなんだ。" },
                    { t: "物流の確認", v: "荷物を管理室に預ける必要があるか物流会社に確認しています。" },
                    { t: "連絡先", v: "連絡が取れませんでした。メール {email} で連絡をください。" }
                ]
            }
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
            option_open: "가능할 때 통화",
            validation_name: "이름은 영문자만 가능합니다 (하이픈/언더스코어 허용)",
            validation_phone: "전화번호 형식이 올바르지 않습니다",
            validation_closed: "선택하신 날짜는 휴무일입니다",
            validation_out_of_hours: "영업 시간 외입니다",
            validation_too_late: "마지막 예약은 마감 30분 전까지입니다",
            trial_title: "🎁 무료 체험 통화 (베타)",
            label_trial_script: "📄 체험 메시지 스크립트 (최대 30단어)",
            placeholder_trial_script: "AI가 말할 내용을 입력하세요 (간결하게)...",
            msg_trial_limit: "체험 통화의 30단어 제한에 도달했습니다.",
            btn_trial: "무료로 체험하기",
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
            helper_examples: {
                res: [
                    { t: "간단한 예약", v: "오늘 밤 [식당 이름]에 4인 테이블을 예약해 주세요." },
                    { t: "품목 예약", v: "오후 5시 이전에 빵집에서 케이크를 예약해 주세요." },
                    { t: "공휴일 문의", v: "다가오는 공휴일에 영업하는지 확인해 주세요." }
                ],
                mouth: [
                    { t: "긴급 동기화", v: "현재 서비스 지역 외에 있어서 지금 당장 기사님과 미팅 장소를 확인해야 합니다." },
                    { t: "공휴일 문의", v: "긴급 확인: 다가오는 공휴일에 영업하시나요?" },
                    { t: "개인 메시지", v: "안녕하세요 [이름]님, 전화를 드렸으나 차단된 것 같아 사과와 설명을 드리고자 연락드렸습니다." },
                    { t: "물류 확인", v: "택배를 관리실에 맡겨야 하는지 물류팀에 확인 중입니다." },
                    { t: "연락처", v: "연락이 닿지 않아 이메일 {email}로 연락 부탁드립니다." }
                ]
            }
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
            option_open: "Llamar cuando esté disponible",
            validation_name: "Nombres en letras inglesas (se permiten guiones)",
            validation_phone: "Formato de teléfono no válido",
            validation_closed: "El restaurante está cerrado en la fecha seleccionada",
            validation_out_of_hours: "La hora seleccionada está fuera del horario de atención",
            validation_too_late: "La última reserva es 30 minutos antes del cierre",
            trial_title: "🎁 Llamada de Prueba Gratis (Beta)",
            label_trial_script: "📄 Guión de mensaje de prueba (Máx 30 palabras)",
            placeholder_trial_script: "Escriba lo que debe decir la IA (sea breve)...",
            msg_trial_limit: "Has alcanzado el límite de 30 palabras para llamadas de prueba.",
            btn_trial: "Probar Gratis",
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
            helper_examples: {
                res: [
                    { t: "Reserva Simple", v: "Reserva una mesa para 4 en [Nombre del Restaurante] para esta noche." },
                    { t: "Pedido de Artículo", v: "Reserva un pastel en la panadería antes de las 5 PM." },
                    { t: "Consulta de Festivo", v: "Consulta si abren en el próximo día festivo." }
                ],
                mouth: [
                    { t: "Sincronización Urgente", v: "Estoy en una zona sin servicio, necesito coordinar el punto de encuentro con el conductor ahora." },
                    { t: "Consulta de Festivo", v: "Consulta urgente: ¿abren durante el próximo día festivo?" },
                    { t: "Mensaje Personal", v: "Hola [Nombre], traté de llamarte pero me bloqueaste. Solo quería pedirte disculpas y explicarme." },
                    { t: "Logística", v: "Confirmando con logística si el paquete debe dejarse en la oficina de administración (管理室)." },
                    { t: "Contacto", v: "He intentado contactarte. Por favor, escríbeme al correo {email}." }
                ]
            }
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
            option_open: "Appeler si disponible",
            validation_name: "Noms en lettres anglaises (tirets autorisés)",
            validation_phone: "Format de téléphone invalide",
            validation_closed: "Le restaurant est fermé à la date sélectionnée",
            validation_out_of_hours: "L'heure sélectionnée est en dehors des heures d'ouverture",
            validation_too_late: "La dernière réservation est 30 minutes avant la fermeture",
            trial_title: "🎁 Appel d'Essai Gratuit (Bêta)",
            label_trial_script: "📄 Script du message d'essai (Max 30 mots)",
            placeholder_trial_script: "Entrez ce que l'IA doit dire (soyez bref)...",
            msg_trial_limit: "Vous avez atteint la limite de 30 mots pour les appels d'essai.",
            btn_trial: "Essayer Gratuitement",
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
            helper_examples: {
                res: [
                    { t: "Réservation Simple", v: "Réservez une table pour 4 à [Nom du Restaurant] pour ce soir." },
                    { t: "Commande d'Article", v: "Réservez un gâteau à la boulangerie avant 17h00." },
                    { t: "Demande de Congé", v: "Vérifiez si vous êtes ouvert lors du prochain jour férié." }
                ],
                mouth: [
                    { t: "Urgence Synchro", v: "Je suis dans une zone sans service, je dois coordonner le point de rencontre avec le chauffeur maintenant." },
                    { t: "Demande Jour Férié", v: "Vérification urgente : êtes-vous ouvert lors du prochain jour férié ?" },
                    { t: "Message Personnel", v: "Hé [Nom], j'ai essayé de t'appeler mais tu m'as bloqué. Je voulais juste te présenter mes excuses et m'expliquer." },
                    { t: "Logistique", v: "Vérification avec la logistique si le colis doit être déposé au bureau de gestion (管理室)." },
                    { t: "Contact", v: "J'ai essayé de vous joindre. Veuillez me contacter par e-mail à {email}." }
                ]
            }
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
            option_open: "Chiama se disponibile",
            validation_name: "Nomi in lettere inglesi (trattini consentiti)",
            validation_phone: "Formato telefono non valido",
            validation_closed: "Il ristorante è chiuso nella data selezionata",
            validation_out_of_hours: "L'orario selezionato è al di fuori dell'orario di apertura",
            validation_too_late: "L'ultima prenotazione è 30 minuti prima della chiusura",
            trial_title: "🎁 Chiamata di Prova Gratuita (Beta)",
            label_trial_script: "📄 Script messaggio di prova (Max 30 parole)",
            placeholder_trial_script: "Inserisci cosa dovrebbe dire l'IA (sii breve)...",
            msg_trial_limit: "Hai raggiunto il limite di 30 parole per le chiamate di prova.",
            btn_trial: "Prova Gratuitamente",
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
            helper_examples: {
                res: [
                    { t: "Prenotazione Semplice", v: "Prenota un tavolo per 4 a [Nome Ristorante] per stasera." },
                    { t: "Ordine Articolo", v: "Prenota una torta in pasticceria prima delle 17:00." },
                    { t: "Richiesta Festività", v: "Controlla se siete aperti durante la prossima festività." }
                ],
                mouth: [
                    { t: "Sincronizzazione Urgente", v: "Sono in una zona senza servizio, devo coordinare il punto di incontro con l'autista ora." },
                    { t: "Richiesta Festività", v: "Verifica urgente: siete aperti durante la prossima festività?" },
                    { t: "Messaggio Personale", v: "Ehi [Nome], ho provato a chiamarti ma mi hai bloccato. Volevo solo scusarmi e spiegarti." },
                    { t: "Logistica", v: "Verifica con la logistica se il pacco deve essere lasciato nell'ufficio di gestione (管理室)." },
                    { t: "Contatto", v: "Ho provato a contattarti. Per favore, scrivimi via email a {email}." }
                ]
            }
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

        // Render Helper Examples if container exists
        this.renderHelper();
    },

    renderHelper() {
        const helperPanel = document.getElementById('helperPanel');
        if (!helperPanel) return;

        const lang = this.currentLang;
        const dict = this.translations[lang] || this.translations['en'];
        const type = document.title.toLowerCase().includes('mouthpiece') ? 'mouth' : 'res';
        const examples = dict.helper_examples ? dict.helper_examples[type] : [];

        // Clear existing examples (except header)
        const existingExamples = helperPanel.querySelectorAll('.helper-example');
        existingExamples.forEach(el => el.remove());

        // Create and append new examples
        examples.forEach(ex => {
            const div = document.createElement('div');
            div.className = 'helper-example';
            div.onclick = () => {
                const targetId = type === 'mouth' ? 'scriptContent' : 'note';
                const textarea = document.getElementById(targetId);
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
    },

    phoneRules: {
        '+886': /^0?[2-9]\d{6,9}$/,    // Taiwan: Supports 02/2, 06/6 prefix (8-10 digits total) and 09/9 mobile (9-10 digits)
        '+1': /^\d{10}$/,        // USA: 10 digits
        '+81': /^\d{10,11}$/,    // Japan: 10-11 digits
        '+82': /^\d{9,11}$/,     // Korea: 9-11 digits
        'default': /^\d{7,15}$/  // Generic fallback
    },

    validatePhone(code, number) {
        const rule = this.phoneRules[code] || this.phoneRules['default'];
        return rule.test(number.replace(/\D/g, ''));
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WiseCatI18n.init());
} else {
    WiseCatI18n.init();
}
