import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Smartphone,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WhatsAppStatus {
  isConnected: boolean;
  status: "disconnected" | "waiting_qr" | "connecting" | "connected";
  qrCode: string | null;
  simulateMode: boolean;
}

export default function WhatsAppPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: status, isLoading } = useQuery<WhatsAppStatus>({
    queryKey: ["/api/whatsapp/status"],
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const connectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/whatsapp/connect"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      setAutoRefresh(true);
    },
  });

  const refreshQRMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/whatsapp/refresh-qr"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
    },
  });

  const enableSimulationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/whatsapp/enable-simulation"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      setAutoRefresh(false);
    },
  });

  const enableRealMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/whatsapp/enable-real"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      setAutoRefresh(false);
    },
  });

  const forceCleanupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/whatsapp/force-cleanup"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      setAutoRefresh(true);
    },
  });

  useEffect(() => {
    if (status?.status === "connected") {
      setAutoRefresh(false);
    }
  }, [status?.status]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "waiting_qr":
        return "bg-yellow-500";
      case "connecting":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "waiting_qr":
        return "Aguardando QR Code";
      case "connecting":
        return "Conectando...";
      default:
        return "Desconectado";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando status do WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Conexão WhatsApp</h1>
        <p className="text-muted-foreground">
          Configure a conexão com WhatsApp Web para enviar notificações
          automáticas
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Status atual da conexão com WhatsApp Web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(status?.status)}`}
              />
              <Badge variant={status?.isConnected ? "default" : "secondary"}>
                {getStatusText(status?.status)}
              </Badge>
              {status?.simulateMode && (
                <Badge variant="outline">Modo Simulação</Badge>
              )}
            </div>

            {status?.status === "disconnected" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  WhatsApp não está conectado. Clique em "Conectar" para iniciar
                  o processo.
                </AlertDescription>
              </Alert>
            )}

            {status?.status === "connecting" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Inicializando conexão com WhatsApp Web...
                </AlertDescription>
              </Alert>
            )}

            {status?.status === "connected" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  WhatsApp conectado com sucesso! As notificações automáticas
                  estão ativas.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {status?.status === "disconnected" && (
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {connectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Conectar WhatsApp
                </Button>
              )}

              {status?.status === "waiting_qr" && (
                <>
                  <Button
                    onClick={() => refreshQRMutation.mutate()}
                    disabled={refreshQRMutation.isPending}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {refreshQRMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Atualizar QR Code
                  </Button>

                  <Button
                    onClick={() => enableSimulationMutation.mutate()}
                    disabled={enableSimulationMutation.isPending}
                    variant="secondary"
                  >
                    Usar Modo Simulação
                  </Button>
                </>
              )}

              {status?.status === "connected" && status?.simulateMode && (
                <Button
                  onClick={() => enableRealMutation.mutate()}
                  disabled={enableRealMutation.isPending}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  {enableRealMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  Conectar WhatsApp Real
                </Button>
              )}

              {status?.status === "connected" && !status.simulateMode && (
                <Button
                  onClick={() => enableSimulationMutation.mutate()}
                  disabled={enableSimulationMutation.isPending}
                  variant="outline"
                >
                  Voltar ao Modo Simulação
                </Button>
              )}

              {(status?.status === "disconnected" || status?.status === "waiting_qr") && !status?.simulateMode && (
                <Button
                  onClick={() => forceCleanupMutation.mutate()}
                  disabled={forceCleanupMutation.isPending}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  {forceCleanupMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Limpar e Reconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        {status?.status === "waiting_qr" && (
          <Card>
            <CardHeader>
              <CardTitle>Escaneie o QR Code</CardTitle>
              <CardDescription>
                Use seu telefone para escanear o código QR e conectar ao
                WhatsApp Web
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status.qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={status.qrCode}
                      alt="QR Code WhatsApp"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    <p>1. Abra o WhatsApp no seu telefone</p>
                    <p>2. Toque em Menu (⋮) &gt; WhatsApp Web</p>
                    <p>3. Escaneie este código QR</p>
                  </div>
                  {autoRefresh && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Aguardando conexão...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Gerando QR Code...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>
                <strong>Modo Real:</strong> Conecta ao WhatsApp Web real. Requer
                escaneamento de QR code e mantém o navegador aberto.
              </p>
              <p>
                <strong>Modo Simulação:</strong> Simula o envio de mensagens
                para testes. As mensagens aparecem no console do servidor.
              </p>
              <p>
                <strong>Recomendação:</strong> Use o modo simulação para
                desenvolvimento e testes. Use o modo real apenas em produção.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}