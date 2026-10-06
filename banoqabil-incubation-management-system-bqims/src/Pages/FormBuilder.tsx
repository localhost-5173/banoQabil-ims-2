import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UrlBreadcrumb from "@/components/UrlBreadcrumb";
import {
  formBuilderRepo,
  type FormData,
  type FormField,
  type FormSection,
  type FieldType,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  IconPlus,
  IconPencil,
  IconTrash,
  IconGripVertical,
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
  IconEye,
  IconRotateClockwise,
  IconForms,
  IconCheck,
} from "@tabler/icons-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Available field type definitions
const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: "text", label: "Text", description: "Short single-line text" },
  { value: "number", label: "Number", description: "Numeric values" },
  { value: "email", label: "Email", description: "Email address format" },
  { value: "password", label: "Password", description: "Hidden password input" },
  { value: "date", label: "Date", description: "Calendar date picker" },
  { value: "phone", label: "Phone", description: "Phone number input" },
  { value: "textarea", label: "Textarea", description: "Multi-line paragraph text" },
  { value: "checkbox", label: "Checkbox", description: "Multiple option selection" },
  { value: "radio", label: "Radio", description: "Single option radio buttons" },
  { value: "select", label: "Select / Dropdown", description: "Dropdown option selection" },
  { value: "file", label: "File Upload", description: "File attachment" },
];

function getFieldTypeLabel(type: FieldType): string {
  const match = FIELD_TYPES.find((t) => t.value === type);
  return match ? match.label : type;
}

// ----------------------------------------------------
// Sortable Field Item Component
// ----------------------------------------------------
interface SortableFieldItemProps {
  field: FormField;
  sectionId: string;
  index: number;
  totalFields: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableFieldItem({
  field,
  index,
  totalFields,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between rounded-lg border bg-card p-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm ${
        isDragging ? "border-primary bg-accent/50 shadow-md ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing p-1 rounded-md hover:bg-muted/70 transition-colors"
          title="Drag to reorder"
          aria-label={`Drag ${field.label} to reorder`}
        >
          <IconGripVertical className="size-4.5" />
        </button>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm text-foreground truncate">
              {field.label}
            </span>
            {field.required && (
              <span className="text-destructive font-semibold text-xs" title="Required field">
                *
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{getFieldTypeLabel(field.type)}</span>
            <span>•</span>
            <span className={field.required ? "text-primary/90 font-medium" : "text-muted-foreground"}>
              {field.required ? "Required" : "Optional"}
            </span>
            {field.options && field.options.length > 0 && (
              <>
                <span>•</span>
                <span>{field.options.length} options</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Move Up / Down Buttons for accessible reordering */}
        <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move Up"
            aria-label="Move Up"
          >
            <IconArrowUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            onClick={onMoveDown}
            disabled={index === totalFields - 1}
            title="Move Down"
            aria-label="Move Down"
          >
            <IconArrowDown className="size-3.5" />
          </Button>
        </div>

        {/* Edit Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs gap-1 hover:border-primary/50 hover:bg-primary/5"
          onClick={onEdit}
        >
          <IconPencil className="size-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          title="Delete field"
          aria-label={`Delete ${field.label}`}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Main Form Builder Component
// ----------------------------------------------------
export default function FormBuilder() {
  const [form, setForm] = useState<FormData>(initialDefaultForm);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [isDeleteFieldOpen, setIsDeleteFieldOpen] = useState(false);

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [isDeleteSectionOpen, setIsDeleteSectionOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Active item tracking
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [selectedSection, setSelectedSection] = useState<FormSection | null>(null);

  // Add/Edit Field Form State
  const [fieldTargetSectionId, setFieldTargetSectionId] = useState<string>("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldOptions, setFieldOptions] = useState<string[]>([""]);
  const [savingField, setSavingField] = useState(false);

  // Add/Edit Section Form State
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Form Data on mount
  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const data = await formBuilderRepo.getForm();
      setForm(data);
    } catch (err) {
      toast.error("Failed to load registration form configuration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Field Modal Open Handlers
  // ----------------------------------------------------
  const handleOpenAddField = (sectionId?: string) => {
    const target = sectionId || (form.sections[0] ? form.sections[0].id : "");
    setFieldTargetSectionId(target);
    setFieldType("text");
    setFieldLabel("");
    setFieldPlaceholder("");
    setFieldRequired(true);
    setFieldOptions(["Option 1", "Option 2"]);
    setIsAddFieldOpen(true);
  };

  const handleOpenEditField = (sectionId: string, field: FormField) => {
    setSelectedSectionId(sectionId);
    setSelectedField(field);
    setFieldTargetSectionId(sectionId);
    setFieldType(field.type);
    setFieldLabel(field.label);
    setFieldPlaceholder(field.placeholder || "");
    setFieldRequired(field.required);
    setFieldOptions(
      field.options && field.options.length > 0 ? [...field.options] : ["Option 1", "Option 2"]
    );
    setIsEditFieldOpen(true);
  };

  const handleOpenDeleteField = (sectionId: string, field: FormField) => {
    setSelectedSectionId(sectionId);
    setSelectedField(field);
    setIsDeleteFieldOpen(true);
  };

  // ----------------------------------------------------
  // Section Modal Open Handlers
  // ----------------------------------------------------
  const handleOpenAddSection = () => {
    setSectionTitle("");
    setSectionDescription("");
    setIsAddSectionOpen(true);
  };

  const handleOpenEditSection = (section: FormSection) => {
    setSelectedSection(section);
    setSectionTitle(section.title);
    setSectionDescription(section.description || "");
    setIsEditSectionOpen(true);
  };

  const handleOpenDeleteSection = (section: FormSection) => {
    setSelectedSection(section);
    setIsDeleteSectionOpen(true);
  };

  // ----------------------------------------------------
  // Option List Helpers (for Select, Radio, Checkbox)
  // ----------------------------------------------------
  const handleAddOption = () => {
    setFieldOptions([...fieldOptions, `Option ${fieldOptions.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (fieldOptions.length <= 1) {
      toast.warning("At least one option is required");
      return;
    }
    setFieldOptions(fieldOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...fieldOptions];
    updated[index] = val;
    setFieldOptions(updated);
  };

  const isOptionType = (type: FieldType) =>
    ["select", "radio", "checkbox"].includes(type);

  // ----------------------------------------------------
  // Save Add Field
  // ----------------------------------------------------
  const handleSaveAddField = async () => {
    if (!fieldLabel.trim()) {
      toast.error("Please enter a field label");
      return;
    }
    if (!fieldTargetSectionId) {
      toast.error("Please select a target section");
      return;
    }

    if (isOptionType(fieldType)) {
      const validOptions = fieldOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length === 0) {
        toast.error("Please provide at least one option");
        return;
      }
    }

    try {
      setSavingField(true);
      const cleanOptions = isOptionType(fieldType)
        ? fieldOptions.map((o) => o.trim()).filter(Boolean)
        : [];

      const updated = await formBuilderRepo.addField(fieldTargetSectionId, {
        label: fieldLabel.trim(),
        type: fieldType,
        placeholder: fieldPlaceholder.trim(),
        required: fieldRequired,
        options: cleanOptions,
      });

      setForm(updated);
      toast.success(`Field "${fieldLabel}" added successfully`);
      setIsAddFieldOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add field");
      console.error(err);
    } finally {
      setSavingField(false);
    }
  };

  // ----------------------------------------------------
  // Save Edit Field
  // ----------------------------------------------------
  const handleSaveEditField = async () => {
    if (!selectedField || !selectedSectionId) return;

    if (!fieldLabel.trim()) {
      toast.error("Please enter a field label");
      return;
    }

    if (isOptionType(fieldType)) {
      const validOptions = fieldOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length === 0) {
        toast.error("Please provide at least one option");
        return;
      }
    }

    try {
      setSavingField(true);
      const cleanOptions = isOptionType(fieldType)
        ? fieldOptions.map((o) => o.trim()).filter(Boolean)
        : [];

      const updated = await formBuilderRepo.updateField(
        selectedSectionId,
        selectedField.id,
        {
          label: fieldLabel.trim(),
          type: fieldType,
          placeholder: fieldPlaceholder.trim(),
          required: fieldRequired,
          options: cleanOptions,
        }
      );

      setForm(updated);
      toast.success(`Field updated successfully`);
      setIsEditFieldOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update field");
      console.error(err);
    } finally {
      setSavingField(false);
    }
  };

  // ----------------------------------------------------
  // Confirm Delete Field
  // ----------------------------------------------------
  const handleConfirmDeleteField = async () => {
    if (!selectedField || !selectedSectionId) return;

    try {
      const updated = await formBuilderRepo.deleteField(
        selectedSectionId,
        selectedField.id
      );
      setForm(updated);
      toast.success(`Field "${selectedField.label}" deleted`);
      setIsDeleteFieldOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete field");
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Save Add Section
  // ----------------------------------------------------
  const handleSaveAddSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error("Please enter a section title");
      return;
    }

    try {
      setSavingSection(true);
      const updated = await formBuilderRepo.addSection(
        sectionTitle.trim(),
        sectionDescription.trim()
      );
      setForm(updated);
      toast.success(`Section "${sectionTitle}" added`);
      setIsAddSectionOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add section");
      console.error(err);
    } finally {
      setSavingSection(false);
    }
  };

  // ----------------------------------------------------
  // Save Edit Section
  // ----------------------------------------------------
  const handleSaveEditSection = async () => {
    if (!selectedSection) return;
    if (!sectionTitle.trim()) {
      toast.error("Please enter a section title");
      return;
    }

    try {
      setSavingSection(true);
      const updated = await formBuilderRepo.updateSection(
        selectedSection.id,
        sectionTitle.trim(),
        sectionDescription.trim()
      );
      setForm(updated);
      toast.success(`Section updated successfully`);
      setIsEditSectionOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update section");
      console.error(err);
    } finally {
      setSavingSection(false);
    }
  };

  // ----------------------------------------------------
  // Confirm Delete Section
  // ----------------------------------------------------
  const handleConfirmDeleteSection = async () => {
    if (!selectedSection) return;

    try {
      const updated = await formBuilderRepo.deleteSection(selectedSection.id);
      setForm(updated);
      toast.success(`Section "${selectedSection.title}" deleted`);
      setIsDeleteSectionOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete section");
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Reset Form to Default
  // ----------------------------------------------------
  const handleConfirmReset = async () => {
    try {
      const updated = await formBuilderRepo.resetForm();
      setForm(updated);
      toast.success("Form reset to default configuration");
      setIsResetConfirmOpen(false);
    } catch (err) {
      toast.error("Failed to reset form");
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Drag and Drop & Manual Reordering
  // ----------------------------------------------------
  const handleDragEnd = async (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const section = form.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const oldIndex = section.fields.findIndex((f) => f.id === active.id);
    const newIndex = section.fields.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newFields = arrayMove(section.fields, oldIndex, newIndex);
      const updatedForm: FormData = {
        ...form,
        sections: form.sections.map((s) =>
          s.id === sectionId ? { ...s, fields: newFields } : s
        ),
      };
      setForm(updatedForm);

      try {
        await formBuilderRepo.reorderFields(
          sectionId,
          newFields.map((f) => f.id)
        );
      } catch (err) {
        console.error("Failed to persist field order:", err);
      }
    }
  };

  const handleMoveField = async (
    sectionId: string,
    index: number,
    direction: -1 | 1
  ) => {
    const section = form.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= section.fields.length) return;

    const newFields = arrayMove(section.fields, index, targetIndex);
    const updatedForm: FormData = {
      ...form,
      sections: form.sections.map((s) =>
        s.id === sectionId ? { ...s, fields: newFields } : s
      ),
    };
    setForm(updatedForm);

    try {
      await formBuilderRepo.reorderFields(
        sectionId,
        newFields.map((f) => f.id)
      );
    } catch (err) {
      console.error("Failed to persist field order:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <UrlBreadcrumb />
      {/* ==================================================== */}
      {/* 1. Header Section */}
      {/* ==================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <IconForms className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {form.title || "Registration Form"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {form.subtitle ||
                  "Manage the fields and sections used in the internship registration form."}
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Public Preview Button */}
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link to="/register" target="_blank" rel="noopener noreferrer">
              <IconEye className="size-4" />
              <span>Preview Form</span>
            </Link>
          </Button>

          {/* Reset Template Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-foreground"
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reset to default template"
          >
            <IconRotateClockwise className="size-4.5" />
          </Button>

          {/* + Add Section Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAddSection}
            className="gap-1.5"
          >
            <IconPlus className="size-4" />
            <span>Add Section</span>
          </Button>

          {/* + Add Field (Global) */}
          <Button
            size="sm"
            onClick={() => handleOpenAddField()}
            className="gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <IconPlus className="size-4" />
            <span>Add Field</span>
          </Button>
        </div>
      </div>

      {/* Synchronized Notice Banner */}
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            Connected to <strong>Internship Registration</strong>. Changes made here
            are immediately live on the public multi-step registration form.
          </span>
        </div>
        <Link
          to="/register"
          target="_blank"
          className="font-medium text-primary hover:underline underline-offset-2 shrink-0 hidden sm:inline"
        >
          Open Public Form →
        </Link>
      </div>

      {/* ==================================================== */}
      {/* 2. Main Content: THREE CARDS IN ONE ROW on Desktop   */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {form.sections.map((section) => (
          <Card
            key={section.id}
            className="flex flex-col h-full border shadow-xs hover:shadow-sm transition-all"
          >
            {/* Card Header */}
            <CardHeader className="p-4 sm:p-5 border-b space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {section.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0">
                      {section.fields.length} {section.fields.length === 1 ? "Field" : "Fields"}
                    </Badge>
                    {section.description && (
                      <span className="truncate max-w-[180px]" title={section.description}>
                        {section.description}
                      </span>
                    )}
                  </CardDescription>
                </div>

                {/* Section Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <IconDotsVertical className="size-4" />
                      <span className="sr-only">Section options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => handleOpenEditSection(section)}
                      className="cursor-pointer gap-2"
                    >
                      <IconPencil className="size-4 text-muted-foreground" />
                      <span>Edit Section</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleOpenDeleteSection(section)}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <IconTrash className="size-4 text-destructive" />
                      <span>Delete Section</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {/* Card Body: Sortable Fields List */}
            <CardContent className="p-3 sm:p-4 flex-1 space-y-2.5 min-h-[160px]">
              {section.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                  <p className="text-xs">No fields in this section yet.</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-primary mt-1"
                    onClick={() => handleOpenAddField(section.id)}
                  >
                    + Add first field
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(section.id, e)}
                >
                  <SortableContext
                    items={section.fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {section.fields.map((field, idx) => (
                        <SortableFieldItem
                          key={field.id}
                          field={field}
                          sectionId={section.id}
                          index={idx}
                          totalFields={section.fields.length}
                          onMoveUp={() => handleMoveField(section.id, idx, -1)}
                          onMoveDown={() => handleMoveField(section.id, idx, 1)}
                          onEdit={() => handleOpenEditField(section.id, field)}
                          onDelete={() => handleOpenDeleteField(section.id, field)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>

            {/* Card Footer: Section-specific Add Field */}
            <CardFooter className="p-3 border-t bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5 border-dashed hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => handleOpenAddField(section.id)}
              >
                <IconPlus className="size-3.5" />
                <span>Add Field</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* ==================================================== */}
      {/* 3. ADD FIELD MODAL                                   */}
      {/* ==================================================== */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
            <DialogDescription>
              Configure a new field to add to the registration form.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Target Section (if multiple sections exist) */}
            <div className="space-y-1.5">
              <Label htmlFor="field-section">Target Section</Label>
              <Select
                value={fieldTargetSectionId}
                onValueChange={setFieldTargetSectionId}
              >
                <SelectTrigger id="field-section" className="w-full">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {form.sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* FIRST THING: Select Field Type */}
            <div className="space-y-1.5">
              <Label htmlFor="field-type">Select Field Type</Label>
              <Select
                value={fieldType}
                onValueChange={(val) => setFieldType(val as FieldType)}
              >
                <SelectTrigger id="field-type" className="w-full">
                  <SelectValue placeholder="Select Field Type" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        — {t.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field Label */}
            <div className="space-y-1.5">
              <Label htmlFor="field-label">
                Field Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="field-label"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Enter field label (e.g. Full name)"
                autoFocus
              />
            </div>

            {/* Placeholder */}
            {fieldType !== "checkbox" && fieldType !== "radio" && (
              <div className="space-y-1.5">
                <Label htmlFor="field-placeholder">Placeholder</Label>
                <Input
                  id="field-placeholder"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            {/* Required Setting (Segmented Yes/No buttons) */}
            <div className="space-y-1.5">
              <Label>Required</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={fieldRequired ? "default" : "outline"}
                  size="sm"
                  className={fieldRequired ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setFieldRequired(true)}
                >
                  <IconCheck className={`size-4 mr-1 ${fieldRequired ? "opacity-100" : "opacity-0"}`} />
                  Yes (Mandatory)
                </Button>
                <Button
                  type="button"
                  variant={!fieldRequired ? "default" : "outline"}
                  size="sm"
                  className={!fieldRequired ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setFieldRequired(false)}
                >
                  <IconCheck className={`size-4 mr-1 ${!fieldRequired ? "opacity-100" : "opacity-0"}`} />
                  No (Optional)
                </Button>
              </div>
            </div>

            {/* Options configuration for Select, Radio, Checkbox */}
            {isOptionType(fieldType) && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label>Options ({fieldOptions.length})</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary"
                    onClick={handleAddOption}
                  >
                    <IconPlus className="size-3.5 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                  {fieldOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddFieldOpen(false)}
              disabled={savingField}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddField}
              disabled={savingField}
            >
              {savingField ? "Adding..." : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================== */}
      {/* 4. EDIT FIELD MODAL                                  */}
      {/* ==================================================== */}
      <Dialog open={isEditFieldOpen} onOpenChange={setIsEditFieldOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>
              Modify the configuration for this field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Field Type */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-field-type">Field Type</Label>
              <Select
                value={fieldType}
                onValueChange={(val) => setFieldType(val as FieldType)}
              >
                <SelectTrigger id="edit-field-type" className="w-full">
                  <SelectValue placeholder="Select Field Type" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        — {t.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field Label */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-field-label">
                Field Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-field-label"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Enter field label"
              />
            </div>

            {/* Placeholder */}
            {fieldType !== "checkbox" && fieldType !== "radio" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-field-placeholder">Placeholder</Label>
                <Input
                  id="edit-field-placeholder"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            {/* Required Setting */}
            <div className="space-y-1.5">
              <Label>Required</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={fieldRequired ? "default" : "outline"}
                  size="sm"
                  className={fieldRequired ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setFieldRequired(true)}
                >
                  <IconCheck className={`size-4 mr-1 ${fieldRequired ? "opacity-100" : "opacity-0"}`} />
                  Yes (Mandatory)
                </Button>
                <Button
                  type="button"
                  variant={!fieldRequired ? "default" : "outline"}
                  size="sm"
                  className={!fieldRequired ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setFieldRequired(false)}
                >
                  <IconCheck className={`size-4 mr-1 ${!fieldRequired ? "opacity-100" : "opacity-0"}`} />
                  No (Optional)
                </Button>
              </div>
            </div>

            {/* Options configuration for Select, Radio, Checkbox */}
            {isOptionType(fieldType) && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label>Options ({fieldOptions.length})</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary"
                    onClick={handleAddOption}
                  >
                    <IconPlus className="size-3.5 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                  {fieldOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditFieldOpen(false)}
              disabled={savingField}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditField}
              disabled={savingField}
            >
              {savingField ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================== */}
      {/* 5. DELETE FIELD CONFIRMATION MODAL                   */}
      {/* ==================================================== */}
      <AlertDialog open={isDeleteFieldOpen} onOpenChange={setIsDeleteFieldOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{selectedField?.label}"</strong>? This field will no longer
              appear on the internship registration form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteField}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ==================================================== */}
      {/* 6. ADD SECTION MODAL                                 */}
      {/* ==================================================== */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Create a new section/step for the internship registration form.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="section-title">
                Section Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section-title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="e.g. Educational Background"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="section-desc">Description (Optional)</Label>
              <Input
                id="section-desc"
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                placeholder="Brief instructions for this section"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddSectionOpen(false)}
              disabled={savingSection}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddSection}
              disabled={savingSection}
            >
              {savingSection ? "Adding..." : "Add Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================== */}
      {/* 7. EDIT SECTION MODAL                                */}
      {/* ==================================================== */}
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section title and description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-section-title">
                Section Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-section-title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Enter section name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-section-desc">Description (Optional)</Label>
              <Input
                id="edit-section-desc"
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                placeholder="Enter section description"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditSectionOpen(false)}
              disabled={savingSection}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditSection}
              disabled={savingSection}
            >
              {savingSection ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================== */}
      {/* 8. DELETE SECTION CONFIRMATION MODAL                 */}
      {/* ==================================================== */}
      <AlertDialog open={isDeleteSectionOpen} onOpenChange={setIsDeleteSectionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{selectedSection?.title}"</strong> and all its{" "}
              {selectedSection?.fields.length || 0} fields? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ==================================================== */}
      {/* 9. RESET TEMPLATE CONFIRMATION MODAL                 */}
      {/* ==================================================== */}
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the registration form back to the 3 standard sections
              (Personal Information, Contact Information, Course & Campus Details)
              with their initial fields. Any custom modifications will be reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              className="bg-primary text-primary-foreground"
            >
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
