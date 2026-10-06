import api from "../lib/axios";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "phone"
  | "textarea"
  | "checkbox"
  | "radio"
  | "select"
  | "file";

export interface FormField {
  id: string; // MongoDB _id
  name: string; // Unique field key (e.g. fullName, cnicNumber, custom_field)
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  section: string;
}

export interface FormSection {
  id: string; // Section name / identifier
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FormData {
  formKey: string;
  title: string;
  subtitle: string;
  sections: FormSection[];
}

// ----------------------------------------------------
// Canonical Section Definitions
// ----------------------------------------------------
export const CANONICAL_SECTIONS = [
  {
    id: "Personal Information",
    title: "Personal Information",
    description: "Please provide your personal information.",
    order: 0,
  },
  {
    id: "Contact Information",
    title: "Contact Information",
    description: "Please provide your contact information.",
    order: 1,
  },
  {
    id: "Course & Campus Details",
    title: "Course & Campus Details",
    description: "Please provide your course and campus preferences.",
    order: 2,
  },
];

// ----------------------------------------------------
// Official Bano Qabil Courses (26 Options from Source)
// ----------------------------------------------------
export const BANO_QABIL_COURSES: string[] = [
  "AI for Everyone",
  "Backend Development with Node.js",
  "CIT & Programming Foundations",
  "Computer Information and Technology (CIT)",
  "Cyber Security Essentials",
  "Data Analytics & Business Intelligence",
  "DevOps Foundations",
  "Digital Content Creation",
  "Digital Forensic and Ethical Hacking",
  "Digital Journalism",
  "Digital Marketing",
  "E-Commerce Development Mastery",
  "E-Commerce Marketplace",
  "Essentials for AI & Prompt Mastery",
  "Freelancing & Tech Sales Mastery",
  "Frontend Web Development",
  "Game Development with Blender",
  "Game Development with Unity",
  "Generative AI",
  "Graphic Designing",
  "Mobile Application Development with Flutter",
  "Social Media Management",
  "SQA & Test Automation",
  "UI/UX Design with Figma",
  "Video Editing & Animations",
  "Web Development with AI",
];

// ----------------------------------------------------
// Official Bano Qabil Campuses (32 Karachi Campuses from Source)
// ----------------------------------------------------
export const BANO_QABIL_CAMPUSES: string[] = [
  "Al Huda Campus (North Karachi - Power House)",
  "Al-Aqsa Campus (Gulshan-e-Iqbal 13D)",
  "Anjuman Complex Campus (Sakhi Hasan)",
  "Askari Degree College (Bahadurabad)",
  "Bahadurabad Campus - Escuela Schooling System",
  "Bahria Town Campus",
  "BanoQabil Shah Latif Town Campus",
  "Clifton Campus",
  "Dr. Mehmood Hussain Campus (Shahfaisal Town)",
  "Etawa Campus (Gulshan-e-Maymar)",
  "Garden Campus",
  "Gulberg Campus",
  "Gulshan-e-Hadeed Campus",
  "Gulshan-e-Iqbal Campus - Circle Social Welfare",
  "HOL Kara Bai Campus (Lyari)",
  "Harmain Campus (P.E.C.H.S-6)",
  "Idara Noor-e-Haq Campus",
  "Jamia Millia School Campus (Shah Faisal)",
  "Jamia Tul Ansar Campus",
  "KMA Protech Institute Campus",
  "Kausar Town Campus (Malir)",
  "Korangi Allah Wala Town Campus",
  "Landhi#6 Campus",
  "Liaquatabad Campus",
  "Metroville Campus",
  "North Karachi Campus - 11L",
  "Orangi Town 11 ½ Campus - Salman Farsi",
  "PIA Society Campus",
  "Pakistan Central Homeopathic Medical College (Nazimabad)",
  "Piston College Campus",
  "SKIT - Keamari Campus",
  "Sherwani Suites Campus",
];

// ----------------------------------------------------
// 14 Default Registration Form Fields (Step 2 Spec)
// ----------------------------------------------------
export const DEFAULT_FORM_FIELDS: Array<{
  section: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder: string;
  required: boolean;
  options: string[];
}> = [
  // STEP 1 — PERSONAL INFORMATION
  {
    section: "Personal Information",
    name: "fullName",
    label: "Full name",
    type: "text",
    placeholder: "e.g. MUHAMMAD ALI",
    required: true,
    options: [],
  },
  {
    section: "Personal Information",
    name: "dateOfBirth",
    label: "Date of birth",
    type: "date",
    placeholder: "",
    required: true,
    options: [],
  },
  {
    section: "Personal Information",
    name: "gender",
    label: "Gender",
    type: "radio",
    placeholder: "",
    required: true,
    options: ["Male", "Female"],
  },
  {
    section: "Personal Information",
    name: "cnicNumber",
    label: "CNIC number",
    type: "text",
    placeholder: "e.g. 42101-1234567-1",
    required: true,
    options: [],
  },
  {
    section: "Personal Information",
    name: "fatherOrGuardianName",
    label: "Father/Guardian name",
    type: "text",
    placeholder: "e.g. ABDUL REHMAN",
    required: true,
    options: [],
  },
  {
    section: "Personal Information",
    name: "aboutYou",
    label: "About yourself",
    type: "textarea",
    placeholder:
      "Briefly introduce yourself, your interests, skills, and goals...",
    required: true,
    options: [],
  },

  // STEP 2 — CONTACT INFORMATION
  {
    section: "Contact Information",
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "e.g. House #, Street, Area, City",
    required: true,
    options: [],
  },
  {
    section: "Contact Information",
    name: "emailAddress",
    label: "Email address",
    type: "email",
    placeholder: "e.g. student@example.com",
    required: true,
    options: [],
  },
  {
    section: "Contact Information",
    name: "phoneNumber",
    label: "Phone number",
    type: "phone",
    placeholder: "300 1234567",
    required: true,
    options: [],
  },
  {
    section: "Contact Information",
    name: "guardianNumber",
    label: "Guardian number",
    type: "phone",
    placeholder: "300 1234567",
    required: false,
    options: [],
  },

  // STEP 3 — COURSE & CAMPUS DETAILS
  {
    section: "Course & Campus Details",
    name: "course",
    label: "Course",
    type: "select",
    placeholder: "Select course",
    required: true,
    options: BANO_QABIL_COURSES,
  },
  {
    section: "Course & Campus Details",
    name: "teacherName",
    label: "Teacher name",
    type: "text",
    placeholder: "e.g. Sir Kashif",
    required: true,
    options: [],
  },
  {
    section: "Course & Campus Details",
    name: "campus",
    label: "Campus",
    type: "select",
    placeholder: "Select Karachi campus",
    required: true,
    options: BANO_QABIL_CAMPUSES,
  },
  {
    section: "Course & Campus Details",
    name: "obtainedMarks",
    label: "Obtained marks",
    type: "number",
    placeholder: "e.g. 85 or 85%",
    required: true,
    options: [],
  },
];

// Fallback initial default form in memory structure
export const initialDefaultForm: FormData = {
  formKey: "internship_registration",
  title: "Registration Form",
  subtitle:
    "Manage the fields and sections used in the internship registration form.",
  sections: CANONICAL_SECTIONS.map((sec) => ({
    id: sec.id,
    title: sec.title,
    description: sec.description,
    order: sec.order,
    fields: DEFAULT_FORM_FIELDS.filter((f) => f.section === sec.title).map(
      (f, idx) => ({
        id: `def_${f.name}`,
        name: f.name,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
        order: idx,
        section: f.section,
      })
    ),
  })),
};

export class FormBuilderRepo {
  private localKey = "ims_form_builder_state";
  private isSeeding = false;

  private saveToLocal(form: FormData) {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(form));
    } catch {
      // Ignore quota errors
    }
  }

  private getFromLocal(): FormData {
    try {
      const saved = localStorage.getItem(this.localKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialDefaultForm;
  }

  // Convert raw backend grouped data into standard FormData
  private transformBackendData(groupedData: Record<string, any[]>): FormData {
    const sectionMap = new Map<string, FormField[]>();

    // Initialize with canonical sections to keep stable ordering
    CANONICAL_SECTIONS.forEach((sec) => {
      sectionMap.set(sec.title, []);
    });

    // Populate fields into their respective sections
    Object.entries(groupedData || {}).forEach(([sectionName, fields]) => {
      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, []);
      }
      const existing = sectionMap.get(sectionName)!;
      fields.forEach((f: any, idx: number) => {
        existing.push({
          id: f._id || f.id || f.name,
          name: f.name || f.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          label: f.label,
          type: (f.type as FieldType) || "text",
          placeholder: f.placeholder || "",
          required: Boolean(f.required),
          options: Array.isArray(f.options) ? f.options : [],
          order: idx,
          section: f.section || sectionName,
        });
      });
    });

    const sections: FormSection[] = [];
    let secOrder = 0;

    // First add canonical sections
    CANONICAL_SECTIONS.forEach((canonical) => {
      const fields = sectionMap.get(canonical.title) || [];
      sections.push({
        id: canonical.title,
        title: canonical.title,
        description: canonical.description,
        order: secOrder++,
        fields,
      });
      sectionMap.delete(canonical.title);
    });

    // Add any remaining custom sections
    sectionMap.forEach((fields, title) => {
      sections.push({
        id: title,
        title,
        description: `Fields configured under ${title}`,
        order: secOrder++,
        fields,
      });
    });

    return {
      formKey: "internship_registration",
      title: "Registration Form",
      subtitle:
        "Manage the fields and sections used in the internship registration form.",
      sections,
    };
  }

  // Safe Seeder: Seed 14 default registration fields into backend if missing
  private async seedDefaultFields(): Promise<void> {
    if (this.isSeeding) return;
    this.isSeeding = true;
    try {
      for (const field of DEFAULT_FORM_FIELDS) {
        try {
          await api.post("/api/form-config", field);
        } catch (err: any) {
          // If already exists (400), ignore and continue
          if (err.response?.status !== 400) {
            console.warn(`Could not seed field ${field.name}:`, err.message);
          }
        }
      }
    } finally {
      this.isSeeding = false;
    }
  }

  // ✅ Fetch Form (Admin)
  async getForm(): Promise<FormData> {
    try {
      const res = await api.get("/api/form-config");
      const grouped = res.data?.data || {};
      const totalFields = Object.values(grouped).reduce(
        (sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      );

      // If backend has 0 fields or only empty groups, automatically seed the 14 default fields
      if (totalFields === 0) {
        await this.seedDefaultFields();
        const refreshed = await api.get("/api/form-config");
        const formatted = this.transformBackendData(refreshed.data?.data || {});
        this.saveToLocal(formatted);
        return formatted;
      }

      // If existing DB records for course or campus have incomplete options (e.g. only 4-5 options from old seed),
      // sync them with the full official options list from the registration form
      let needsRefresh = false;
      const allFields: any[] = Object.values(grouped).flat();
      for (const field of allFields) {
        if (
          field.name === "course" &&
          Array.isArray(field.options) &&
          field.options.length < BANO_QABIL_COURSES.length
        ) {
          try {
            await api.put(`/api/form-config/${field._id}`, {
              options: BANO_QABIL_COURSES,
            });
            needsRefresh = true;
          } catch (e) {
            console.warn("Failed to sync course options:", e);
          }
        }
        if (
          field.name === "campus" &&
          Array.isArray(field.options) &&
          field.options.length < BANO_QABIL_CAMPUSES.length
        ) {
          try {
            await api.put(`/api/form-config/${field._id}`, {
              options: BANO_QABIL_CAMPUSES,
            });
            needsRefresh = true;
          } catch (e) {
            console.warn("Failed to sync campus options:", e);
          }
        }
      }

      if (needsRefresh) {
        const refreshed = await api.get("/api/form-config");
        const formatted = this.transformBackendData(refreshed.data?.data || {});
        this.saveToLocal(formatted);
        return formatted;
      }

      const formatted = this.transformBackendData(grouped);
      this.saveToLocal(formatted);
      return formatted;
    } catch (err) {
      console.warn("Backend /api/form-config error, using cached form:", err);
      return this.getFromLocal();
    }
  }

  // ✅ Fetch Public Form (Candidate Application)
  async getPublicForm(): Promise<FormData> {
    return this.getForm();
  }

  // ✅ Add Field
  async addField(
    sectionId: string,
    field: Omit<FormField, "id" | "order" | "name" | "section"> & {
      name?: string;
    }
  ): Promise<FormData> {
    const baseName =
      field.name ||
      field.label.toLowerCase().replace(/[^a-z0-9]+/g, "_") +
        "_" +
        Math.floor(1000 + Math.random() * 9000);

    try {
      await api.post("/api/form-config", {
        section: sectionId,
        label: field.label,
        name: baseName,
        type: field.type,
        placeholder: field.placeholder || "",
        required: field.required,
        options: field.options || [],
      });
      return await this.getForm();
    } catch (err) {
      console.error("Failed to add field to backend:", err);
      throw err;
    }
  }

  // ✅ Update Field
  async updateField(
    sectionId: string,
    fieldId: string,
    field: Partial<FormField>
  ): Promise<FormData> {
    try {
      await api.put(`/api/form-config/${fieldId}`, {
        section: sectionId,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
      });
      return await this.getForm();
    } catch (err) {
      console.error("Failed to update field on backend:", err);
      throw err;
    }
  }

  // ✅ Delete Field
  async deleteField(_sectionId: string, fieldId: string): Promise<FormData> {
    try {
      await api.delete(`/api/form-config/${fieldId}`);
      return await this.getForm();
    } catch (err) {
      console.error("Failed to delete field on backend:", err);
      throw err;
    }
  }

  // ✅ Reorder Fields
  async reorderFields(
    _sectionId: string,
    _fieldIds: string[]
  ): Promise<FormData> {
    // Return current form since order is preserved in UI
    return this.getFromLocal();
  }

  // ✅ Add Section
  async addSection(title: string, _description?: string): Promise<FormData> {
    const current = await this.getForm();
    if (current.sections.some((s) => s.title.toLowerCase() === title.trim().toLowerCase())) {
      return current;
    }
    const newSection: FormSection = {
      id: title.trim(),
      title: title.trim(),
      description: _description?.trim() || `Fields under ${title.trim()}`,
      order: current.sections.length,
      fields: [],
    };
    const updated: FormData = {
      ...current,
      sections: [...current.sections, newSection],
    };
    this.saveToLocal(updated);
    return updated;
  }

  // ✅ Update Section
  async updateSection(
    sectionId: string,
    title: string,
    _description?: string
  ): Promise<FormData> {
    const current = await this.getForm();
    const section = current.sections.find((s) => s.id === sectionId);
    if (!section) return current;

    // Update all fields in this section to new section name if title changed
    if (section.title !== title.trim()) {
      for (const field of section.fields) {
        try {
          await api.put(`/api/form-config/${field.id}`, {
            section: title.trim(),
          });
        } catch (err) {
          console.warn(`Failed to update section name for field ${field.id}:`, err);
        }
      }
    }
    return await this.getForm();
  }

  // ✅ Delete Section
  async deleteSection(sectionId: string): Promise<FormData> {
    const current = await this.getForm();
    const section = current.sections.find((s) => s.id === sectionId);
    if (!section) return current;

    for (const field of section.fields) {
      try {
        await api.delete(`/api/form-config/${field.id}`);
      } catch (err) {
        console.warn(`Failed to delete field ${field.id}:`, err);
      }
    }
    return await this.getForm();
  }

  // ✅ Reset Form to Default (Seeds all 14 standard fields)
  async resetForm(): Promise<FormData> {
    try {
      const res = await api.get("/api/form-config");
      const grouped = res.data?.data || {};
      const allFields: any[] = Object.values(grouped).flat();

      for (const f of allFields) {
        if (f._id) {
          try {
            await api.delete(`/api/form-config/${f._id}`);
          } catch {
            // Ignore error
          }
        }
      }

      await this.seedDefaultFields();
      return await this.getForm();
    } catch (err) {
      console.error("Failed to reset form on server:", err);
      return this.getFromLocal();
    }
  }

  // ✅ Submit Registration Application
  async submitApplication(formData: Record<string, any>) {
    // Map standard fields expected by backend InternSubmission model
    const payload: Record<string, any> = {
      fullName:
        formData.fullName ||
        formData.name ||
        formData.full_name ||
        formData["Full name"] ||
        formData["Full Name"] ||
        "",
      dateOfBirth:
        formData.dateOfBirth ||
        formData.dob ||
        formData.date_of_birth ||
        formData["Date of birth"] ||
        "",
      gender: formData.gender || formData.Gender || "",
      address: formData.address || formData.Address || "",
      emailAddress:
        formData.emailAddress ||
        formData.email ||
        formData.email_address ||
        formData["Email address"] ||
        "",
      phoneNumber:
        formData.phoneNumber ||
        formData.phone ||
        formData.phone_number ||
        formData["Phone number"] ||
        "",
      guardianNumber:
        formData.guardianNumber ||
        formData.guardian_phone ||
        formData.guardian_number ||
        formData["Guardian number"] ||
        "",
      cnicNumber:
        formData.cnicNumber ||
        formData.cnic ||
        formData.cnic_number ||
        formData["CNIC number"] ||
        "",
      fatherOrGuardianName:
        formData.fatherOrGuardianName ||
        formData.father_name ||
        formData.father_guardian_name ||
        formData["Father/Guardian name"] ||
        "",
      course: formData.course || formData.Course || "",
      teacherName:
        formData.teacherName ||
        formData.teacher ||
        formData.teacher_name ||
        formData["Teacher name"] ||
        "",
      campus: formData.campus || formData.Campus || "",
      obtainedMarks:
        formData.obtainedMarks ||
        formData.marks ||
        formData.obtained_marks ||
        formData["Obtained marks"] ||
        "",
      aboutYou:
        formData.aboutYou ||
        formData.about ||
        formData.about_yourself ||
        formData["About yourself"] ||
        "",
      dynamicData: {},
    };

    const standardKeys = new Set([
      "fullName",
      "name",
      "full_name",
      "Full name",
      "Full Name",
      "dateOfBirth",
      "dob",
      "date_of_birth",
      "Date of birth",
      "gender",
      "Gender",
      "address",
      "Address",
      "emailAddress",
      "email",
      "email_address",
      "Email address",
      "phoneNumber",
      "phone",
      "phone_number",
      "Phone number",
      "guardianNumber",
      "guardian_phone",
      "guardian_number",
      "Guardian number",
      "cnicNumber",
      "cnic",
      "cnic_number",
      "CNIC number",
      "fatherOrGuardianName",
      "father_name",
      "father_guardian_name",
      "Father/Guardian name",
      "course",
      "Course",
      "teacherName",
      "teacher",
      "teacher_name",
      "Teacher name",
      "campus",
      "Campus",
      "obtainedMarks",
      "marks",
      "obtained_marks",
      "Obtained marks",
      "aboutYou",
      "about",
      "about_yourself",
      "About yourself",
    ]);

    // Store custom dynamic fields in dynamicData
    Object.entries(formData).forEach(([key, value]) => {
      if (!standardKeys.has(key)) {
        payload.dynamicData[key] = value;
      }
    });

    const res = await api.post("/api/registration", payload);
    return {
      ...res.data,
      applicationNumber:
        res.data?.data?._id || `APP-${Date.now().toString().slice(-6)}`,
    };
  }
}

export const formBuilderRepo = new FormBuilderRepo();
