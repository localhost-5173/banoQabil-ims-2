import { useEffect, useState, Fragment, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  formBuilderRepo,
  type FormData,
  type FormField,
  type FormSection,
  initialDefaultForm,
} from "@/repositories/formBuilderRepo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import {
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
  IconSend,
  IconEye,
  IconInnerShadowTop,
  IconChevronRight,
} from "@tabler/icons-react";

export default function PublicRegistration() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [form, setForm] = useState<FormData>(initialDefaultForm);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{
    applicationNumber: string;
    submittedAt: string;
  } | null>(null);

  // Load single source of truth form configuration
  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await formBuilderRepo.getPublicForm();
      setForm(data);
    } catch (err) {
      console.error("Failed to load form schema:", err);
      toast.error("Unable to load registration form");
    } finally {
      setLoading(false);
    }
  };

  const currentSection: FormSection | undefined = form.sections[currentStep];
  const totalSteps = form.sections.length;

  const handleInputChange = (
    fieldKey: string,
    value: any,
    fallbackId?: string
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldKey]: value };
      if (fallbackId && fallbackId !== fieldKey) {
        next[fallbackId] = value;
      }
      return next;
    });

    // Clear validation error when user types
    if (errors[fieldKey] || (fallbackId && errors[fallbackId])) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        if (fallbackId) delete copy[fallbackId];
        return copy;
      });
    }
  };

  // CNIC input formatter: 42101-1234567-1
  const handleCnicChange = (
    fieldKey: string,
    rawVal: string,
    fallbackId?: string
  ) => {
    let val = rawVal.replace(/\D/g, "");
    if (val.length > 13) val = val.substring(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12, 13)}`;
    }
    handleInputChange(fieldKey, formatted, fallbackId);
  };

  // Phone input formatter: 300 1234567
  const handlePhoneChange = (
    fieldKey: string,
    rawVal: string,
    fallbackId?: string
  ) => {
    let val = rawVal.replace(/\D/g, "");
    if (val.startsWith("92") && val.length > 10) {
      val = val.substring(2);
    } else if (val.startsWith("0") && val.length > 10) {
      val = val.substring(1);
    }
    if (val.length > 10) val = val.substring(0, 10);
    let formatted = val;
    if (val.length > 3) {
      formatted = `${val.substring(0, 3)} ${val.substring(3)}`;
    }
    handleInputChange(fieldKey, formatted, fallbackId);
  };

  const handleCheckboxChange = (
    fieldKey: string,
    option: string,
    checked: boolean,
    fallbackId?: string
  ) => {
    const existing: string[] = Array.isArray(formData[fieldKey])
      ? formData[fieldKey]
      : [];
    let updated: string[];
    if (checked) {
      updated = [...existing, option];
    } else {
      updated = existing.filter((item) => item !== option);
    }
    handleInputChange(fieldKey, updated, fallbackId);
  };

  // Validate the current step fields
  const validateCurrentStep = (): boolean => {
    if (!currentSection) return true;
    const newErrors: Record<string, string> = {};

    currentSection.fields.forEach((field) => {
      const key = field.name || field.id;
      const val =
        formData[key] !== undefined ? formData[key] : formData[field.id];

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[key] = `${field.label} is required`;
        }
      }

      // Format-specific validations when value is present
      if (val && typeof val === "string" && val.trim().length > 0) {
        if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            newErrors[key] = "Please enter a valid email address";
          }
        } else if (
          field.name === "cnicNumber" ||
          field.name === "cnic" ||
          field.label.toLowerCase().includes("cnic")
        ) {
          const clean = val.replace(/[^0-9]/g, "");
          if (clean.length !== 13) {
            newErrors[key] = "CNIC must contain exactly 13 digits (e.g. 42101-1234567-1)";
          } else if (clean[0] !== "4") {
            newErrors[key] = "CNIC must start with 4 (e.g. 42101-1234567-1)";
          }
        } else if (field.type === "phone") {
          const digits = val.replace(/\D/g, "");
          if (digits.length !== 10) {
            newErrors[key] = "Phone number must contain 10 digits (e.g. 300 1234567)";
          } else if (digits[0] !== "3") {
            newErrors[key] = "Pakistani mobile number must start with 3 (e.g. 300 1234567)";
          }
        } else if (
          field.name === "aboutYou" ||
          field.name === "about" ||
          field.label.toLowerCase().includes("about")
        ) {
          if (val.trim().length < 10) {
            newErrors[key] = "Please enter at least 10 characters.";
          }
        }
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields correctly before proceeding.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    try {
      setSubmitting(true);
      const res = await formBuilderRepo.submitApplication(formData);
      setSubmittedApp({
        applicationNumber:
          res.applicationNumber || `APP-${Date.now().toString().slice(-6)}`,
        submittedAt: new Date().toLocaleString(),
      });
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({});
    setErrors({});
    setCurrentStep(0);
    setSubmittedApp(null);
  };

  // Render individual dynamic field based on field.type
  const renderFieldInput = (field: FormField) => {
    const key = field.name || field.id;
    const value = formData[key] ?? formData[field.id] ?? "";
    const hasError = !!errors[key] || !!errors[field.id];
    const isCnic =
      field.name === "cnicNumber" ||
      field.name === "cnic" ||
      field.label.toLowerCase().includes("cnic");
    const isUppercase =
      field.name === "fullName" ||
      field.name === "name" ||
      field.name === "fatherOrGuardianName" ||
      field.name === "father_name" ||
      field.label.toLowerCase().includes("name");

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={key}
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(key, val, field.id)}
          >
            <SelectTrigger
              id={key}
              className={`w-full ${
                hasError ? "border-destructive focus:ring-destructive" : ""
              }`}
            >
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {field.options && field.options.length > 0 ? (
                field.options.map((opt, i) => (
                  <SelectItem key={i} value={opt}>
                    {opt}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(key, val, field.id)}
            className="flex flex-wrap gap-4 pt-1"
          >
            {field.options && field.options.length > 0 ? (
              field.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${key}-${i}`} />
                  <Label
                    htmlFor={`${key}-${i}`}
                    className="text-sm cursor-pointer font-normal"
                  >
                    {opt}
                  </Label>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No options configured
              </span>
            )}
          </RadioGroup>
        );

      case "checkbox":
        const checkedList: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-4 pt-1">
            {field.options && field.options.length > 0 ? (
              field.options.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-${i}`}
                    checked={checkedList.includes(opt)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        key,
                        opt,
                        Boolean(checked),
                        field.id
                      )
                    }
                  />
                  <Label
                    htmlFor={`${key}-${i}`}
                    className="text-sm cursor-pointer font-normal"
                  >
                    {opt}
                  </Label>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No options configured
              </span>
            )}
          </div>
        );

      case "date":
        return (
          <Input
            id={key}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        );

      case "number":
        return (
          <Input
            id={key}
            type="number"
            value={value}
            min={0}
            step="any"
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        );

      case "email":
        return (
          <Input
            id={key}
            type="email"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            placeholder={field.placeholder || "example@domain.com"}
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        );

      case "phone":
        return (
          <div className="flex items-center relative w-full">
            <span className="absolute left-3 text-sm font-semibold text-muted-foreground pointer-events-none z-10 select-none">
              +92
            </span>
            <Input
              id={key}
              type="tel"
              value={value}
              maxLength={12}
              onChange={(e) => handlePhoneChange(key, e.target.value, field.id)}
              placeholder={field.placeholder || "300 1234567"}
              className={`pl-12 ${
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }`}
            />
          </div>
        );

      case "password":
        return (
          <Input
            id={key}
            type="password"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            placeholder={field.placeholder || "Enter password"}
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        );

      case "file":
        return (
          <Input
            id={key}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleInputChange(key, file ? file.name : "", field.id);
            }}
            className={
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
        );

      case "text":
      default:
        if (isCnic) {
          return (
            <Input
              id={key}
              type="text"
              value={value}
              maxLength={15}
              onChange={(e) => handleCnicChange(key, e.target.value, field.id)}
              placeholder={field.placeholder || "e.g. 42101-1234567-1"}
              className={
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
          );
        }
        return (
          <Input
            id={key}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, field.id)}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            className={`${isUppercase ? "uppercase placeholder:normal-case" : ""} ${
              hasError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  // ====================================================
  // Submission Success Screen
  // ====================================================
  if (submittedApp) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4 sm:p-6">
        <Card className="max-w-md w-full border shadow-md text-center p-6 sm:p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
              <IconCircleCheckFilled className="size-16" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Registration Submitted!
            </h2>
            <p className="text-sm text-muted-foreground">
              Thank you for applying to Bano Qabil. Your internship application
              has been registered in the system.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2 border text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Application ID:</span>
              <span className="font-mono font-bold text-foreground">
                {submittedApp.applicationNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Submitted At:</span>
              <span className="text-foreground text-xs">{submittedApp.submittedAt}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                Pending Review
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleResetForm} variant="outline" className="w-full">
              Submit Another Application
            </Button>
            <Button asChild className="w-full">
              <Link to="/admin/form-builder">
                Return to Admin Panel
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Banner (Admin or Preview Link) */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <IconInnerShadowTop className="size-5 text-primary" />
            <span>BanoQabil IMS</span>
          </Link>
          <div className="flex items-center gap-3">
            {isPreview && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <IconEye className="size-3.5" />
                Live Preview Mode
              </span>
            )}
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admin/form-builder">
                Form Builder Admin →
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Form Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Internship Registration
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Please complete the multi-step form below with your accurate details to apply for the internship program.
          </p>
        </div>

        {/* Step Indicator Header */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {form.sections.map((section, idx) => {
              const isPassed = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <Fragment key={section.id}>
                  <div
                    className={`flex items-center gap-2.5 shrink-0 ${
                      isCurrent
                        ? "text-primary"
                        : isPassed
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        isPassed
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "border-2 border-primary bg-primary/10 text-primary"
                          : "border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {isPassed ? <IconCheck className="size-4" /> : idx + 1}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Step {idx + 1}
                      </div>
                      <div className="text-sm font-semibold truncate max-w-[130px]">
                        {section.title}
                      </div>
                    </div>
                  </div>
                  {idx < form.sections.length - 1 && (
                    <IconChevronRight className="size-4 text-muted-foreground/40 shrink-0 hidden sm:block" />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Card for Current Step */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Step {currentStep + 1} — {currentSection?.title}
                </CardTitle>
                {currentSection?.description && (
                  <CardDescription className="text-xs mt-1">
                    {currentSection.description}
                  </CardDescription>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-5 sm:p-6 space-y-5">
              {currentSection && currentSection.fields.length > 0 ? (
                currentSection.fields.map((field) => {
                  const key = field.name || field.id;
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <Label
                        htmlFor={key}
                        className="flex items-center gap-1 text-sm font-medium"
                      >
                        <span>{field.label}</span>
                        {field.required ? (
                          <span
                            className="text-destructive font-bold"
                            title="Required"
                          >
                            *
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            (Optional)
                          </span>
                        )}
                      </Label>

                      {renderFieldInput(field)}

                      {(errors[key] || errors[field.id]) && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          {errors[key] || errors[field.id]}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No fields defined in this section.
                </div>
              )}
            </CardContent>

            <CardFooter className="p-5 sm:p-6 border-t bg-muted/10 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1.5"
              >
                <IconArrowLeft className="size-4" />
                <span>Previous</span>
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-1.5 bg-primary text-primary-foreground"
                >
                  <span>Next Step</span>
                  <IconArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-1.5 bg-primary text-primary-foreground"
                >
                  <IconSend className="size-4" />
                  <span>{submitting ? "Submitting..." : "Submit Registration"}</span>
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
