import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface GSIGroup {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  subgroups: GSISubgroup[];
}

interface GSISubgroup {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  groupId: string;
  items: GSIItem[];
}

interface GSIItem {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  subgroupId: string;
}

export default function GSI() {
  const [groups, setGroups] = useState<GSIGroup[]>([]);
  const [subgroups, setSubgroups] = useState<GSISubgroup[]>([]);
  const [items, setItems] = useState<GSIItem[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'subgroups' | 'items'>('groups');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
    if (activeTab === 'subgroups' || activeTab === 'items') {
      loadGroups();
    }
    if (activeTab === 'items') {
      loadSubgroups();
    }
  }, [activeTab]);

  const loadGroups = async () => {
    try {
      const res = await api.get('/gsi/groups');
      setGroups(res.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const loadSubgroups = async () => {
    try {
      const res = await api.get('/gsi/subgroups');
      setSubgroups(res.data);
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
    }
  };

  const loadData = async () => {
    try {
      if (activeTab === 'groups') {
        const res = await api.get('/gsi/groups');
        setGroups(res.data);
      } else if (activeTab === 'subgroups') {
        const res = await api.get('/gsi/subgroups');
        setSubgroups(res.data);
      } else {
        const res = await api.get('/gsi/items');
        setItems(res.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'groups') {
        if (editing) {
          await api.patch(`/gsi/groups/${editing.id}`, formData);
        } else {
          await api.post('/gsi/groups', formData);
        }
      } else if (activeTab === 'subgroups') {
        if (editing) {
          await api.patch(`/gsi/subgroups/${editing.id}`, formData);
        } else {
          await api.post('/gsi/subgroups', formData);
        }
      } else {
        if (editing) {
          await api.patch(`/gsi/items/${editing.id}`, formData);
        } else {
          await api.post('/gsi/items', formData);
        }
      }
      setShowModal(false);
      setEditing(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      if (activeTab === 'groups') {
        await api.delete(`/gsi/groups/${id}`);
      } else if (activeTab === 'subgroups') {
        await api.delete(`/gsi/subgroups/${id}`);
      } else {
        await api.delete(`/gsi/items/${id}`);
      }
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GSI - Plano Financeiro</h1>
          <p className="text-gray-500 mt-1">Gerencie grupos, subgrupos e itens</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'groups' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
          }`}
        >
          Grupos
        </button>
        <button
          onClick={() => setActiveTab('subgroups')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'subgroups' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
          }`}
        >
          Subgrupos
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'items' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
          }`}
        >
          Itens
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {activeTab === 'groups' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.codigo}</TableCell>
                    <TableCell>{group.nome}</TableCell>
                    <TableCell>{group.descricao || '-'}</TableCell>
                    <TableCell>{group.ativo ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(group);
                            setFormData(group);
                            setShowModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(group.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'subgroups' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subgroups.map((subgroup) => (
                  <TableRow key={subgroup.id}>
                    <TableCell>{subgroup.codigo}</TableCell>
                    <TableCell>{subgroup.nome}</TableCell>
                    <TableCell>{subgroup.group?.nome || '-'}</TableCell>
                    <TableCell>{subgroup.ativo ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(subgroup);
                            setFormData(subgroup);
                            setShowModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(subgroup.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'items' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.codigo}</TableCell>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.subgroup?.nome || '-'}</TableCell>
                    <TableCell>{item.ativo ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(item);
                            setFormData(item);
                            setShowModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editing ? 'Editar' : 'Adicionar'} {activeTab === 'groups' ? 'Grupo' : activeTab === 'subgroups' ? 'Subgrupo' : 'Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'subgroups' && (
                  <div>
                    <Label>Grupo</Label>
                    <Select
                      value={formData.groupId || ''}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      required
                    >
                      <option value="">Selecione um grupo</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.codigo} - {g.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                {activeTab === 'items' && (
                  <div>
                    <Label>Subgrupo</Label>
                    <Select
                      value={formData.subgroupId || ''}
                      onChange={(e) => setFormData({ ...formData, subgroupId: e.target.value })}
                      required
                    >
                      <option value="">Selecione um subgrupo</option>
                      {subgroups.map((sg) => (
                        <option key={sg.id} value={sg.id}>
                          {sg.codigo} - {sg.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Código</Label>
                  <Input
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    setFormData({});
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

