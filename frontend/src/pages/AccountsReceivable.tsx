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

export default function AccountsReceivable() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [gsiItems, setGsiItems] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, banksRes, gsiRes, personsRes] = await Promise.all([
        api.get('/accounts-receivable'),
        api.get('/banks'),
        api.get('/gsi/items'),
        api.get('/persons'),
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
        await api.patch(`/accounts-receivable/${formData.id}`, formData);
      } else {
        await api.post('/accounts-receivable', formData);
      }
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/accounts-receivable/${selectedAccount.id}/receive`, formData);
      setShowReceiveModal(false);
      setSelectedAccount(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Erro ao receber:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Receber</h1>
          <p className="text-gray-500 mt-1">Gerencie as contas a receber</p>
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
                <TableHead>Pessoa</TableHead>
                <TableHead>Valor Previsto</TableHead>
                <TableHead>Valor Recebido</TableHead>
                <TableHead>Valor Glosa</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.person?.nome}</TableCell>
                  <TableCell>R$ {Number(account.valorPrevisto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>R$ {Number(account.valorRecebido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>R$ {Number(account.valorGlosa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{format(new Date(account.dataPrevista), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.status === 'RECEBIDO' ? 'bg-green-100 text-green-800' :
                      account.status === 'GLOSADO' ? 'bg-red-100 text-red-800' :
                      account.status === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {account.status !== 'RECEBIDO' && account.status !== 'GLOSADO' && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedAccount(account);
                        setShowReceiveModal(true);
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
              <h2 className="text-xl font-bold mb-4">Adicionar Conta a Receber</h2>
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
                    <Label>Pessoa</Label>
                    <Select value={formData.personId || ''} onChange={(e) => setFormData({ ...formData, personId: e.target.value })} required>
                      <option value="">Selecione</option>
                      {persons.map((person) => (
                        <option key={person.id} value={person.id}>{person.nome}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Origem</Label>
                    <Select value={formData.origem || ''} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} required>
                      <option value="">Selecione</option>
                      <option value="PACIENTE">Paciente</option>
                      <option value="CONVENIO">Convênio</option>
                      <option value="ENCONTRO_CONTAS">Encontro de Contas</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor Previsto</Label>
                    <Input type="number" step="0.01" value={formData.valorPrevisto || ''} onChange={(e) => setFormData({ ...formData, valorPrevisto: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Data Prevista</Label>
                    <Input type="date" value={formData.dataPrevista || ''} onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })} required />
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

      {showReceiveModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Receber</h2>
              <form onSubmit={handleReceive} className="space-y-4">
                <div>
                  <Label>Valor Recebido</Label>
                  <Input type="number" step="0.01" value={formData.valorRecebido || ''} onChange={(e) => setFormData({ ...formData, valorRecebido: e.target.value })} required />
                </div>
                <div>
                  <Label>Valor Glosa (opcional)</Label>
                  <Input type="number" step="0.01" value={formData.valorGlosa || ''} onChange={(e) => setFormData({ ...formData, valorGlosa: e.target.value })} />
                </div>
                <div>
                  <Label>Data Recebimento</Label>
                  <Input type="date" value={formData.dataRecebimento || ''} onChange={(e) => setFormData({ ...formData, dataRecebimento: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Confirmar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowReceiveModal(false);
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

