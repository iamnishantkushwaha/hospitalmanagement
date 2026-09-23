import {
  PrismaClient,
  UserRole,
  AppointmentStatus,
  LabOrderStatus,
  InvoiceStatus,
  InvoiceSourceType,
  PaymentMethod,
  type Medicine,
  type LabTest,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

const db = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

const DEMO_USERS: { email: string; name: string; role: UserRole }[] = [
  { email: "admin@demo.local", name: "Asha Verma", role: "ADMIN" },
  { email: "reception@demo.local", name: "Ritu Nair", role: "RECEPTIONIST" },
  { email: "doctor@demo.local", name: "Raj Sharma", role: "DOCTOR" },
  { email: "nurse@demo.local", name: "Priya Iyer", role: "NURSE" },
  { email: "lab@demo.local", name: "Karan Mehta", role: "LAB_TECHNICIAN" },
  { email: "pharmacy@demo.local", name: "Neha Kapoor", role: "PHARMACIST" },
  { email: "billing@demo.local", name: "Vikram Singh", role: "BILLING_STAFF" },
];

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "ENT",
  "Dermatology",
  "Emergency",
];

const EXTRA_DOCTORS: {
  name: string;
  email: string;
  department: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  fee: number;
}[] = [
  { name: "Meera Pillai", email: "meera.pillai@sunrise.demo", department: "General Medicine", specialization: "General Physician", qualification: "MBBS, MD", experienceYears: 8, fee: 450 },
  { name: "Arjun Kulkarni", email: "arjun.kulkarni@sunrise.demo", department: "Cardiology", specialization: "Cardiologist", qualification: "MBBS, DM Cardiology", experienceYears: 15, fee: 900 },
  { name: "Sneha Reddy", email: "sneha.reddy@sunrise.demo", department: "Cardiology", specialization: "Interventional Cardiologist", qualification: "MBBS, DM Cardiology", experienceYears: 10, fee: 850 },
  { name: "Vivek Menon", email: "vivek.menon@sunrise.demo", department: "Orthopedics", specialization: "Orthopedic Surgeon", qualification: "MBBS, MS Ortho", experienceYears: 12, fee: 700 },
  { name: "Anjali Desai", email: "anjali.desai@sunrise.demo", department: "Orthopedics", specialization: "Joint Replacement Surgeon", qualification: "MBBS, MS Ortho", experienceYears: 9, fee: 750 },
  { name: "Rohan Bhatt", email: "rohan.bhatt@sunrise.demo", department: "Pediatrics", specialization: "Pediatrician", qualification: "MBBS, MD Pediatrics", experienceYears: 7, fee: 500 },
  { name: "Kavita Joshi", email: "kavita.joshi@sunrise.demo", department: "Pediatrics", specialization: "Neonatologist", qualification: "MBBS, MD Pediatrics", experienceYears: 11, fee: 600 },
  { name: "Divya Krishnan", email: "divya.krishnan@sunrise.demo", department: "Gynecology", specialization: "Gynecologist", qualification: "MBBS, MS OBG", experienceYears: 13, fee: 650 },
  { name: "Nisha Rao", email: "nisha.rao@sunrise.demo", department: "Gynecology", specialization: "Obstetrician", qualification: "MBBS, MS OBG", experienceYears: 6, fee: 550 },
  { name: "Aditya Kapoor", email: "aditya.kapoor@sunrise.demo", department: "ENT", specialization: "ENT Specialist", qualification: "MBBS, MS ENT", experienceYears: 9, fee: 500 },
  { name: "Pooja Malhotra", email: "pooja.malhotra@sunrise.demo", department: "Dermatology", specialization: "Dermatologist", qualification: "MBBS, MD Dermatology", experienceYears: 8, fee: 550 },
  { name: "Suresh Nambiar", email: "suresh.nambiar@sunrise.demo", department: "Emergency", specialization: "Emergency Medicine Physician", qualification: "MBBS, MD Emergency Medicine", experienceYears: 10, fee: 400 },
  { name: "Farah Sheikh", email: "farah.sheikh@sunrise.demo", department: "Emergency", specialization: "Trauma Specialist", qualification: "MBBS, MS", experienceYears: 7, fee: 400 },
];

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan",
  "Ananya", "Diya", "Saanvi", "Aadhya", "Kavya", "Myra", "Anika", "Ira", "Riya", "Meera",
  "Rahul", "Karthik", "Amit", "Sanjay", "Vikram", "Nikhil", "Manish", "Deepak", "Rajesh", "Suresh",
  "Priya", "Neha", "Pooja", "Swati", "Divya", "Shreya", "Nisha", "Kiran", "Asha", "Lakshmi",
  "John", "Peter", "Thomas", "Michael", "David", "Sarah", "Emily", "Grace", "Olivia", "Sophia",
  "Farhan", "Imran", "Zoya", "Ayesha", "Aisha", "Yusuf", "Bilal", "Hina", "Sara", "Fatima",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Patel", "Reddy", "Nair", "Menon", "Iyer",
  "Rao", "Desai", "Joshi", "Malhotra", "Kapoor", "Chatterjee", "Banerjee", "Mukherjee", "Pillai", "Krishnan",
  "Doe", "Fernandes", "D'Souza", "Pinto", "Khan", "Sheikh", "Ansari", "Bhatt", "Nambiar", "Kulkarni",
];

const CITIES = [
  "MG Road, Bengaluru", "Koramangala, Bengaluru", "Indiranagar, Bengaluru", "Whitefield, Bengaluru",
  "HSR Layout, Bengaluru", "Jayanagar, Bengaluru", "Malleshwaram, Bengaluru", "Electronic City, Bengaluru",
];

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const ALLERGIES = [null, null, null, "Penicillin", "Peanuts", "Dust", "Pollen", null];
const CONDITIONS = [null, null, null, "Diabetes Type 2", "Hypertension", "Asthma", null];

const MEDICINES: { name: string; category: string; unit: string; price: number }[] = [
  { name: "Paracetamol 500mg", category: "Analgesic", unit: "tablet", price: 2 },
  { name: "Ibuprofen 400mg", category: "NSAID", unit: "tablet", price: 3 },
  { name: "Amoxicillin 500mg", category: "Antibiotic", unit: "capsule", price: 8 },
  { name: "Azithromycin 500mg", category: "Antibiotic", unit: "tablet", price: 15 },
  { name: "Cetirizine 10mg", category: "Antihistamine", unit: "tablet", price: 2 },
  { name: "Omeprazole 20mg", category: "Antacid", unit: "capsule", price: 5 },
  { name: "Metformin 500mg", category: "Antidiabetic", unit: "tablet", price: 3 },
  { name: "Amlodipine 5mg", category: "Antihypertensive", unit: "tablet", price: 4 },
  { name: "Atorvastatin 10mg", category: "Statin", unit: "tablet", price: 6 },
  { name: "Cough Syrup", category: "Respiratory", unit: "bottle", price: 60 },
  { name: "ORS Sachet", category: "Electrolyte", unit: "sachet", price: 12 },
  { name: "Vitamin D3 60K", category: "Supplement", unit: "capsule", price: 20 },
  { name: "Vitamin B12", category: "Supplement", unit: "tablet", price: 10 },
  { name: "Multivitamin", category: "Supplement", unit: "tablet", price: 5 },
  { name: "Pantoprazole 40mg", category: "Antacid", unit: "tablet", price: 6 },
  { name: "Salbutamol Inhaler", category: "Respiratory", unit: "inhaler", price: 150 },
  { name: "Diclofenac Gel", category: "Topical", unit: "tube", price: 45 },
  { name: "Ondansetron 4mg", category: "Antiemetic", unit: "tablet", price: 7 },
  { name: "Losartan 50mg", category: "Antihypertensive", unit: "tablet", price: 5 },
  { name: "Insulin Glargine", category: "Antidiabetic", unit: "vial", price: 350 },
  { name: "Ferrous Sulfate", category: "Supplement", unit: "tablet", price: 2 },
  { name: "Calcium + Vitamin D", category: "Supplement", unit: "tablet", price: 4 },
  { name: "Ranitidine 150mg", category: "Antacid", unit: "tablet", price: 3 },
  { name: "Doxycycline 100mg", category: "Antibiotic", unit: "capsule", price: 9 },
];

const LAB_TESTS: { name: string; category: string; price: number; normalRange: string; unit: string }[] = [
  { name: "Complete Blood Count (CBC)", category: "Hematology", price: 350, normalRange: "4000-11000", unit: "/uL" },
  { name: "Blood Sugar Fasting", category: "Biochemistry", price: 120, normalRange: "70-100", unit: "mg/dL" },
  { name: "Blood Sugar Postprandial", category: "Biochemistry", price: 120, normalRange: "70-140", unit: "mg/dL" },
  { name: "HbA1c", category: "Biochemistry", price: 550, normalRange: "4-5.6", unit: "%" },
  { name: "Lipid Profile", category: "Biochemistry", price: 600, normalRange: "<200", unit: "mg/dL" },
  { name: "Liver Function Test (LFT)", category: "Biochemistry", price: 700, normalRange: "varies", unit: "U/L" },
  { name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 650, normalRange: "varies", unit: "mg/dL" },
  { name: "Thyroid Profile (T3 T4 TSH)", category: "Endocrinology", price: 800, normalRange: "0.4-4.0", unit: "mIU/L" },
  { name: "Urine Routine", category: "Pathology", price: 150, normalRange: "normal", unit: "-" },
  { name: "ECG", category: "Cardiology", price: 300, normalRange: "normal sinus rhythm", unit: "-" },
  { name: "X-Ray Chest", category: "Radiology", price: 400, normalRange: "normal", unit: "-" },
  { name: "Widal Test", category: "Serology", price: 250, normalRange: "negative", unit: "titre" },
  { name: "Dengue NS1 Antigen", category: "Serology", price: 500, normalRange: "negative", unit: "-" },
  { name: "Malaria Antigen", category: "Serology", price: 350, normalRange: "negative", unit: "-" },
  { name: "Vitamin D", category: "Biochemistry", price: 1200, normalRange: "30-100", unit: "ng/mL" },
  { name: "Vitamin B12", category: "Biochemistry", price: 900, normalRange: "200-900", unit: "pg/mL" },
  { name: "ESR", category: "Hematology", price: 150, normalRange: "0-20", unit: "mm/hr" },
  { name: "CRP", category: "Biochemistry", price: 450, normalRange: "<5", unit: "mg/L" },
];

const CHIEF_COMPLAINTS = [
  "Fever and body ache for 3 days",
  "Persistent cough and cold",
  "Chest pain on exertion",
  "Joint pain in knees",
  "Headache and dizziness",
  "Abdominal pain and nausea",
  "Skin rash and itching",
  "Routine health checkup",
  "Follow-up for diabetes management",
  "Shortness of breath",
  "Back pain",
  "Sore throat and ear pain",
];

const DIAGNOSES = [
  "Viral fever",
  "Upper respiratory tract infection",
  "Hypertension",
  "Type 2 Diabetes Mellitus",
  "Osteoarthritis - knee",
  "Migraine",
  "Gastritis",
  "Allergic dermatitis",
  "Anemia",
  "Bronchial asthma",
  "Lower back strain",
  "Acute pharyngitis",
];

const TIME_SLOTS = ["09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00", "11:00-11:30", "14:00-14:30", "14:30-15:00", "15:00-15:30", "16:00-16:30", "16:30-17:00"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function pad(n: number, len = 6) {
  return String(n).padStart(len, "0");
}

async function main() {
  console.log("Seeding Sunrise Multispeciality Hospital demo data...");

  const hospital = await db.hospital.upsert({
    where: { id: "sunrise-hospital" },
    update: {},
    create: {
      id: "sunrise-hospital",
      name: "Sunrise Multispeciality Hospital",
      address: "12 MG Road, Bengaluru, Karnataka",
      phone: "+91 80 4000 1234",
      email: "info@sunrisehospital.demo",
    },
  });

  const departments = await Promise.all(
    DEPARTMENTS.map((name) =>
      db.department.upsert({
        where: { id: `dept-${name.toLowerCase().replace(/\s+/g, "-")}` },
        update: {},
        create: { id: `dept-${name.toLowerCase().replace(/\s+/g, "-")}`, hospitalId: hospital.id, name },
      })
    )
  );
  const deptByName = new Map(departments.map((d) => [d.name, d]));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const staffAccounts = new Map<string, { id: string; name: string; role: UserRole }>();
  for (const demoUser of DEMO_USERS) {
    const user = await db.user.upsert({
      where: { email: demoUser.email },
      update: { name: demoUser.name, role: demoUser.role, passwordHash },
      create: { email: demoUser.email, name: demoUser.name, role: demoUser.role, passwordHash },
    });
    staffAccounts.set(demoUser.email, user);

    if (demoUser.role !== "DOCTOR" && demoUser.role !== "ADMIN") {
      await db.staff.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, designation: demoUser.role.replace("_", " ") },
      });
    }
  }

  const patientUser = await db.user.upsert({
    where: { email: "patient@demo.local" },
    update: { name: "John Doe", role: "PATIENT", passwordHash },
    create: { email: "patient@demo.local", name: "John Doe", role: "PATIENT", passwordHash },
  });

  const rajSharmaUser = staffAccounts.get("doctor@demo.local")!;
  const rajSharma = await db.doctor.upsert({
    where: { userId: rajSharmaUser.id },
    update: {},
    create: {
      userId: rajSharmaUser.id,
      departmentId: deptByName.get("General Medicine")!.id,
      specialization: "General Physician",
      qualification: "MBBS, MD",
      experienceYears: 12,
      consultationFee: 500,
      workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
      slotStartTime: "09:00",
      slotEndTime: "17:00",
    },
  });

  const doctors = [rajSharma];
  for (const def of EXTRA_DOCTORS) {
    const user = await db.user.upsert({
      where: { email: def.email },
      update: { name: def.name, role: "DOCTOR", passwordHash },
      create: { email: def.email, name: def.name, role: "DOCTOR", passwordHash },
    });
    const doctor = await db.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        departmentId: deptByName.get(def.department)!.id,
        specialization: def.specialization,
        qualification: def.qualification,
        experienceYears: def.experienceYears,
        consultationFee: def.fee,
        workingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        slotStartTime: "09:00",
        slotEndTime: "18:00",
      },
    });
    doctors.push(doctor);
  }
  console.log(`Doctors: ${doctors.length}`);

  const PATIENT_COUNT = 60;
  const patients = [];
  for (let i = 0; i < PATIENT_COUNT; i++) {
    const firstName = pick(FIRST_NAMES, i);
    const lastName = pick(LAST_NAMES, i * 3 + 1);
    const age = 5 + ((i * 7) % 80);
    const dob = new Date(new Date().getFullYear() - age, i % 12, 1 + (i % 27));
    const patient = await db.patient.upsert({
      where: { mrn: `PAT-${pad(i + 1)}` },
      update: {},
      create: {
        mrn: `PAT-${pad(i + 1)}`,
        firstName,
        lastName,
        dateOfBirth: dob,
        gender: i % 5 === 0 ? "OTHER" : i % 2 === 0 ? "MALE" : "FEMALE",
        bloodGroup: pick(BLOOD_GROUPS, i),
        phone: `98${pad(10000000 + i * 137, 8)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.demo`,
        address: pick(CITIES, i),
        allergies: pick(ALLERGIES, i) ?? undefined,
        existingConditions: pick(CONDITIONS, i + 2) ?? undefined,
      },
    });
    patients.push(patient);
  }

  const johnDoe = await db.patient.upsert({
    where: { mrn: "PAT-000000" },
    update: { userId: patientUser.id },
    create: {
      mrn: "PAT-000000",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date(1990, 4, 12),
      gender: "MALE",
      bloodGroup: "O+",
      phone: "9876500000",
      email: "john.doe@example.demo",
      address: "221B MG Road, Bengaluru",
      userId: patientUser.id,
    },
  });
  patients.unshift(johnDoe);
  console.log(`Patients: ${patients.length}`);

  const medicines: Medicine[] = [];
  for (const def of MEDICINES) {
    const medicine = await db.medicine.create({ data: { name: def.name, category: def.category, unit: def.unit, price: def.price } });
    medicines.push(medicine);
  }
  for (let i = 0; i < medicines.length; i++) {
    const lowStock = i % 6 === 0;
    await db.medicineBatch.create({
      data: {
        medicineId: medicines[i].id,
        batchNo: `BATCH-${pad(i + 1, 4)}`,
        expiryDate: addDays(new Date(), 180 + i * 5),
        quantity: lowStock ? 3 + (i % 5) : 100 + i * 10,
      },
    });
  }
  console.log(`Medicines: ${medicines.length}`);

  const labTests: LabTest[] = [];
  for (const def of LAB_TESTS) {
    const test = await db.labTest.create({ data: def });
    labTests.push(test);
  }
  console.log(`Lab tests: ${labTests.length}`);

  const WARD_DEFS = [
    { name: "General Ward", type: "General", rooms: 5, bedsPerRoom: 4 },
    { name: "ICU", type: "Critical Care", rooms: 3, bedsPerRoom: 2 },
    { name: "Maternity Ward", type: "Maternity", rooms: 3, bedsPerRoom: 2 },
    { name: "Private Ward", type: "Private", rooms: 4, bedsPerRoom: 1 },
  ];
  const allBeds = [];
  for (const wardDef of WARD_DEFS) {
    const ward = await db.ward.create({ data: { hospitalId: hospital.id, name: wardDef.name, type: wardDef.type } });
    for (let r = 1; r <= wardDef.rooms; r++) {
      const room = await db.room.create({ data: { wardId: ward.id, roomNo: `${wardDef.name.slice(0, 1)}${r}`, type: wardDef.type } });
      for (let b = 1; b <= wardDef.bedsPerRoom; b++) {
        const bed = await db.bed.create({ data: { roomId: room.id, bedNo: `${room.roomNo}-B${b}`, status: "AVAILABLE" } });
        allBeds.push(bed);
      }
    }
  }
  console.log(`Beds: ${allBeds.length}`);

  const today = startOfDay(new Date());
  const APPOINTMENT_COUNT = 80;
  let apptCounter = 0;
  let labOrderCounter = 0;
  let invoiceCounter = 0;
  let admissionCounter = 0;

  function nextApptNo() {
    apptCounter += 1;
    return `APT-${pad(apptCounter)}`;
  }
  function nextLabOrderNo() {
    labOrderCounter += 1;
    return `LAB-${pad(labOrderCounter)}`;
  }
  function nextInvoiceNo() {
    invoiceCounter += 1;
    return `INV-${pad(invoiceCounter)}`;
  }
  function nextAdmissionNo() {
    admissionCounter += 1;
    return `ADM-${pad(admissionCounter)}`;
  }

  async function createInvoiceForConsultation(opts: {
    patientId: string;
    items: { sourceType: InvoiceSourceType; description: string; quantity: number; unitPrice: number; labOrderId?: string }[];
    paid: boolean;
    partial?: boolean;
  }) {
    const subtotal = opts.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = subtotal > 1000 ? 100 : 0;
    const total = subtotal - discount;
    const status: InvoiceStatus = opts.paid ? "PAID" : opts.partial ? "PARTIALLY_PAID" : "PENDING";

    const invoice = await db.invoice.create({
      data: {
        invoiceNo: nextInvoiceNo(),
        patientId: opts.patientId,
        status,
        subtotalAmt: subtotal,
        discountAmt: discount,
        taxAmt: 0,
        totalAmt: total,
        items: {
          create: opts.items.map((item) => ({
            sourceType: item.sourceType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            labOrderId: item.labOrderId,
          })),
        },
      },
    });

    if (opts.paid) {
      await db.payment.create({
        data: { invoiceId: invoice.id, amount: total, method: ([PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI])[total % 3], receivedById: staffAccounts.get("billing@demo.local")!.id },
      });
    } else if (opts.partial) {
      await db.payment.create({
        data: { invoiceId: invoice.id, amount: Math.round(total / 2), method: "CASH", receivedById: staffAccounts.get("billing@demo.local")!.id },
      });
    }
    return invoice;
  }

  for (let i = 0; i < APPOINTMENT_COUNT; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const dayOffset = i % 30 === 0 ? 0 : (i % 40) - 25;
    const scheduledDate = setMinutes(setHours(addDays(today, dayOffset), 9 + (i % 8)), (i % 2) * 30);
    const timeSlot = pick(TIME_SLOTS, i);

    let status: AppointmentStatus;
    if (dayOffset < 0) {
      status = i % 11 === 0 ? "NO_SHOW" : i % 13 === 0 ? "CANCELLED" : "COMPLETED";
    } else if (dayOffset === 0) {
      status = (["SCHEDULED", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED"] as const)[i % 4];
    } else {
      status = i % 9 === 0 ? "CANCELLED" : "SCHEDULED";
    }

    const appointment = await db.appointment.create({
      data: {
        appointmentNo: nextApptNo(),
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        scheduledDate,
        timeSlot,
        status,
        reason: pick(CHIEF_COMPLAINTS, i),
      },
    });

    if (status !== "COMPLETED") continue;

    const consultation = await db.consultation.create({
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id,
        chiefComplaint: pick(CHIEF_COMPLAINTS, i),
        clinicalNotes: "Patient examined. Vitals stable. Advised medication and follow-up as needed.",
        followUpDate: i % 3 === 0 ? addDays(scheduledDate, 14) : null,
      },
    });

    await db.vital.create({
      data: {
        consultationId: consultation.id,
        temperatureC: 36.5 + (i % 5) * 0.3,
        bloodPressure: `${110 + (i % 20)}/${70 + (i % 10)}`,
        pulseBpm: 65 + (i % 25),
        respRate: 14 + (i % 6),
        weightKg: 50 + (i % 40),
        heightCm: 150 + (i % 40),
        spo2: 95 + (i % 5),
      },
    });

    await db.diagnosis.create({
      data: { consultationId: consultation.id, description: pick(DIAGNOSES, i) },
    });

    const itemCount = 1 + (i % 3);
    const prescriptionItemsData = Array.from({ length: itemCount }, (_, k) => {
      const medicine = pick(medicines, i + k * 5);
      return {
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: "1 tablet",
        frequency: ["OD", "BD", "TDS"][k % 3],
        durationDays: [3, 5, 7, 10][k % 4],
        instructions: "After food",
        isDispensed: i % 4 !== 0,
      };
    });
    const prescription = await db.prescription.create({
      data: {
        consultationId: consultation.id,
        patientId: patient.id,
        doctorId: doctor.id,
        notes: "Take medicines as prescribed. Return if symptoms persist.",
        items: { create: prescriptionItemsData },
      },
      include: { items: true },
    });

    let pharmacyAmount = 0;
    for (const item of prescription.items) {
      const medicine = medicines.find((m) => m.id === item.medicineId)!;
      pharmacyAmount += Number(medicine.price) * 10;
      if (item.isDispensed) {
        const batch = await db.medicineBatch.findFirst({ where: { medicineId: medicine.id } });
        if (batch) {
          await db.pharmacyTransaction.create({
            data: {
              prescriptionItemId: item.id,
              medicineBatchId: batch.id,
              quantity: 10,
              dispensedById: staffAccounts.get("pharmacy@demo.local")!.id,
            },
          });
        }
      }
    }

    let labOrderId: string | undefined;
    let labAmount = 0;
    const needsLab = i % 5 !== 4;
    if (needsLab) {
      const testCount = 1 + (i % 2);
      const tests = Array.from({ length: testCount }, (_, k) => pick(labTests, i + k * 3));
      const labStatus: LabOrderStatus = i % 6 === 0 ? "PROCESSING" : i % 4 === 0 ? "SAMPLE_COLLECTED" : "VERIFIED";
      const labOrder = await db.labOrder.create({
        data: {
          orderNo: nextLabOrderNo(),
          patientId: patient.id,
          doctorId: doctor.id,
          consultationId: consultation.id,
          status: labStatus,
          orderedAt: scheduledDate,
        },
      });
      labOrderId = labOrder.id;
      for (const test of tests) {
        labAmount += Number(test.price);
        const orderItem = await db.labOrderItem.create({ data: { labOrderId: labOrder.id, labTestId: test.id } });
        if (labStatus === "VERIFIED") {
          await db.labResult.create({
            data: {
              labOrderItemId: orderItem.id,
              resultValue: "Within normal limits",
              isNormal: true,
              verifiedById: staffAccounts.get("lab@demo.local")!.id,
              verifiedAt: addDays(scheduledDate, 1),
            },
          });
        }
      }
    }

    const consultationFee = Number(doctor.consultationFee);
    const invoiceItems: { sourceType: InvoiceSourceType; description: string; quantity: number; unitPrice: number; labOrderId?: string }[] = [
      { sourceType: "CONSULTATION", description: `Consultation - Dr. ${doctor.id === rajSharma.id ? "Raj Sharma" : "Specialist"}`, quantity: 1, unitPrice: consultationFee },
    ];
    if (labAmount > 0) invoiceItems.push({ sourceType: "LAB", description: "Laboratory tests", quantity: 1, unitPrice: labAmount, labOrderId });
    if (pharmacyAmount > 0) invoiceItems.push({ sourceType: "PHARMACY", description: "Pharmacy - dispensed medicines", quantity: 1, unitPrice: pharmacyAmount });

    await createInvoiceForConsultation({
      patientId: patient.id,
      items: invoiceItems,
      paid: i % 3 !== 0,
      partial: i % 3 === 0 && i % 2 === 0,
    });
  }
  console.log(`Appointments: ${apptCounter}, Lab orders: ${labOrderCounter}, Invoices so far: ${invoiceCounter}`);

  const ADMISSION_COUNT = 10;
  for (let i = 0; i < ADMISSION_COUNT; i++) {
    const patient = patients[(i * 5 + 3) % patients.length];
    const doctor = doctors[i % doctors.length];
    const bed = allBeds[i];
    const active = i % 3 !== 0;
    const admissionDate = addDays(today, -(3 + i));
    const dailyCharge = 1500 + i * 200;

    const admission = await db.admission.create({
      data: {
        admissionNo: nextAdmissionNo(),
        patientId: patient.id,
        doctorId: doctor.id,
        bedId: bed.id,
        admissionDate,
        reason: pick(CHIEF_COMPLAINTS, i + 4),
        status: active ? "ADMITTED" : "DISCHARGED",
        dailyChargeAmt: dailyCharge,
      },
    });

    await db.bed.update({ where: { id: bed.id }, data: { status: active ? "OCCUPIED" : "AVAILABLE" } });

    const days = 2 + (i % 4);
    if (!active) {
      await db.discharge.create({
        data: {
          admissionId: admission.id,
          dischargeDate: addDays(admissionDate, days),
          summary: "Patient recovered well and was discharged in stable condition.",
        },
      });
    }

    await createInvoiceForConsultation({
      patientId: patient.id,
      items: [{ sourceType: "ROOM", description: `Room charges (${days} days)`, quantity: days, unitPrice: dailyCharge }],
      paid: !active,
      partial: active,
    });
  }
  console.log(`Admissions: ${ADMISSION_COUNT}`);
  console.log(`Beds set to MAINTENANCE: 2`);
  await db.bed.update({ where: { id: allBeds[allBeds.length - 1].id }, data: { status: "MAINTENANCE" } });
  await db.bed.update({ where: { id: allBeds[allBeds.length - 2].id }, data: { status: "MAINTENANCE" } });

  console.log("Seed complete.");
  console.log("Demo login password for every account:", DEMO_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
