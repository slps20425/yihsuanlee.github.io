
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "reservation");

const missions = [
    {
        id: "lost_item",
        mission_name: "Lost Item Inquiry",
        google_type: "any",
        default_keyword: "",
        description: "Inquire about a lost item at a specific location.",
        keywords_pool: ["lost item"]
    },
    {
        id: "dental_consultation",
        mission_name: "Dental Consultation",
        google_type: "dentist",
        default_keyword: "牙醫診所",
        description: "Inquire about appointments or services.",
        keywords_pool: ["dentist", "dental", "implant", "牙醫"]
    },
    {
        id: "salon_reservation",
        mission_name: "Salon Reservation",
        google_type: "beauty_salon",
        default_keyword: "美髮沙龍",
        description: "Book a haircut or beauty service.",
        keywords_pool: ["salon", "haircut", "beauty", "美髮"]
    },
    {
        id: "repair_appointment",
        mission_name: "Repair Appointment",
        google_type: "plumber",
        default_keyword: "水電維修",
        description: "Fix leaks, electrical issues, or general repairs.",
        keywords_pool: ["plumber", "electrician", "repair", "水電"]
    },
    {
        id: "aesthetic_consultation",
        mission_name: "Aesthetic Consultation",
        google_type: "health",
        default_keyword: "醫美診所",
        description: "Consultation for aesthetic treatments (laser, pico, etc).",
        keywords_pool: ["aesthetic", "plastic surgery", "laser", "醫美"]
    },
    {
        id: "housing_inquiry",
        mission_name: "Housing Inquiry (Rent/Buy)",
        google_type: "real_estate_agency",
        default_keyword: "房屋仲介",
        description: "Inquire about buying or renting real estate.",
        keywords_pool: ["rent", "buy house", "apartment", "real estate", "租屋", "買房"]
    },
    {
        id: "stock_inquiry",
        mission_name: "Stock Inquiry (Retail)",
        google_type: "clothing_store",
        default_keyword: "服飾店",
        description: "Check for product availability (size, color, stock).",
        keywords_pool: ["stock", "size", "color", "inventory", "庫存", "尺寸"]
    }
];

async function seedMissions() {
    console.log("Seeding missions to 'reservation' database...");
    for (const mission of missions) {
        const ref = doc(db, "missions", mission.id);
        await setDoc(ref, mission, { merge: true });
        console.log(`Updated mission: ${mission.mission_name}`);
    }
    console.log("Mission seeding complete.");
    process.exit(0);
}

seedMissions().catch(err => {
    console.error("Error seeding missions:", err);
    process.exit(1);
});
