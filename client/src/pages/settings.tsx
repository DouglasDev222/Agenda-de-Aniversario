import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const [formData, setFormData] = useState({
    reminderTemplate: "",
    birthdayTemplate: "",
    reminderTime: "08:00",
    birthdayTime: "09:00",
    weekendsEnabled: true,
    retryAttempts: 2,
    retryInterval: 5,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: api.settings.get,
  });

  const saveMutation = useMutation({
    mutationFn: api.settings.save,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: api.whatsapp.testConnection,
    onSuccess: (data: any) => {
      if (data.connected) {
        toast({
          title: "Sucesso",
          description: "WhatsApp conectado com sucesso!",
        });
      } else {
        toast({
          title: "Atenção",
          description: "WhatsApp não está conectado. Verifique a conexão.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao testar conexão do WhatsApp.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        reminderTemplate: settings.reminderTemplate || "",
        birthdayTemplate: settings.birthdayTemplate || "",
        reminderTime: settings.reminderTime || "08:00",
        birthdayTime: settings.birthdayTime || "09:00",
        weekendsEnabled: settings.weekendsEnabled ?? true,
        retryAttempts: settings.retryAttempts || 2,
        retryInterval: settings.retryInterval || 5,
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      weekendsEnabled: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Configurações do Sistema</h3>
        <p className="text-sm text-gray-500">Configure as mensagens e horários de envio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Modelos de Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reminderTemplate">
                Mensagem de Lembrete (1 dia antes)
              </Label>
              <Textarea
                id="reminderTemplate"
                name="reminderTemplate"
                value={formData.reminderTemplate}
                onChange={handleInputChange}
                rows={3}
                className="mt-2"
                placeholder="Digite a mensagem de lembrete..."
              />
            </div>
            
            <div>
              <Label htmlFor="birthdayTemplate">
                Mensagem de Aniversário (no dia)
              </Label>
              <Textarea
                id="birthdayTemplate"
                name="birthdayTemplate"
                value={formData.birthdayTemplate}
                onChange={handleInputChange}
                rows={3}
                className="mt-2"
                placeholder="Digite a mensagem de aniversário..."
              />
            </div>
            
            <div className="text-xs text-gray-500">
              <strong>Variáveis disponíveis:</strong> [NOME], [CARGO], [IDADE], [DATA_NASCIMENTO]
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Horário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminderTime">Horário do Lembrete</Label>
                <Input
                  id="reminderTime"
                  name="reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="birthdayTime">Horário do Aniversário</Label>
                <Input
                  id="birthdayTime"
                  name="birthdayTime"
                  type="time"
                  value={formData.birthdayTime}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="weekendsEnabled"
                checked={formData.weekendsEnabled}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="weekendsEnabled">
                Enviar mensagens nos fins de semana
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Status da Conexão</h4>
                <p className="text-sm text-gray-500">WhatsApp Web via Puppeteer</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Conectado
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retryAttempts">Tentativas de Reenvio</Label>
                <Select 
                  value={formData.retryAttempts.toString()} 
                  onValueChange={(value) => handleSelectChange('retryAttempts', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 tentativa</SelectItem>
                    <SelectItem value="2">2 tentativas</SelectItem>
                    <SelectItem value="3">3 tentativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="retryInterval">Intervalo entre Tentativas (minutos)</Label>
                <Input
                  id="retryInterval"
                  name="retryInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.retryInterval}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6"
          >
            {saveMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Salvar Configurações
              </>
            )}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            className="px-6"
          >
            {testConnectionMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Testando...
              </>
            ) : (
              <>
                <i className="fas fa-wifi mr-2"></i>
                Testar Conexão
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
