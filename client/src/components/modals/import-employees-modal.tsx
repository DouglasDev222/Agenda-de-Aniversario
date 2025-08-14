
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmployeeData {
  nome: string;
  dataDeNascimento: string;
  cargo: string;
  email?: string;
}

export default function ImportEmployeesModal({ isOpen, onClose }: ImportEmployeesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<EmployeeData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (employees: any[]) => {
      const results = [];
      for (const employee of employees) {
        try {
          const result = await api.employees.create(employee);
          results.push({ success: true, data: result, employee });
        } catch (error) {
          results.push({ success: false, error, employee });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      if (successful > 0) {
        toast({
          title: "Importação concluída",
          description: `${successful} colaborador(es) importado(s) com sucesso${failed > 0 ? `. ${failed} falharam.` : '.'}`,
        });
      }
      
      if (failed > 0) {
        const failedNames = results
          .filter(r => !r.success)
          .map(r => r.employee.name)
          .join(", ");
        
        toast({
          title: "Alguns colaboradores falharam",
          description: `Erro ao importar: ${failedNames}`,
          variant: "destructive",
        });
      }
      
      onClose();
      setFile(null);
      setPreviewData([]);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha na importação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    const templateData = [
      {
        "Nome": "João Silva",
        "Data de Nascimento": "1990-01-15",
        "Cargo": "Desenvolvedor",
        "Email": "joao@empresa.com"
      },
      {
        "Nome": "Maria Santos",
        "Data de Nascimento": "1985-06-22",
        "Cargo": "Gerente",
        "Email": "maria@empresa.com"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores");
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 20 }, // Nome
      { wch: 18 }, // Data de Nascimento
      { wch: 15 }, // Cargo
      { wch: 25 }  // Email
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, "modelo_colaboradores.xlsx");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Mapear dados da planilha para o formato esperado
      const mappedData: EmployeeData[] = jsonData.map((row: any) => {
        // Tentar diferentes variações de nomes de colunas
        const nome = row['Nome'] || row['nome'] || row['NOME'] || row['Name'] || '';
        const dataDeNascimento = row['Data de Nascimento'] || row['data de nascimento'] || row['DATA DE NASCIMENTO'] || 
                                 row['Data Nascimento'] || row['Birth Date'] || row['Nascimento'] || '';
        const cargo = row['Cargo'] || row['cargo'] || row['CARGO'] || row['Position'] || row['Posição'] || '';
        const email = row['Email'] || row['email'] || row['EMAIL'] || row['E-mail'] || '';

        return {
          nome: String(nome).trim(),
          dataDeNascimento: formatDate(dataDeNascimento),
          cargo: String(cargo).trim(),
          email: email ? String(email).trim() : undefined
        };
      }).filter(emp => emp.nome && emp.dataDeNascimento && emp.cargo); // Filtrar registros válidos

      setPreviewData(mappedData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo. Verifique se é um arquivo Excel válido.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    
    // Se já está no formato correto (YYYY-MM-DD)
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Se é um número (Excel date serial)
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    // Tentar converter string para data
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      // Ignore error
    }

    // Tentar formatos brasileiros (DD/MM/YYYY)
    if (typeof dateValue === 'string') {
      const match = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    return '';
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum colaborador válido encontrado na planilha.",
        variant: "destructive",
      });
      return;
    }

    // Converter para o formato da API
    const employeesToImport = previewData.map(emp => ({
      name: emp.nome,
      birthDate: emp.dataDeNascimento,
      position: emp.cargo,
      email: emp.email || ""
    }));

    mutation.mutate(employeesToImport);
  };

  const handleClose = () => {
    onClose();
    setFile(null);
    setPreviewData([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto my-8 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Colaboradores por Planilha</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Download Template */}
          <div className="space-y-2">
            <Label>1. Baixar modelo da planilha</Label>
            <p className="text-sm text-gray-600">
              Baixe nosso modelo e preencha com os dados dos colaboradores
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <i className="fas fa-download mr-2"></i>
              Baixar Modelo (Excel)
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">2. Selecionar arquivo Excel</Label>
            <p className="text-sm text-gray-600">
              Aceita arquivos .xlsx e .xls com as colunas: Nome, Data de Nascimento, Cargo e Email (opcional)
            </p>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="h-11"
            />
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Processando arquivo...
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>3. Prévia dos dados ({previewData.length} colaboradores encontrados)</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="px-3 py-2 text-left">Data Nascimento</th>
                      <th className="px-3 py-2 text-left">Cargo</th>
                      <th className="px-3 py-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.slice(0, 10).map((emp, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{emp.nome}</td>
                        <td className="px-3 py-2">
                          {emp.dataDeNascimento ? 
                            new Date(emp.dataDeNascimento + 'T00:00:00').toLocaleDateString('pt-BR') 
                            : 'Data inválida'
                          }
                        </td>
                        <td className="px-3 py-2">{emp.cargo}</td>
                        <td className="px-3 py-2">{emp.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="px-3 py-2 text-center text-gray-500 bg-gray-50">
                    ... e mais {previewData.length - 10} colaboradores
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {previewData.length > 0 && (
              <Button 
                onClick={handleImport} 
                className="flex-1 h-11"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Importando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Importar {previewData.length} Colaboradores
                  </>
                )}
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-11"
              onClick={handleClose}
            >
              <i className="fas fa-times mr-2"></i>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
