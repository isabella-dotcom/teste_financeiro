import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Person {
  id: string;
  tipo: 'PACIENTE' | 'FORNECEDOR' | 'CONVENIO' | 'MEDICO';
  nome: string;
  documento?: string;
  observacao?: string;
}

export default function Persons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [formData, setFormData] = useState<Partial<Person>>({});

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      const res = await api.get('/persons');
      setPersons(res.data);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/persons/${editing.id}`, formData);
      } else {
        await api.post('/persons', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({});
      loadPersons();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/persons/${id}`);
      loadPersons();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pessoas</h1>
          <p className="text-gray-500 mt-1">Gerencie pacientes, fornecedores, convênios e médicos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pessoa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>{person.tipo}</TableCell>
                  <TableCell>{person.nome}</TableCell>
                  <TableCell>{person.documento || '-'}</TableCell>
                  <TableCell>{person.observacao || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditing(person);
                        setFormData(person);
                        setShowModal(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(person.id)}>
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
              <CardTitle>{editing ? 'Editar' : 'Adicionar'} Pessoa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={formData.tipo || ''} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })} required>
                    <option value="">Selecione</option>
                    <option value="PACIENTE">Paciente</option>
                    <option value="FORNECEDOR">Fornecedor</option>
                    <option value="CONVENIO">Convênio</option>
                    <option value="MEDICO">Médico</option>
                  </Select>
                </div>
                <div>
                  <Label>Nome</Label>
                  <Input value={formData.nome || ''} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
                </div>
                <div>
                  <Label>Documento</Label>
                  <Input value={formData.documento || ''} onChange={(e) => setFormData({ ...formData, documento: e.target.value })} />
                </div>
                <div>
                  <Label>Observação</Label>
                  <Input value={formData.observacao || ''} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
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

