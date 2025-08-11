import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const [statusFilter, setStatusFilter] = useState("");

  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: api.messages.getAll,
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: api.employees.getAll,
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: api.contacts.getAll,
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

  const testMessageMutation = useMutation({
    mutationFn: () =>
      api.whatsapp.sendTest({
        phoneNumber: "(83) 98760-6350",
        message:
          "🧪 Teste do Sistema de Aniversários\n\nEsta é uma mensagem de teste para verificar se o sistema está funcionando corretamente.",
      }),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Mensagem de teste enviada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description:
          "Falha ao enviar mensagem de teste. Verifique a conexão do WhatsApp.",
        variant: "destructive",
      });
    },
  });

  const getEmployee = (employeeId: string) => {
    return employees?.find((emp) => emp.id === employeeId);
  };

  const getContact = (contactId: string) => {
    return contacts?.find((contact) => contact.id === contactId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-yellow-100 text-yellow-800";
      case "birthday":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reminder":
        return "Lembrete";
      case "birthday":
        return "Aniversário";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <i className="fas fa-check-circle text-green-600"></i>;
      case "scheduled":
        return <i className="fas fa-clock text-blue-600"></i>;
      case "failed":
        return <i className="fas fa-exclamation-triangle text-red-600"></i>;
      default:
        return <i className="fas fa-question-circle text-gray-600"></i>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "scheduled":
        return "Agendado";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMessages = messages?.filter((message) => {
    return (
      !statusFilter || statusFilter === "all" || message.status === statusFilter
    );
  });

  const messageStats = {
    sent: messages?.filter((m) => m.status === "sent").length || 0,
    scheduled: messages?.filter((m) => m.status === "scheduled").length || 0,
    failed: messages?.filter((m) => m.status === "failed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Mensagens
          </h3>
          <p className="text-sm text-gray-500">
            Acompanhe todas as mensagens enviadas e agendadas
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
          >
            {testConnectionMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-wifi mr-2"></i>
            )}
            Teste de Conexão
          </Button>
          <Button
            onClick={() => testMessageMutation.mutate()}
            disabled={testMessageMutation.isPending}
          >
            {testMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-whatsapp mr-2"></i>
            )}
            Enviar Teste
          </Button>
        </div>
      </div>

      {/* Message Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Mensagens Enviadas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messageStats.sent}
                </p>
                <p className="text-xs text-green-600">Total enviadas</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Mensagens Agendadas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messageStats.scheduled}
                </p>
                <p className="text-xs text-blue-600">Aguardando envio</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-blue-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Falhas de Envio
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messageStats.failed}
                </p>
                <p className="text-xs text-red-600">Com erro</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Mensagens</CardTitle>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="scheduled">Agendadas</SelectItem>
                  <SelectItem value="failed">Falharam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinatário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages?.map((message) => {
                  const employee = getEmployee(message.employeeId);
                  const contact = getContact(message.contactId);

                  return (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {employee ? getInitials(employee.name) : "N/A"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {employee?.name || "Colaborador não encontrado"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}
                        >
                          {getTypeLabel(message.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div
                          className="text-sm text-gray-900 truncate"
                          title={message.content}
                        >
                          {message.content.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact?.name || "Contato não encontrado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.sentAt
                          ? formatTimestamp(message.sentAt.toString())
                          : message.scheduledFor
                            ? formatTimestamp(message.scheduledFor.toString())
                            : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}
                        >
                          {getStatusIcon(message.status)}
                          <span className="ml-1">
                            {getStatusLabel(message.status)}
                          </span>
                        </span>
                        {message.errorMessage && (
                          <div
                            className="text-xs text-red-600 mt-1"
                            title={message.errorMessage}
                          >
                            {message.errorMessage.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredMessages?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-message text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="text-sm">
                  {statusFilter
                    ? "Não há mensagens com esse status."
                    : "As mensagens aparecerão aqui quando forem enviadas automaticamente."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
