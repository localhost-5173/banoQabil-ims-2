import { z } from "zod"

export const studentSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    bq_id: z.string().min(5, { message: "BQ ID must be at least 5 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().regex(/^92\d{10}$/, { message: "Phone must start with 92 and contain 12 digits" }),
    CNIC: z.string().regex(/^\d{5}-\d{7}-\d$/, { message: "CNIC must be in xxxxx-xxxxxxx-x format" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }).or(z.literal("")),
    course: z.string().min(1, { message: "Please select a course" }),
    gender: z.string().min(1, { message: "Please select a gender" }),
    shift: z.string().min(1, { message: "Please select a shift" }),
    location: z.string().min(1, { message: "Please select a location" }),
    termsAccepted: z.boolean(),
})

export type StudentFormValues = z.infer<typeof studentSchema>
