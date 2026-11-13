/* =====================================================================
 *  QSMH Digital Archive — ตั้งค่าหน้าแรก (แก้ไขไฟล์นี้ไฟล์เดียวพอ)
 * ===================================================================== */
window.QSMH_CONFIG = {

  // 1) ลิงก์ระบบ Google Apps Script (Deploy > Web app > URL ที่ลงท้ายด้วย /exec)
  appUrl: "https://script.google.com/macros/s/AKfycbyniThYuabiqgSys6Rr7TexyulvvP29NOFHDDfRNT_SN6TAp-M35R6xXjJaeb8p0fbF/exec",

  // 2) เปิดระบบแบบไหนเมื่อกด "เข้าสู่ระบบ"
  //    "embed"  = เปิดในแอปเดียวกัน (แนะนำ ทำงานเหมือนแอปจริงเมื่อติดตั้ง)
  //    "newtab" = เปิดแท็บใหม่ของ Google
  openMode: "embed",

  orgName: "โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา",
  orgNameEn: "Queen Savang Vadhana Memorial Hospital",
  ownerDept: "ฝ่ายพัฒนาคุณภาพและบริหารความเสี่ยง",   // หน่วยงานเจ้าของระบบ (แสดงท้ายหน้า)

  // 3) ภาพฝั่งซ้าย: นวัตกรรมการจัดการสิ่งแวดล้อม
  //    ว่างไว้ = ใช้ภาพกราฟิกในตัว | ใส่รูปจริงได้ (แนะนำขนาด 1600x2000 px, .webp/.jpg)
  innovations: [
    // { src: "assets/innovations/solar-roof.webp", title: "หลังคาโซลาร์เซลล์ลดค่าไฟ 18%", tag: "พลังงานสะอาด" },
  ],

  // 4) ภาพฝั่งขวา: ภาพกิจกรรม (สไลด์อัตโนมัติ)
  //    วางไฟล์รูปในโฟลเดอร์ docs/assets/activities/ แล้วเพิ่มรายการด้านล่าง
  //    แนะนำ: แนวตั้ง 1600x2000 px (4:5) ไฟล์ละไม่เกิน 500 KB เพื่อความคมชัดระดับ HD และโหลดเร็ว
  activities: [
    // { src: "assets/activities/2569-big-cleaning.webp", title: "Big Cleaning Day 2569", date: "มี.ค. 2569" },
  ],

  // 5) ตัวเลขเด่นบนหน้าแรก (เว้นว่าง [] เพื่อซ่อน)
  stats: [
    { value: 8,   suffix: "",   label: "ประเภทผลงาน" },
    { value: 90,  suffix: "+",  label: "หน่วยงาน" },
    { value: 100, suffix: "%",  label: "ออนไลน์ ไร้กระดาษ" }
  ],

  // ตัวอย่างสไลด์ที่ใช้ระหว่างยังไม่มีรูปกิจกรรมจริง
  sampleActivities: [
    { icon: "bi-trash3",          title: "Big Cleaning Day",               date: "กิจกรรมตัวอย่าง", hue: 160 },
    { icon: "bi-lightbulb",       title: "มหกรรมคุณภาพ & นวัตกรรม",       date: "กิจกรรมตัวอย่าง", hue: 190 },
    { icon: "bi-recycle",         title: "ประกวดสิ่งประดิษฐ์จากวัสดุเหลือใช้", date: "กิจกรรมตัวอย่าง", hue: 140 },
    { icon: "bi-people",          title: "KM Sharing Day",                 date: "กิจกรรมตัวอย่าง", hue: 210 }
  ]
};
