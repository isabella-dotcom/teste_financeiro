import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function AccountsPayable() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [gsiItems, setGsiItems] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, banksRes, gsiRes, personsRes] = await Promise.all([
        api.get('/accounts-payable'),
        api.get('/banks'),
        api.get('/gsi/items'),
        api.get('/persons?tipo=FORNECEDOR'),
      ]);
      setAccounts(accountsRes.data);
      setBanks(banksRes.data);
      setGsiItems(gsiRes.data);
      setPersons(personsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.patch(`/accounts-payable/${formData.id}`, formData);
      } else {
        await api.post('/accounts-payable', formData);
      }
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/accounts-payable/${selectedAccount.id}/pay`, formData);
      setShowPayModal(false);
      setSelectedAccount(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Erro ao dar baixa:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-gray-500 mt-1">Gerencie as contas a pagar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {/* upload */}}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.descricao}</TableCell>
                  <TableCell>{account.person?.nome}</TableCell>
                  <TableCell>R$ {Number(account.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{format(new Date(account.dataVencimento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                      account.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {account.status === 'ABERTO' && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedAccount(account);
                        setShowPayModal(true);
                      }}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Adicionar Conta a Pagar</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>GSI Item</Label>
                    <Select value={formData.gsiItemId || ''} onChange={(e) => setFormData({ ...formData, gsiItemId: e.target.value })} required>
                      <option value="">Selecione</option>
                      {gsiItems.map((item) => (
                        <option key={item.id} value={item.id}>{item.codigo} - {item.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Banco</Label>
                    <Select value={formData.bankId || ''} onChange={(e) => setFormData({ ...formData, bankId: e.target.value })} required>
                      <option value="">Selecione</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>{bank.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Fornecedor</Label>
                    <Select value={formData.personId || ''} onChange={(e) => setFormData({ ...formData, personId: e.target.value })} required>
                      <option value="">Selecione</option>
                      {persons.map((person) => (
                        <option key={person.id} value={person.id}>{person.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input type="number" step="0.01" value={formData.valor || ''} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Data Vencimento</Label>
                    <Input type="date" value={formData.dataVencimento || ''} onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Label>Descrição</Label>
                    <Input value={formData.descricao || ''} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowModal(false);
                    setFormData({});
                  }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showPayModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Dar Baixa</h2>
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <Label>Data Pagamento</Label>
                  <Input type="date" value={formData.dataPagamento || ''} onChange={(e) => setFormData({ ...formData, dataPagamento: e.target.value })} required />
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Input value={formData.formaPagamento || ''} onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Confirmar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowPayModal(false);
                    setSelectedAccount(null);
                    setFormData({});
                  }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

