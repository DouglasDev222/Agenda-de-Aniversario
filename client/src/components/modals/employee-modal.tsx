import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@shared/schema";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee;
}

export default function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  // Format date properly for date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    // Handle timezone offset to prevent date shifting
    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    position: "",
    email: "",
  });

  // Update form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        birthDate: employee.birthDate ? formatDateForInput(employee.birthDate) : "",
        position: employee.position || "",
        email: employee.email || "",
      });
    } else {
      setFormData({
        name: "",
        birthDate: "",
        position: "",
        email: "",
      });
    }
  }, [employee]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!employee;

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return api.employees.update(employee.id, data);
      } else {
        return api.employees.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso",
        description: isEditing 
          ? "Colaborador atualizado com sucesso!"
          : "Colaborador cadastrado com sucesso!",
      });
      onClose();
      // Form will be reset by useEffect when employee prop changes
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar colaborador. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.birthDate || !formData.position.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto my-8 max-h-[85vh] overflow-y-auto sm:mx-4">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Colaborador" : "Adicionar Novo Colaborador"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Maria Silva"
              className="h-11"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento *</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="h-11"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Cargo *</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Ex: Analista de Marketing"
              className="h-11"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@empresa.com"
              className="h-11"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-11 order-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {isEditing ? "Atualizar" : "Adicionar"}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-11 order-2 sm:order-1"
              onClick={onClose}
            >
              <i className="fas fa-times mr-2"></i>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
