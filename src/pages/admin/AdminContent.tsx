import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Check, X, MessageSquare, ListOrdered, Clock, Quote, Trophy } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminFaqs,
  useAdminSteps,
  useAdminTimeline,
  useAdminTestimonials,
  useAdminSuccessCases,
  FAQ,
  Step,
  TimelineItem,
  Testimonial,
  SuccessCase,
} from "@/hooks/useSiteContent";

// Generic Edit Form Component
function EditableCard<T extends { id: string; is_active: boolean }>({
  item,
  onSave,
  onDelete,
  onToggleActive,
  children,
  isNew = false,
  onCancel,
}: {
  item: T;
  onSave: (item: T) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  children: (editing: boolean, setField: (key: keyof T, value: any) => void, data: T) => React.ReactNode;
  isNew?: boolean;
  onCancel?: () => void;
}) {
  const [editing, setEditing] = useState(isNew);
  const [data, setData] = useState(item);

  const setField = (key: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(data);
    setEditing(false);
  };

  const handleCancel = () => {
    setData(item);
    setEditing(false);
    onCancel?.();
  };

  return (
    <div className={`bg-card border ${editing ? 'border-primary' : 'border-border'} rounded-lg p-4 transition-all`}>
      <div className="flex items-start gap-3">
        <GripVertical className="text-muted-foreground mt-1 cursor-grab" size={18} />
        <div className="flex-1">{children(editing, setField, data)}</div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              {onToggleActive && (
                <Switch
                  checked={item.is_active}
                  onCheckedChange={(checked) => onToggleActive(item.id, checked)}
                />
              )}
              <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                <Pencil size={16} />
              </Button>
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Check size={16} className="text-green-500" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// FAQs Section
function FAQsSection() {
  const { faqs, createFaq, updateFaq, deleteFaq } = useAdminFaqs();
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (faq: FAQ) => {
    createFaq.mutate(
      { question: faq.question, answer: faq.answer, order_index: (faqs.data?.length || 0) + 1, is_active: true },
      {
        onSuccess: () => {
          toast.success("FAQ creada");
          setShowNew(false);
        },
        onError: () => toast.error("Error al crear FAQ"),
      }
    );
  };

  const handleUpdate = (faq: FAQ) => {
    updateFaq.mutate(faq, {
      onSuccess: () => toast.success("FAQ actualizada"),
      onError: () => toast.error("Error al actualizar"),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar esta FAQ?")) {
      deleteFaq.mutate(id, {
        onSuccess: () => toast.success("FAQ eliminada"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateFaq.mutate({ id, is_active: active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Preguntas Frecuentes</h3>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus size={16} className="mr-2" /> Agregar FAQ
        </Button>
      </div>

      {showNew && (
        <EditableCard
          item={{ id: "new", question: "", answer: "", order_index: 0, is_active: true, created_at: "" } as FAQ}
          onSave={handleCreate}
          isNew
          onCancel={() => setShowNew(false)}
        >
          {(editing, setField, data) => (
            <div className="space-y-3">
              <Input
                placeholder="Pregunta"
                value={data.question}
                onChange={(e) => setField("question", e.target.value)}
              />
              <Textarea
                placeholder="Respuesta"
                value={data.answer}
                onChange={(e) => setField("answer", e.target.value)}
                rows={3}
              />
            </div>
          )}
        </EditableCard>
      )}

      {faqs.isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : faqs.error ? (
        <p className="text-destructive">Error: Las tablas aún no están creadas. Ejecuta las migraciones SQL primero.</p>
      ) : (
        faqs.data?.map((faq) => (
          <EditableCard
            key={faq.id}
            item={faq}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          >
            {(editing, setField, data) =>
              editing ? (
                <div className="space-y-3">
                  <Input value={data.question} onChange={(e) => setField("question", e.target.value)} />
                  <Textarea value={data.answer} onChange={(e) => setField("answer", e.target.value)} rows={3} />
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                </div>
              )
            }
          </EditableCard>
        ))
      )}
    </div>
  );
}

// Steps Section
function StepsSection() {
  const { steps, createStep, updateStep, deleteStep } = useAdminSteps();
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (step: Step) => {
    createStep.mutate(
      { number: step.number, title: step.title, description: step.description, order_index: (steps.data?.length || 0) + 1, is_active: true },
      {
        onSuccess: () => {
          toast.success("Paso creado");
          setShowNew(false);
        },
        onError: () => toast.error("Error al crear paso"),
      }
    );
  };

  const handleUpdate = (step: Step) => {
    updateStep.mutate(step, {
      onSuccess: () => toast.success("Paso actualizado"),
      onError: () => toast.error("Error al actualizar"),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este paso?")) {
      deleteStep.mutate(id, {
        onSuccess: () => toast.success("Paso eliminado"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateStep.mutate({ id, is_active: active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Pasos del Proceso</h3>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus size={16} className="mr-2" /> Agregar Paso
        </Button>
      </div>

      {showNew && (
        <EditableCard
          item={{ id: "new", number: "", title: "", description: "", order_index: 0, is_active: true, created_at: "" } as Step}
          onSave={handleCreate}
          isNew
          onCancel={() => setShowNew(false)}
        >
          {(editing, setField, data) => (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input placeholder="Nº" value={data.number} onChange={(e) => setField("number", e.target.value)} className="w-20" />
                <Input placeholder="Título" value={data.title} onChange={(e) => setField("title", e.target.value)} className="flex-1" />
              </div>
              <Input placeholder="Descripción" value={data.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
          )}
        </EditableCard>
      )}

      {steps.isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : steps.error ? (
        <p className="text-destructive">Error: Las tablas aún no están creadas.</p>
      ) : (
        steps.data?.map((step) => (
          <EditableCard
            key={step.id}
            item={step}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          >
            {(editing, setField, data) =>
              editing ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input value={data.number} onChange={(e) => setField("number", e.target.value)} className="w-20" />
                    <Input value={data.title} onChange={(e) => setField("title", e.target.value)} className="flex-1" />
                  </div>
                  <Input value={data.description} onChange={(e) => setField("description", e.target.value)} />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            }
          </EditableCard>
        ))
      )}
    </div>
  );
}

// Timeline Section
function TimelineSection() {
  const { timeline, createItem, updateItem, deleteItem } = useAdminTimeline();
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (item: TimelineItem) => {
    createItem.mutate(
      { month: item.month, phase: item.phase, title: item.title, description: item.description, order_index: (timeline.data?.length || 0) + 1, is_active: true },
      {
        onSuccess: () => {
          toast.success("Item creado");
          setShowNew(false);
        },
        onError: () => toast.error("Error al crear item"),
      }
    );
  };

  const handleUpdate = (item: TimelineItem) => {
    updateItem.mutate(item, {
      onSuccess: () => toast.success("Item actualizado"),
      onError: () => toast.error("Error al actualizar"),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este item?")) {
      deleteItem.mutate(id, {
        onSuccess: () => toast.success("Item eliminado"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateItem.mutate({ id, is_active: active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Timeline de Construcción</h3>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus size={16} className="mr-2" /> Agregar Item
        </Button>
      </div>

      {showNew && (
        <EditableCard
          item={{ id: "new", month: 1, title: "", description: "", order_index: 0, is_active: true, created_at: "" } as TimelineItem}
          onSave={handleCreate}
          isNew
          onCancel={() => setShowNew(false)}
        >
          {(editing, setField, data) => (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input placeholder="Mes (1-6)" type="number" value={data.month} onChange={(e) => setField("month", parseInt(e.target.value) || 1)} className="w-24" />
                <Input placeholder="Fase (ej: Fase 1)" value={data.phase || ""} onChange={(e) => setField("phase", e.target.value)} className="w-32" />
                <Input placeholder="Título" value={data.title} onChange={(e) => setField("title", e.target.value)} className="flex-1" />
              </div>
              <Input placeholder="Descripción" value={data.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
          )}
        </EditableCard>
      )}

      {timeline.isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : timeline.error ? (
        <p className="text-destructive">Error: Las tablas aún no están creadas.</p>
      ) : (
        timeline.data?.map((item) => (
          <EditableCard
            key={item.id}
            item={item}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          >
            {(editing, setField, data) =>
              editing ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input type="number" value={data.month} onChange={(e) => setField("month", parseInt(e.target.value) || 1)} className="w-24" />
                    <Input value={data.phase || ""} onChange={(e) => setField("phase", e.target.value)} placeholder="Fase" className="w-32" />
                    <Input value={data.title} onChange={(e) => setField("title", e.target.value)} className="flex-1" />
                  </div>
                  <Input value={data.description} onChange={(e) => setField("description", e.target.value)} />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">{item.phase || `Mes ${item.month}`}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              )
            }
          </EditableCard>
        ))
      )}
    </div>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const { testimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useAdminTestimonials();
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (item: Testimonial) => {
    createTestimonial.mutate(
      { quote: item.quote, author: item.author, role: item.role, is_featured: item.is_featured, is_active: true },
      {
        onSuccess: () => {
          toast.success("Testimonio creado");
          setShowNew(false);
        },
        onError: () => toast.error("Error al crear testimonio"),
      }
    );
  };

  const handleUpdate = (item: Testimonial) => {
    updateTestimonial.mutate(item, {
      onSuccess: () => toast.success("Testimonio actualizado"),
      onError: () => toast.error("Error al actualizar"),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este testimonio?")) {
      deleteTestimonial.mutate(id, {
        onSuccess: () => toast.success("Testimonio eliminado"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateTestimonial.mutate({ id, is_active: active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Testimonios</h3>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus size={16} className="mr-2" /> Agregar Testimonio
        </Button>
      </div>

      {showNew && (
        <EditableCard
          item={{ id: "new", quote: "", author: "", role: "", is_featured: false, is_active: true } as Testimonial}
          onSave={handleCreate}
          isNew
          onCancel={() => setShowNew(false)}
        >
          {(editing, setField, data) => (
            <div className="space-y-3">
              <Textarea placeholder="Cita / Testimonio" value={data.quote} onChange={(e) => setField("quote", e.target.value)} rows={3} />
              <div className="flex gap-3">
                <Input placeholder="Autor" value={data.author} onChange={(e) => setField("author", e.target.value)} />
                <Input placeholder="Rol (opcional)" value={data.role || ""} onChange={(e) => setField("role", e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={data.is_featured} onCheckedChange={(checked) => setField("is_featured", checked)} />
                Destacado
              </label>
            </div>
          )}
        </EditableCard>
      )}

      {testimonials.isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : testimonials.error ? (
        <p className="text-destructive">Error: Las tablas aún no están creadas.</p>
      ) : (
        testimonials.data?.map((item) => (
          <EditableCard
            key={item.id}
            item={item}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          >
            {(editing, setField, data) =>
              editing ? (
                <div className="space-y-3">
                  <Textarea value={data.quote} onChange={(e) => setField("quote", e.target.value)} rows={3} />
                  <div className="flex gap-3">
                    <Input value={data.author} onChange={(e) => setField("author", e.target.value)} />
                    <Input value={data.role || ""} onChange={(e) => setField("role", e.target.value)} placeholder="Rol" />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={data.is_featured} onCheckedChange={(checked) => setField("is_featured", checked)} />
                    Destacado
                  </label>
                </div>
              ) : (
                <div>
                  <p className="text-foreground italic">"{item.quote}"</p>
                  <p className="text-sm text-muted-foreground mt-2">— {item.author} {item.role && `(${item.role})`}</p>
                  {item.is_featured && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mt-2 inline-block">Destacado</span>}
                </div>
              )
            }
          </EditableCard>
        ))
      )}
    </div>
  );
}

// Success Cases Section
function SuccessCasesSection() {
  const { successCases, createSuccessCase, updateSuccessCase, deleteSuccessCase } = useAdminSuccessCases();
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (item: SuccessCase) => {
    createSuccessCase.mutate(
      { title: item.title, subtitle: item.subtitle, description: item.description, is_featured: item.is_featured, is_active: true },
      {
        onSuccess: () => {
          toast.success("Caso de éxito creado");
          setShowNew(false);
        },
        onError: () => toast.error("Error al crear caso de éxito"),
      }
    );
  };

  const handleUpdate = (item: SuccessCase) => {
    updateSuccessCase.mutate(item, {
      onSuccess: () => toast.success("Caso de éxito actualizado"),
      onError: () => toast.error("Error al actualizar"),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este caso de éxito?")) {
      deleteSuccessCase.mutate(id, {
        onSuccess: () => toast.success("Caso de éxito eliminado"),
        onError: () => toast.error("Error al eliminar"),
      });
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateSuccessCase.mutate({ id, is_active: active });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Casos de Éxito</h3>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus size={16} className="mr-2" /> Agregar Caso
        </Button>
      </div>

      {showNew && (
        <EditableCard
          item={{ id: "new", title: "", subtitle: "", description: "", is_featured: false, is_active: true } as SuccessCase}
          onSave={handleCreate}
          isNew
          onCancel={() => setShowNew(false)}
        >
          {(editing, setField, data) => (
            <div className="space-y-3">
              <Input placeholder="Título" value={data.title} onChange={(e) => setField("title", e.target.value)} />
              <Input placeholder="Subtítulo" value={data.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
              <Textarea placeholder="Descripción" value={data.description} onChange={(e) => setField("description", e.target.value)} rows={2} />
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={data.is_featured} onCheckedChange={(checked) => setField("is_featured", checked)} />
                Destacado
              </label>
            </div>
          )}
        </EditableCard>
      )}

      {successCases.isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : successCases.error ? (
        <p className="text-destructive">Error: Las tablas aún no están creadas.</p>
      ) : (
        successCases.data?.map((item) => (
          <EditableCard
            key={item.id}
            item={item}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          >
            {(editing, setField, data) =>
              editing ? (
                <div className="space-y-3">
                  <Input value={data.title} onChange={(e) => setField("title", e.target.value)} />
                  <Input value={data.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
                  <Textarea value={data.description} onChange={(e) => setField("description", e.target.value)} rows={2} />
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={data.is_featured} onCheckedChange={(checked) => setField("is_featured", checked)} />
                    Destacado
                  </label>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-primary">{item.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  {item.is_featured && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mt-2 inline-block">Destacado</span>}
                </div>
              )
            }
          </EditableCard>
        ))
      )}
    </div>
  );
}


export default function AdminContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Contenido del Sitio</h1>
          <p className="text-muted-foreground mt-1">Gestiona el contenido dinámico de la página principal</p>
        </div>

        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <MessageSquare size={16} /> FAQs
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex items-center gap-2">
              <ListOrdered size={16} /> Pasos
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock size={16} /> Timeline
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Quote size={16} /> Testimonios
            </TabsTrigger>
            <TabsTrigger value="success" className="flex items-center gap-2">
              <Trophy size={16} /> Casos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="mt-6">
            <FAQsSection />
          </TabsContent>
          <TabsContent value="steps" className="mt-6">
            <StepsSection />
          </TabsContent>
          <TabsContent value="timeline" className="mt-6">
            <TimelineSection />
          </TabsContent>
          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsSection />
          </TabsContent>
          <TabsContent value="success" className="mt-6">
            <SuccessCasesSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
