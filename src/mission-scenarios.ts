// Mission scenarios configuration
// This file contains all mission scenarios for the mouthpiece feature

export interface MissionScenario {
    id: string;
    name: {
        en: string; zh: string; jp: string; kr: string;
        es: string; fr: string; it: string;
    };
    description: {
        en: string; zh: string; jp: string; kr: string;
        es: string; fr: string; it: string;
    };
    services?: string[];
}

export const MISSION_SCENARIOS: MissionScenario[] = [
    {
        id: 'lost_item',
        services: ['mouthpiece'],
        name: {
            en: 'Lost Item Inquiry', zh: '失物查詢', jp: '紛失物の問い合わせ', kr: '분실물 조회',
            es: 'Consulta de objetos perdidos', fr: 'Demande d\'objets trouvés', it: 'Richiesta oggetti smarriti'
        },
        description: {
            en: 'Call a specific location to describe lost item characteristics, ask if it has been found, and inquire about the retrieval process.',
            zh: '撥給特定場所描述遺失物特徵，詢問是否拾獲及領取流程。',
            jp: '特定の場所に電話して紛失物の特徴を説明し、見つかったかどうかを尋ね、受け取り手順を確認する。',
            kr: '특정 장소에 전화하여 분실물 특징을 설명하고 습득 여부 및 수령 절차를 문의합니다.',
            es: 'Llama a un lugar específico para describir las características del artículo perdido, preguntar si se ha encontrado e informarse sobre el proceso de recuperación.',
            fr: 'Appeler un lieu spécifique pour décrire les caractéristiques de l\'objet perdu, demander s\'il a été trouvé et se renseigner sur la procédure de récupération.',
            it: 'Chiama un luogo specifico per descrivere le caratteristiche dell\'oggetto smarrito, chiedere se è stato trovato e informarsi sulla procedura di recupero.'
        }
    },
    {
        id: 'business_hours',
        services: ['mouthpiece'],
        name: {
            en: 'Business Hours Confirmation', zh: '營業確認', jp: '営業時間確認', kr: '영업시간 확인',
            es: 'Confirmación de horario comercial', fr: 'Confirmation des heures d\'ouverture', it: 'Conferma orari di apertura'
        },
        description: {
            en: 'Call a store to verify operating status on a specific date, holiday closures, or temporary changes.',
            zh: '撥給店家核實特定日期的營業狀態、公休計畫或臨時變動。',
            jp: '特定の日付の営業状況、休日の休業、または一時的な変更を確認するために店舗に電話する。',
            kr: '특정 날짜의 영업 상태, 휴무 계획 또는 임시 변경 사항을 확인하기 위해 매장에 전화합니다.',
            es: 'Llama a una tienda para verificar el estado de operación en una fecha específica, cierres por feriados o cambios temporales.',
            fr: 'Appeler un magasin pour vérifier le statut d\'ouverture à une date spécifique, les fermetures pour jours fériés ou les changements temporaires.',
            it: 'Chiama un negozio per verificare lo stato operativo in una data specifica, chiusure festive o modifiche temporanee.'
        }
    },
    {
        id: 'restaurant_booking',
        services: ['mouthpiece', 'restaurant'],
        name: {
            en: 'Restaurant Reservation', zh: '餐廳訂位', jp: 'レストラン予約', kr: '레스토랑 예약',
            es: 'Reserva de restaurante', fr: 'Réservation de restaurant', it: 'Prenotazione ristorante'
        },
        description: {
            en: 'Call a restaurant on behalf of a client to inquire about table availability for a specific time and complete the booking.',
            zh: '撥給餐廳代表客戶詢問特定時段空位，並完成代訂與記錄。',
            jp: '顧客に代わってレストランに電話し、特定の時間の空席状況を確認し、予約を完了する。',
            kr: '고객을 대신하여 레스토랑에 전화하여 특정 시간대의 테이블 예약 가능 여부를 문의하고 예약을 완료합니다.',
            es: 'Llama a un restaurante en nombre de un cliente para preguntar sobre la disponibilidad de mesas para una hora específica y completar la reserva.',
            fr: 'Appeler un restaurant au nom d\'un client pour s\'informer sur la disponibilité des tables à une heure précise et finaliser la réservation.',
            it: 'Chiama un ristorante per conto di un cliente per informarsi sulla disponibilità di tavoli per un orario specifico e completare la prenotazione.'
        }
    },
    {
        id: 'package_tracking',
        services: ['mouthpiece'],
        name: {
            en: 'Package Tracking', zh: '物流查件', jp: '配送追跡', kr: '택배 추적',
            es: 'Seguimiento de paquetes', fr: 'Suivi de colis', it: 'Tracciamento pacchi'
        },
        description: {
            en: 'Call courier or seller to verify package delivery progress, driver contact information, and estimated arrival time.',
            zh: '撥給快遞或賣家核對包裹配送進度、司機電話與預計抵達時間。',
            jp: '配送業者または販売者に電話して、荷物の配送進捗、ドライバーの連絡先、到着予定時刻を確認する。',
            kr: '택배업체나 판매자에게 전화하여 배송 진행 상황, 기사 연락처 및 예상 도착 시간을 확인합니다.',
            es: 'Llama al mensajero o vendedor para verificar el progreso de entrega del paquete, información de contacto del conductor y tiempo estimado de llegada.',
            fr: 'Appeler le coursier ou le vendeur pour vérifier la progression de la livraison du colis, les coordonnées du chauffeur et l\'heure d\'arrivée estimée.',
            it: 'Chiama il corriere o il venditore per verificare l\'avanzamento della consegna del pacco, le informazioni di contatto dell\'autista e l\'orario di arrivo stimato.'
        }
    },
    {
        id: 'event_rsvp',
        services: ['mouthpiece'],
        name: {
            en: 'Event RSVP', zh: '活動 RSVP', jp: 'イベント出欠確認', kr: '행사 참석 확인',
            es: 'Confirmación de evento', fr: 'Confirmation d\'événement', it: 'Conferma evento'
        },
        description: {
            en: 'Call invitees to confirm attendance at an event, collect headcount, and ask about special dietary requirements.',
            zh: '撥給受邀者確認是否出席活動，並統計人數與特殊飲食需求。',
            jp: '招待者に電話してイベントへの出席を確認し、參加人數と特別な食事要件を確認する。',
            kr: '초대받은 사람에게 전화하여 행사 참석 여부를 확인하고 인원수와 특별 식단 요구사항을 파악합니다.',
            es: 'Llama a los invitados para confirmar la asistencia a un evento, recopilar el conteo de personas y preguntar sobre requisitos dietéticos especiales.',
            fr: 'Appeler les invités pour confirmer la présence à un événement, compter le nombre de personnes et demander les exigences alimentaires spéciales.',
            it: 'Chiama gli invitati per confermare la partecipazione a un evento, raccogliere il numero di partecipanti e chiedere eventuali esigenze dietetiche speciali.'
        }
    },
    {
        id: 'repair_appointment',
        services: ['mouthpiece'],
        name: {
            en: 'Repair Appointment', zh: '報修預約', jp: '修理予約', kr: '수리 예약',
            es: 'Cita de reparación', fr: 'Rendez-vous de réparation', it: 'Appuntamento riparazione'
        },
        description: {
            en: 'Call a repair service to describe equipment issues and schedule an on-site technician visit.',
            zh: '撥給維修商描述設備故障狀況，並約定師傅到府服務的時段。',
            jp: '修理サービスに電話して機器の問題を説明し、訪問修理の日時を予約する。',
            kr: '수리 서비스에 전화하여 장비 문제를 설명하고 기술자 방문 일정을 잡습니다.',
            es: 'Llama a un servicio de reparación para describir problemas con el equipo y programar una visita del técnico.',
            fr: 'Appeler un service de réparation pour décrire les problèmes d\'équipement et planifier une visite de technicien sur site.',
            it: 'Chiama un servizio di riparazione per descrivere i problemi dell\'attrezzatura e programmare una visita del tecnico in loco.'
        }
    },
    {
        id: 'order_modification',
        services: ['mouthpiece'],
        name: {
            en: 'Order Modification', zh: '訂單修改', jp: '注文変更', kr: '주문 변경',
            es: 'Modificación de pedido', fr: 'Modification de commande', it: 'Modifica ordine'
        },
        description: {
            en: 'Call a merchant on behalf of a client to request changes to product specifications, quantity, or delivery information.',
            zh: '撥給商家代表客戶要求變更已下單的商品規格、數量或收貨資訊。',
            jp: '顧客に代わって販売者に電話し、製品仕様、數量、配送情報の変更を依頼する。',
            kr: '고객을 대신하여 판매자에게 전화하여 제품 사양, 수량 또는 배송 정보 변경을 요청합니다.',
            es: 'Llama a un comerciante en nombre de un cliente para solicitar cambios en las especificaciones del producto, cantidad o información de entrega.',
            fr: 'Appeler un commerçant au nom d\'un client pour demander des modifications des spécifications du produit, de la quantité o des informations de livraison.',
            it: 'Chiama un commerciante per conto di un cliente per richiedere modifiche alle specifiche del prodotto, alla quantità o alle informazioni di consegna.'
        }
    },
    {
        id: 'emergency_notification',
        services: ['mouthpiece'],
        name: {
            en: 'Emergency Notification', zh: '緊急通知', jp: '緊急通知', kr: '긴급 알림',
            es: 'Notificación de emergencia', fr: 'Notification d\'urgence', it: 'Notifica di emergenza'
        },
        description: {
            en: 'Call a designated contact to relay the client\'s urgent message, request for help, or current location.',
            zh: '撥給指定聯絡人傳遞客戶當下的緊急訊息、求助內容或即時位置。',
            jp: '指定された連絡先に電話して、顧客の緊急メッセージ、助けの要請、または現在位置を伝える。',
            kr: '지정된 연락처에 전화하여 고객의 긴급 메시지, 도움 요청 또는 현재 위치를 전달합니다.',
            es: 'Llama a un contacto designado para transmitir el mensaje urgente del cliente, solicitud de ayuda o ubicación actual.',
            fr: 'Appeler un contact désigné pour transmettre le message urgent du client, sa demande d\'aide o sa position actuelle.',
            it: 'Chiama un contatto designato per trasmettere il messaggio urgente del cliente, la richiesta di aiuto o la posizione corrente.'
        }
    },
    {
        id: 'schedule_verification',
        services: ['mouthpiece'],
        name: {
            en: 'Schedule Verification', zh: '行程核對', jp: 'スケジュール確認', kr: '일정 확인',
            es: 'Verificación de horario', fr: 'Vérification d\'horaire', it: 'Verifica programma'
        },
        description: {
            en: 'Call a business contact to confirm specific time, location, and required documents for a meeting or interview.',
            zh: '撥給業務窗口確認會議或面試的具體時間、地點及需準備文件。',
            jp: 'ビジネス連絡先に電話して、會議または面接の具體的な時間、場所、必要書類を確認する。',
            kr: '비즈니스 연락처에 전화하여 회의 또는 면접의 구체적인 시간, 장소 및 필요 서류를 확인합니다.',
            es: 'Llama a un contacto comercial para confirmar hora específica, ubicación and documentos requeridos para una reunión o entrevista.',
            fr: 'Appeler un contact professionnel pour confirmer l\'heure précise, le lieu et les documents requis pour une réunion ou un entretien.',
            it: 'Chiama un contatto aziendale per confermare l\'ora specifica, il luogo e i documenti richiesti per una riunione o un colloquio.'
        }
    },
    {
        id: 'stock_inquiry',
        services: ['mouthpiece'],
        name: {
            en: 'Stock Inquiry', zh: '庫存詢問', jp: '在庫確認', kr: '재고 문의',
            es: 'Consulta de inventario', fr: 'Demande de stock', it: 'Richiesta stock'
        },
        description: {
            en: 'Call a store to ask if a specific product model is currently in stock and whether it can be reserved.',
            zh: '撥給門市詢問特定型號商品目前是否有現貨，以及是否能預留。',
            jp: '店舗に電話して特定の製品モデルが現在在庫があるか、予約可能かを確認する。',
            kr: '매장에 전화하여 특정 제품 모델의 현재 재고 여부와 예약 가능 여부를 문의합니다.',
            es: 'Llama a una tienda para preguntar si un modelo de producto específico está actualmente en stock y si se puede reservar.',
            fr: 'Appeler un magasin pour demander si un modèle de produit específico est actuellement en stock et s\'il peut être réservé.',
            it: 'Chiama un negozio per chiedere se un modelo de prodotto specifico è actualmente disponibile e se può essere riservato.'
        }
    },
    {
        id: 'salon_reservation',
        services: ['mouthpiece'],
        name: {
            en: 'Salon Reservation', zh: '美髮/美容預約', jp: '理美容予約', kr: '미용실 예약',
            es: 'Reserva de salón', fr: 'Réservation de salon', it: 'Prenotazione salone'
        },
        description: {
            en: 'Call a hair salon or beauty parlor to book a styling or treatment session.',
            zh: '撥給理髮店或美容院預約美髮、美容或美甲服務時段。',
            jp: '美容院やエステサロンに電話して、スタイリングや施術の予約をする。',
            kr: '미용실이나 피부관리실에 전화하여 헤어 스타일링 또는 트리트먼트 세션을 예약합니다.',
            es: 'Llama a una peluquería o salón de belleza para reservar una sesión de peinado o tratamiento.',
            fr: 'Appeler un salon de coiffure ou un institut de beauté pour prendre rendez-vous pour un coiffage ou un soin.',
            it: 'Chiama un parrucchiere o un centro estetico per prenotare una sessione di styling o un trattamento.'
        }
    },
    {
        id: 'aesthetic_consultation',
        services: ['mouthpiece'],
        name: {
            en: 'Aesthetic Consultation', zh: '醫美諮詢預約', jp: '美容整形・美容皮膚科相談', kr: '성형/피부과 상담',
            es: 'Consulta estética', fr: 'Consultation esthétique', it: 'Consulenza estetica'
        },
        description: {
            en: 'Call an aesthetic clinic or plastic surgeon to schedule a professional consultation.',
            zh: '撥給醫美診所或整形外科預約專業諮詢或療程評估。',
            jp: '美容クリニックや形成外科に電話して、専門的な相談やカウンセリングの予約をする。',
            kr: '성형외과나 피부과에 전화하여 전문적인 상담 또는 시술 평가 일정을 잡습니다.',
            es: 'Llama a una clínica estética o cirujano plástico para programar una consulta profesional.',
            fr: 'Appeler une clinique esthétique ou un chirurgien plasticien pour planifier una consultation professionnelle.',
            it: 'Chiama una clinica estetica o un chirurgo plastico per programmare una consulenza professionale.'
        }
    },
    {
        id: 'dental_consultation',
        services: ['mouthpiece'],
        name: {
            en: 'Dental Consultation', zh: '牙科諮詢/檢查', jp: '歯科相談・検診', kr: '치과 상담/검진',
            es: 'Consulta dental', fr: 'Consultation dentaire', it: 'Consulenza dentale'
        },
        description: {
            en: 'Call a dentist to schedule a check-up, cleaning, or specialized consultation.',
            zh: '撥給牙醫診所預約洗牙、檢查、或特定牙科療程諮詢。',
            jp: '歯科医院に電話して、定期検診やクリーニング、専門的な相談の予約をする。',
            kr: '치과에 전화하여 검진, 스케일링 또는 전문적인 상담 일정을 잡습니다.',
            es: 'Llama a un dentist para programar un chequeo, limpieza o consulta especializada.',
            fr: 'Appeler un dentiste pour planifier un contrôle, un détartrage ou une consultation spécialisée.',
            it: 'Chiama un dentiste per programmare un controllo, una pulizia o una consulenza specialistica.'
        }
    },
    {
        id: 'medical_appointment',
        services: ['mouthpiece'],
        name: {
            en: 'Medical/Dental Appointment', zh: '醫療/牙醫預約', jp: '醫療・歯科予約', kr: '의료/치과 예약',
            es: 'Cita médica/mental', fr: 'Rendez-vous médical/dentaire', it: 'Appuntamento medico/dentistico'
        },
        description: {
            en: 'Call a clinic, hospital, or dentist to schedule an appointment or consultation.',
            zh: '撥給診所、醫院或牙醫預約看診、諮詢、或檢查時間。',
            jp: '診療所、病院、または歯科醫に電話して、診察や相談の予約をする。',
            kr: '병원, 의원 또는 치과에 전화하여 진료 또는 상담 예약을 잡습니다.',
            es: 'Llama a una clínica, hospital o denist para programar una cita o consulta.',
            fr: 'Appeler une clinique, un hôpital ou un dentiste pour prendre rendez-vous ou una consultation.',
            it: 'Chiama una clinica, un ospedale o un dentista per fissare un appuntamento o una consultazione.'
        }
    }
];
