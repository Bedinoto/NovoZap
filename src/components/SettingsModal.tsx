import React from 'react';
import { X, Save, Shield, Globe, Key, RefreshCw, LogOut } from 'lucide-react';
import { UazapiConfig } from '../types';
import { UazapiService } from '../services/uazapiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UazapiConfig;
  onSave: (config: UazapiConfig) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: SettingsModalProps) {
  const [formData, setFormData] = React.useState<UazapiConfig>(config);
  const [status, setStatus] = React.useState<string>('unknown');
  const [loading, setLoading] = React.useState(false);
  const [instances, setInstances] = React.useState<any[]>([]);
  const [showInstanceList, setShowInstanceList] = React.useState(false);

  React.useEffect(() => {
    setFormData(config);
    if (config.apiKey && config.instanceId) {
      checkStatus();
    }
  }, [config, isOpen]);

  const checkStatus = async () => {
    if (!formData.apiKey || !formData.instanceId) return;
    setLoading(true);
    try {
      const uazapi = new UazapiService(formData);
      const res = await uazapi.getInstanceStatus();
      setStatus(res.instance.state || 'disconnected');
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async () => {
    if (!formData.apiKey || !formData.baseUrl) {
      alert('Por favor, preencha a Base URL e a API Key primeiro.');
      return;
    }
    setLoading(true);
    try {
      const uazapi = new UazapiService(formData);
      const res = await uazapi.fetchInstances();
      setInstances(res || []);
      setShowInstanceList(true);
    } catch (error) {
      alert('Erro ao buscar instâncias. Verifique a URL e a Key.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Tem certeza que deseja deslogar a instância?')) return;
    setLoading(true);
    try {
      const uazapi = new UazapiService(formData);
      await uazapi.logoutInstance();
      setStatus('disconnected');
      alert('Instância deslogada com sucesso.');
    } catch (error) {
      alert('Erro ao deslogar instância.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex items-center justify-between bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h2 className="font-bold">Configurações Uazapi</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              status === 'open' ? 'bg-emerald-500' : 
              status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium text-gray-700 uppercase">
              Status: {status}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={checkStatus} 
              disabled={loading}
              className="p-1.5 hover:bg-gray-200 rounded transition text-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {status === 'open' && (
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="p-1.5 hover:bg-red-100 rounded transition text-red-600 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Base URL
            </label>
            <input
              type="text"
              placeholder="https://api.uazapi.com"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <input
              type="password"
              placeholder="Sua chave de API"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Instance ID
              </div>
              <button 
                type="button"
                onClick={fetchInstances}
                className="text-[10px] text-emerald-600 hover:underline font-bold"
              >
                Listar Instâncias
              </button>
            </label>
            <input
              type="text"
              placeholder="ID da instância"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={formData.instanceId}
              onChange={(e) => setFormData({ ...formData, instanceId: e.target.value })}
              required
            />
          </div>

          {showInstanceList && instances.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg border max-h-32 overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Selecione uma instância:</p>
              <div className="grid grid-cols-1 gap-1">
                {instances.map((item: any) => {
                  const inst = item.instance || item;
                  const id = inst.instanceId || inst.id;
                  const name = inst.instanceName || inst.name;
                  const status = inst.status || inst.state;
                  
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, instanceId: name });
                        setShowInstanceList(false);
                      }}
                      className="text-left px-3 py-1.5 text-xs hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition flex justify-between items-center"
                    >
                      <span className="font-medium">{name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
