import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeModal from "@/components/modals/employee-modal";
import type { Employee } from "@shared/schema";

export default function Employees() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: api.employees.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso",
        description: "Colaborador removido com sucesso!",
      });
      setDeleteEmployee(undefined);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao remover colaborador. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    // Handle timezone properly to prevent date shifting
    const birth = new Date(birthDate + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getNextBirthday = (birthDate: string) => {
    // Handle timezone properly to prevent date shifting
    const birth = new Date(birthDate + 'T00:00:00');
    const today = new Date();
    const thisYear = today.getFullYear();
    
    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: nextBirthday.toLocaleDateString('pt-BR'),
      days: diffDays
    };
  };

  const getDaysText = (days: number) => {
    if (days === 0) return '(hoje)';
    if (days === 1) return '(amanhã)';
    return `(em ${days} dias)`;
  };

  const getDaysColor = (days: number) => {
    if (days === 0) return 'text-red-600';
    if (days === 1) return 'text-orange-600';
    if (days <= 7) return 'text-green-600';
    return 'text-blue-600';
  };

  const filteredEmployees = employees?.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = !positionFilter || positionFilter === "all" || employee.position.toLowerCase().includes(positionFilter.toLowerCase());
    
    let matchesMonth = true;
    if (monthFilter && monthFilter !== "all") {
      const birthMonth = new Date(employee.birthDate + 'T00:00:00').getMonth() + 1;
      matchesMonth = birthMonth.toString() === monthFilter;
    }
    
    return matchesSearch && matchesPosition && matchesMonth;
  });

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(undefined);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeleteEmployee(employee);
  };

  const handleDeleteConfirm = () => {
    if (deleteEmployee) {
      deleteMutation.mutate(deleteEmployee.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            {/* Search bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar colaborador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome do colaborador..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por cargo
                </label>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os cargos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cargos</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="desenvolvedor">Desenvolvedor</SelectItem>
                    <SelectItem value="assistente">Assistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês de aniversário
                </label>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Maio</SelectItem>
                    <SelectItem value="6">Junho</SelectItem>
                    <SelectItem value="7">Julho</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <Button onClick={handleAdd} className="w-full">
                  <i className="fas fa-plus mr-2"></i>
                  Adicionar Colaborador
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg lg:text-xl">Lista de Colaboradores</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Nascimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próximo Aniversário
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees?.map((employee) => {
                    const nextBirthday = getNextBirthday(employee.birthDate);
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {getInitials(employee.name)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              {employee.email && (
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {employee.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(employee.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculateAge(employee.birthDate)} anos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{nextBirthday.date}</span>
                          <span className={`text-xs ml-2 ${getDaysColor(nextBirthday.days)}`}>
                            {getDaysText(nextBirthday.days)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredEmployees?.map((employee) => {
                const nextBirthday = getNextBirthday(employee.birthDate);
                
                return (
                  <div key={employee.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {getInitials(employee.name)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {employee.name}
                            </h3>
                            {employee.email && (
                              <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {employee.position}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2 ml-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Nascimento:</span>
                            <p className="text-gray-900 font-medium">
                              {new Date(employee.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Idade:</span>
                            <p className="text-gray-900 font-medium">{calculateAge(employee.birthDate)} anos</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Próximo aniversário:</span>
                            <p className="text-gray-900 font-medium">
                              {nextBirthday.date}
                              <span className={`ml-2 ${getDaysColor(nextBirthday.days)}`}>
                                {getDaysText(nextBirthday.days)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Empty State */}
          {filteredEmployees?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-users text-4xl mb-4 text-gray-300"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
              <p className="text-sm">Tente ajustar os filtros ou adicione novos colaboradores.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteEmployee?.name}</strong>? 
              Esta ação não pode ser desfeita e todas as mensagens relacionadas também serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
