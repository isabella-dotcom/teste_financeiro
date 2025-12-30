import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Download } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState<string>('paid-accounts');
  const [filters, setFilters] = useState<any>({});

  const handleExport = async () => {
    try {
      const endpoint = `/reports/${reportType}?export=true&${new URLSearchParams(filters).toString()}`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 mt-1">Gere relatórios e exporte para Excel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="paid-accounts">Contas Pagas por Banco</option>
              <option value="payable-accounts">Contas a Pagar por Banco</option>
              <option value="receivable-accounts">Contas a Receber por Banco</option>
              <option value="glosas">Glosas por Período</option>
              <option value="cash-flow">Fluxo de Caixa</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input type="date" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input type="date" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
          </div>

          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar para Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

