import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Bank {
  id: string;
  nome: string;
  codigo: string;
  agencia: string;
  conta: string;
  tipo: string;
  ativo: boolean;
}

export default function Banks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);
  const [formData, setFormData] = useState<Partial<Bank>>({});

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const res = await api.get('/banks');
      setBanks(res.data);
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/banks/${editing.id}`, formData);
      } else {
        await api.post('/banks', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({});
      loadBanks();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/banks/${id}`);
      loadBanks();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bancos</h1>
          <p className="text-gray-500 mt-1">Gerencie os bancos do sistema</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Banco
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell>{bank.nome}</TableCell>
                  <TableCell>{bank.codigo}</TableCell>
                  <TableCell>{bank.agencia}</TableCell>
                  <TableCell>{bank.conta}</TableCell>
                  <TableCell>{bank.tipo}</TableCell>
                  <TableCell>{bank.ativo ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditing(bank);
                        setFormData(bank);
                        setShowModal(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(bank.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editing ? 'Editar' : 'Adicionar'} Banco</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
                </div>
                <div>
                  <Label>Código</Label>
                  <Input value={formData.codigo || ''} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required />
                </div>
                <div>
                  <Label>Agência</Label>
                  <Input value={formData.agencia || ''} onChange={(e) => setFormData({ ...formData, agencia: e.target.value })} required />
                </div>
                <div>
                  <Label>Conta</Label>
                  <Input value={formData.conta || ''} onChange={(e) => setFormData({ ...formData, conta: e.target.value })} required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input value={formData.tipo || ''} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowModal(false);
                    setEditing(null);
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

