import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { LicenseType } from '../types';

const LICENSE_PRICES: Record<LicenseType, { price: number; maxInst: number; name: string; lifetime: boolean }> = {
  basic: { price: 20, maxInst: 2, name: 'Básica', lifetime: false },
  professional: { price: 100, maxInst: 5, name: 'Profesional', lifetime: true },
  consultant: { price: 150, maxInst: 10, name: 'Consultor', lifetime: true },
};

export function SuperAdminPanel() {
  const { users, licenses, institutions, createLicense, updateLicense, suspendLicense, activateLicense, assignLicense, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'licenses' | 'clients' | 'institutions' | 'pricing'>('dashboard');
  const [showCreateLicense, setShowCreateLicense] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState<LicenseType>('basic');
  const [assignModal, setAssignModal] = useState<{ userId: string } | null>(null);

  const regularUsers = users.filter(u => u.role === 'user');
  const activeLicenses = licenses.filter(l => l.status === 'active');
  const expiredLicenses = licenses.filter(l => l.status === 'expired');

  const handleCreateLicense = () => {
    const config = LICENSE_PRICES[selectedLicenseType];
    createLicense({
      type: selectedLicenseType,
      maxInstitutions: config.maxInst,
      status: 'active',
      purchaseDate: new Date().toISOString(),
      expiryDate: config.lifetime ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      price: config.price,
      isLifetime: config.lifetime
    });
    setShowCreateLicense(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Panel Super Administrador</h1>
              <p className="text-xs text-gray-500">Generador Inteligente de Horarios</p>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'licenses', label: 'Licencias', icon: '🔑' },
            { key: 'clients', label: 'Clientes', icon: '👥' },
            { key: 'institutions', label: 'Instituciones', icon: '🏫' },
            { key: 'pricing', label: 'Planes', icon: '💰' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Clientes" value={regularUsers.length} icon="👥" color="blue" />
            <StatCard title="Licencias Activas" value={activeLicenses.length} icon="✅" color="green" />
            <StatCard title="Licencias Vencidas" value={expiredLicenses.length} icon="⚠️" color="yellow" />
            <StatCard title="Instituciones" value={institutions.length} icon="🏫" color="purple" />
          </div>
        )}

        {/* Licenses */}
        {activeTab === 'licenses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gestión de Licencias</h2>
              <button
                onClick={() => setShowCreateLicense(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                + Nueva Licencia
              </button>
            </div>

            {showCreateLicense && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-4 border">
                <h3 className="font-semibold text-gray-900 mb-4">Crear Nueva Licencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {(Object.keys(LICENSE_PRICES) as LicenseType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedLicenseType(type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedLicenseType === type
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{LICENSE_PRICES[type].name}</p>
                      <p className="text-2xl font-bold text-indigo-600">${LICENSE_PRICES[type].price}</p>
                      <p className="text-sm text-gray-500">{LICENSE_PRICES[type].maxInst} instituciones</p>
                      <p className="text-xs text-gray-400">{LICENSE_PRICES[type].lifetime ? 'Pago único' : 'Por año lectivo'}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateLicense} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    Crear Licencia
                  </button>
                  <button onClick={() => setShowCreateLicense(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instituciones</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {licenses.map(license => (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{LICENSE_PRICES[license.type].name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{license.maxInstitutions}</td>
                      <td className="px-4 py-3 text-gray-600">${license.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          license.status === 'active' ? 'bg-green-100 text-green-700' :
                          license.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {license.status === 'active' ? 'Activa' : license.status === 'suspended' ? 'Suspendida' : 'Vencida'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {license.status === 'active' && (
                            <button onClick={() => suspendLicense(license.id)} className="text-xs text-yellow-600 hover:text-yellow-800">Suspender</button>
                          )}
                          {license.status !== 'active' && (
                            <button onClick={() => activateLicense(license.id)} className="text-xs text-green-600 hover:text-green-800">Activar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay licencias creadas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Clientes Registrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularUsers.map(user => (
                <div key={user.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    {user.license ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Licencia: <strong>{LICENSE_PRICES[user.license.type].name}</strong></span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          user.license.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{user.license.status}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssignModal({ userId: user.id })}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Asignar licencia →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {regularUsers.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">No hay clientes registrados</div>
              )}
            </div>

            {assignModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Asignar Licencia</h3>
                  <div className="space-y-2">
                    {licenses.filter(l => l.status === 'active').map(license => (
                      <button
                        key={license.id}
                        onClick={() => { assignLicense(assignModal.userId, license.id); setAssignModal(null); }}
                        className="w-full p-3 border rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                      >
                        <p className="font-medium">{LICENSE_PRICES[license.type].name}</p>
                        <p className="text-sm text-gray-500">{license.maxInstitutions} instituciones - ${license.price}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setAssignModal(null)} className="mt-4 w-full py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Institutions */}
        {activeTab === 'institutions' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Todlas las Instituciones</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año Lectivo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {institutions.map(inst => {
                    const owner = users.find(u => u.id === inst.userId);
                    return (
                      <tr key={inst.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{inst.name}</td>
                        <td className="px-4 py-3 text-gray-600">{inst.code}</td>
                        <td className="px-4 py-3 text-gray-600">{inst.academicYear}</td>
                        <td className="px-4 py-3 text-gray-600">{owner?.name || 'N/A'}</td>
                      </tr>
                    );
                  })}
                  {institutions.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay instituciones registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        {activeTab === 'pricing' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Planes y Precios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="text-center">
                  <span className="text-3xl">📋</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-3">Licencia Básica</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-indigo-600">$20</span>
                    <span className="text-gray-500">/año lectivo</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-left">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Hasta 2 instituciones
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Horarios ilimitados
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Registro de docentes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Registro de materias
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Exportar horarios
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-center">
                  <span className="text-3xl">⭐</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-3">Licencia Profesional</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-indigo-600">$100</span>
                    <span className="text-gray-500">/pago único</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-left">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Hasta 5 instituciones
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Uso indefinido
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Generación ilimitada
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Todos los reportes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Soporte prioritario
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="text-center">
                  <span className="text-3xl">🏢</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-3">Licencia Consultor</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-indigo-600">$150</span>
                    <span className="text-gray-500">/pago único</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-left">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Hasta 10 instituciones
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Uso indefinido
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Ideal para consultores
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Multi-institución
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span> Soporte dedicado
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-2">Modelo de Licenciamiento</h3>
              <p className="text-sm text-indigo-700">
                El software funciona bajo un modelo de licencias controlado por el propietario. Cada licencia permite al usuario crear y administrar un número determinado de instituciones educativas de forma independiente. Los datos de cada institución están completamente separados y protegidos.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500">Ingresos por licencia</p>
                  <p className="text-lg font-bold text-indigo-700">${licenses.reduce((acc, l) => acc + l.price, 0)}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500">Licencias vendidas</p>
                  <p className="text-lg font-bold text-indigo-700">{licenses.length}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500">Instituciones activas</p>
                  <p className="text-lg font-bold text-indigo-700">{institutions.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  return (
    <div className={`rounded-xl p-5 border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
