import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HubCard from './components/HubCard'
import DiscResults from './pages/public/DiscResults'
import DiscForm from './pages/public/DiscForm'
import DiscManager from './pages/rh/DiscManager'

// ==========================================
// PÁGINA HOME (HUB)
// ==========================================
function Home() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('@ConectaRH:user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.name) {
          setFirstName(user.name.split(' ')[0]);
        }
      }
    } catch(err) {}
  }, []);

  const mockCards = [
    {
      id: 1,
      title: 'Gestão de Treinamentos',
      description: 'Crie, controle e avalie os treinamentos presenciais e online da empresa.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      action: () => navigate('/treinamentos')
    },
    {
      id: 2,
      title: 'DISC',
      description: 'Sistema para geração e controle de relatórios DISC do RH.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => navigate('/rh/disc-manager')
    },
    {
      id: 3,
      title: 'OffBoarding',
      description: 'Gerencie o processo de desligamento de colaboradores.',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => navigate('/disc-results')
    }
  ]

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Olá{firstName ? `, ${firstName}` : ''}. <span className="text-gray-400">O que você quer fazer hoje?</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCards.map((card) => (
          <HubCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            onClick={card.action}
          />
        ))}
      </div>
    </main>
  )
}

// ==========================================
// PÁGINA DASHBOARD TREINAMENTOS
// ==========================================
function TreinamentosDashboard() {
  const navigate = useNavigate()

  // Estado da Lista de Treinamentos (Cache no LocalStorage)
  const [treinamentos, setTreinamentos] = useState(() => {
    const saved = localStorage.getItem('conectarh_treinamentos')
    return saved ? JSON.parse(saved) : []
  })

  // Controle de Tela (Lista ou Formulário de Criação)
  const [isCreating, setIsCreating] = useState(false)

  // Estados do Formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [duracao, setDuracao] = useState('')
  const [participantes, setParticipantes] = useState([]) // Participantes Selecionados

  // Estados da Busca Protheus
  const [busca, setBusca] = useState('')
  const [resultadosBusca, setResultadosBusca] = useState([])
  const [loadingBusca, setLoadingBusca] = useState(false)
  const debounceRef = useRef(null)

  // Salva no LocalStorage sempre que a lista de treinamentos muda
  useEffect(() => {
    localStorage.setItem('conectarh_treinamentos', JSON.stringify(treinamentos))
  }, [treinamentos])

  // Lógica de Busca API Protheus com Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!busca.trim()) {
      setResultadosBusca([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingBusca(true)
      try {
        const response = await axios.get(
          'http://localhost:3001/api/funcionarios?busca=' + encodeURIComponent(busca.trim())
        )
        if (response.data.sucesso) {
          const items = response.data.dados?.items || response.data.dados || []
          // Filtra para nao aparecer quem já está selecionado
          const filtered = (Array.isArray(items) ? items : []).filter(
            func => !participantes.some(p => p.code === func.code)
          )
          setResultadosBusca(filtered)
        }
      } catch (err) {
        console.error('Erro na busca API:', err)
      } finally {
        setLoadingBusca(false)
      }
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [busca, participantes])

  const adicionarParticipante = (func) => {
    setParticipantes(prev => [...prev, func])
    setBusca('') // Limpa busca
    setResultadosBusca([]) // Fecha dropdown
  }

  const removerParticipante = (code) => {
    setParticipantes(prev => prev.filter(p => p.code !== code))
  }

  const handleSalvarTreinamento = (e) => {
    e.preventDefault()
    if (!nome.trim()) return alert('O nome do treinamento é obrigatório.')

    const novoTreinamento = {
      id: Date.now(),
      titulo: nome,
      descricao,
      duracao,
      participantes,
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'Planejado'
    }

    setTreinamentos([novoTreinamento, ...treinamentos])

    // Reset Form & voltar
    setNome('')
    setDescricao('')
    setDuracao('')
    setParticipantes([])
    setIsCreating(false)
  }

  // ===============================================
  // View: Formulário de Novo Treinamento
  // ===============================================
  if (isCreating) {
    return (
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => setIsCreating(false)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Lista
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Novo Treinamento</h2>

        <form onSubmit={handleSalvarTreinamento} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:p-8 space-y-6">
          {/* Nome e Duração */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Treinamento *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Integração Segurança NR-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Duração</label>
              <input
                type="text"
                value={duracao}
                onChange={e => setDuracao(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: 4 horas"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows="3"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Descreva o escopo e objetivo do treinamento..."
            ></textarea>
          </div>

          {/* Seção de Participantes (Busca API) */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Participantes</h3>

            <div className="relative mb-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Pesquisar funcionário pelo nome para adicionar..."
              />
              {loadingBusca && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              )}

              {/* Lista Suspesa (Dropdown) de Resultados */}
              {resultadosBusca.length > 0 && (
                <ul className="absolute z-20 top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-700">
                  {resultadosBusca.map(func => (
                    <li
                      key={func.code}
                      onClick={() => adicionarParticipante(func)}
                      className="px-4 py-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <span className="text-gray-200 text-sm font-medium">{func.name}</span>
                      <span className="text-gray-500 text-xs font-mono">{func.code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Chips de Participantes Selecionados */}
            {participantes.length > 0 ? (
              <div className="flex flex-wrap gap-2 bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                {participantes.map(p => (
                  <div key={p.code} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5">
                    <span className="text-xs text-gray-200 font-medium">{p.name.split(' ')[0]}</span>
                    <button
                      type="button"
                      onClick={() => removerParticipante(p.code)}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Nenhum participante adicionado ainda.</p>
            )}
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#0056D2] hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Salvar Treinamento
            </button>
          </div>
        </form>
      </main>
    )
  }

  // ===============================================
  // View: Dashboard Principal (Lista)
  // ===============================================
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
      {/* Botão Voltar para o Hub */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar para o Hub
      </button>

      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            Gestão de Treinamentos
          </h2>
          <p className="text-gray-400">
            Acompanhe as turmas abertas e crie novos eventos corporativos.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-[#0056D2] hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap cursor-pointer flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Treinamento
        </button>
      </div>

      {/* Lista de Treinamentos Real */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-h-[300px]">
        <div className="px-6 py-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
          <h3 className="font-medium text-gray-200">Treinamentos Cadastrados</h3>
          <span className="text-xs text-gray-500 font-mono">{treinamentos.length} encontrado(s)</span>
        </div>

        {treinamentos.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 mb-4 flex items-center justify-center text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-300 mb-1">Nenhum treinamento criado</h4>
            <p className="text-gray-500 text-sm max-w-sm">Você ainda não criou nenhum evento de treinamento. Clique no botão azul acima para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {treinamentos.map((t) => (
              <div key={t.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">{t.titulo}</h4>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">{t.descricao}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {t.duracao && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.duracao}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.data}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {t.participantes?.length || 0} inscritos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {t.status}
                  </span>

                  <button className="text-[#0056D2] hover:text-blue-400 text-sm font-medium transition-colors cursor-pointer">
                    Gerenciar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

import Login from './pages/rh/Login'
import { Navigate, Outlet } from 'react-router-dom'

// ==========================================
// ROTA PROTEGIDA (Requer Login)
// ==========================================
function ProtectedRoute() {
  const token = localStorage.getItem('@ConectaRH:access_token')
  if (!token) {
    // Se não tiver token, redireciona para o login passando a mensagem de erro no state
    return <Navigate to="/rh/login" replace state={{ error: 'Por segurança, o login é obrigatório para acessar esta página.' }} />
  }
  return <Outlet />
}

// ==========================================
// APP COMPONENT (ROUTER)
// ==========================================
function AppContent() {
  const location = useLocation()

  // Condições para esconder o Header Global
  const hideHeaderRoutes = ['/rh/login', '/rh/login/']
  const isPublicDiscForm = location.pathname.startsWith('/disc/responder/')
  const shouldShowLayout = !hideHeaderRoutes.includes(location.pathname) && !isPublicDiscForm

  if (!shouldShowLayout) {
    // Retorna apenas as rotas (sem barra lateral/header)
    return (
      <div className="min-h-screen bg-gray-950 font-sans text-gray-100 flex flex-col">
        <Routes>
          <Route path="/rh/login" element={<Login />} />
          <Route path="/disc/responder/:token" element={<DiscForm />} />
          <Route path="/disc/responder/:token/resultados" element={<DiscResults />} />
        </Routes>
      </div>
    )
  }

  // Layout do Dashboard Interno
  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 flex">
      {/* Sidebar Lateral */}
      <Sidebar />

      {/* Área Principal Direita */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/treinamentos" element={<TreinamentosDashboard />} />
              <Route path="/rh/disc-manager" element={<DiscManager />} />
              <Route path="/disc-results" element={<DiscResults />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
