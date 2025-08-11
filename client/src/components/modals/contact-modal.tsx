import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
}

export default function ContactModal({ isOpen, onClose, contact }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    isActive: true,
  });

  // Update form data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        phone: contact.phone || "",
        role: contact.role || "",
        isActive: contact.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        role: "",
        isActive: true,
      });
    }
  }, [contact]);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!contact;

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return api.contacts.update(contact.id, data);
      } else {
        return api.contacts.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Sucesso",
        description: isEditing 
          ? "Contato atualizado com sucesso!"
          : "Contato cadastrado com sucesso!",
      });
      onClose();
      // Form will be reset by useEffect when contact prop changes
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar contato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.role.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um telefone no formato (11) 99999-9999.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format phone number as user types
    if (e.target.name === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto my-8 max-h-[85vh] overflow-y-auto sm:mx-4">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contato" : "Adicionar Novo Contato"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Contato *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: João Silva - Gerente"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Número do WhatsApp *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Cargo/Função *</Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Ex: Gerente de RH, Diretor, etc."
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isActive">Contato ativo</Label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
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
                  Salvar
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
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
