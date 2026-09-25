@extends('layouts.app')

@section('title', 'Panel Super Administrador')

@section('content')
<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-gray-900">Panel Super Administrador</h1>
                    <p class="text-xs text-gray-500">Generador Inteligente de Horarios</p>
                </div>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Cerrar Sesión
                </button>
            </form>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Clientes</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['total_clients'] }}</p>
                    </div>
                    <span class="text-3xl">👥</span>
                </div>
            </div>

            <div class="bg-green-50 rounded-xl p-5 border border-green-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Licencias Activas</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['active_licenses'] }}</p>
                    </div>
                    <span class="text-3xl">✅</span>
                </div>
            </div>

            <div class="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Licencias Vencidas</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['expired_licenses'] }}</p>
                    </div>
                    <span class="text-3xl">⚠️</span>
                </div>
            </div>

            <div class="bg-purple-50 rounded-xl p-5 border border-purple-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Instituciones</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['total_institutions'] }}</p>
                    </div>
                    <span class="text-3xl">🏫</span>
                </div>
            </div>
        </div>

        <!-- Recent Clients -->
        <div class="bg-white rounded-xl shadow-sm border">
            <div class="p-4 border-b flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-900">Clientes Recientes</h2>
                <a href="{{ route('admin.clients') }}" class="text-sm text-indigo-600 hover:text-indigo-800">Ver todos →</a>
            </div>
            <div class="divide-y">
                @forelse($recentClients as $client)
                    <div class="p-4 hover:bg-gray-50 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span class="text-indigo-600 font-semibold">{{ substr($client->name, 0, 1) }}</span>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">{{ $client->name }}</p>
                                <p class="text-xs text-gray-500">{{ $client->email }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            @if($client->license)
                                <span class="px-2 py-1 rounded-full text-xs font-medium 
                                    {{ $client->license->status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                    {{ $client->license->type_name }}
                                </span>
                            @else
                                <span class="text-xs text-gray-400">Sin licencia</span>
                            @endif
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center text-gray-500">No hay clientes registrados</div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
